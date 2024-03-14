class LandingPage {
  constructor() {
    this.landingPage = document.querySelector(".landing-page");
    this.labelWelcome = document.querySelector(".welcome");
    this.labelDate = document.querySelector(".date");
    this.labelBalance = document.querySelector(".balance__value");
    this.labelSumIn = document.querySelector(".summary__value--in");
    this.labelSumOut = document.querySelector(".summary__value--out");
    this.labelSumInterest = document.querySelector(".summary__value--interest");
    this.labelTimer = document.querySelector(".timer");
    this.btnTransfer = document.querySelector(".form__btn--transfer");
    this.btnLoan = document.querySelector(".form__btn--loan");
    this.btnClose = document.querySelector(".form__btn--close");
    this.dropdownSort = document.querySelector(".dropdown--sort");
    this.inputTransferTo = document.querySelector(".form__input--to");
    this.inputTransferAmount = document.querySelector(".form__input--amount");
    this.inputLoanAmount = document.querySelector(".form__input--loan-amount");
    this.overlay = document.querySelector(".overlay");
    this.customMessage = document.querySelector(".custom-message");
    this.customMessageBox = document.querySelector(".custom-message-box");
    this.customMessageOkayButton = document.querySelector(
      ".custom-message__btn"
    );
    this.spinnerContainer = document.querySelector(".spinner-container");
    this.containerMovements = document.querySelector(".movements");

    this.userData = null;
    this.timer = null;

    this.getUserData = this.getUserData.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.updateMovements = this.updateMovements.bind(this);
    this.displayMovements = this.displayMovements.bind(this);
    this.handleLoan = this.handleLoan.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
    this.handleCloseAccount = this.handleCloseAccount.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.displaySpinner = this.displaySpinner.bind(this);
    this.removeSpinner = this.removeSpinner.bind(this);
    this.showAlert = this.showAlert.bind(this);
    this.hideAlert = this.hideAlert.bind(this);
    this.startLogOutTimer = this.startLogOutTimer.bind(this);
    this.fadeOut = this.fadeOut.bind(this);

    this.btnLoan.addEventListener("click", this.handleLoan);
    this.btnTransfer.addEventListener("click", this.handleTransfer);
    this.btnClose.addEventListener("click", this.handleCloseAccount);
    this.dropdownSort.addEventListener("change", this.handleSortChange);

    this.overlay.addEventListener("click", this.hideAlert);
    this.customMessageOkayButton.addEventListener("click", this.hideAlert);

    this.updateData();
  }

  getUserData() {
    fetch("/get_user_data")
      .then((response) => response.json())
      .then((data) => {
        this.userData = data;
        this.updateUI(this.userData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }

  updateUI(data) {
    this.landingPage.style.opacity = 1;
    this.labelBalance.textContent = `$${data["user_data"][0].current_balance}`;

    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };

    this.labelDate.textContent = new Intl.DateTimeFormat(
      undefined,
      options
    ).format(now);

    if (this.timer) clearInterval(this.timer);
    this.timer = this.startLogOutTimer();
  }

  updateMovements(sort) {
    fetch("/movements", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to fetch movements");
        }
      })
      .then((data) => {
        this.displayMovements(data, sort);
      })
      .catch((error) => {
        console.error("Error fetching movements:", error);
      });
  }

  displayMovements(data, sort) {
    this.containerMovements.innerHTML = "";
    let mov;
    if (sort)
      mov = data.user_movements.filter((m) => m.transaction_type === sort);
    else mov = data.user_movements;
    mov.forEach((mov, i) => {
      const html = `<div class="movements__row">
      <div class="movements__type movements__type--${mov.transaction_type}">${
        i + 1
      } ${mov.transaction_type}</div>
      <div class="movements__date">${mov.transaction_date}</div>
      <div class="movements__value">$${mov.transaction_amount}</div>
    </div>`;

      this.containerMovements.insertAdjacentHTML("afterbegin", html);
    });

    this.labelSumIn.textContent = mov
      .filter((input) => input.transaction_type === "deposit")
      .reduce((acc, cur) => acc + cur.transaction_amount, 0);

    this.labelSumOut.textContent = mov
      .filter((input) => input.transaction_type === "withdraw")
      .reduce((acc, cur) => acc + cur.transaction_amount, 0);

    this.labelSumInterest.textContent = Math.trunc(
      (this.labelSumIn.textContent / 100) * 2.8
    );
  }

  handleLoan(e) {
    e.preventDefault();
    const loanAmount = Number(this.inputLoanAmount.value);

    fetch("/request_loan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: loanAmount }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((data) => {
            this.showAlert(data.message || "Loan Denied");
            throw new Error(data.message || "Loan Denied");
          });
        }
      })
      .then((data) => {
        if (data.success) {
          this.showAlert(data.message, data.success, () => {
            this.updateData();
          });
        } else {
          this.showAlert(data.message || "Loan Denied");
          throw new Error(data.message || "Loan Denied");
        }
      })
      .catch((error) => {
        console.error("Error getting loan:", error);
      });

    this.inputLoanAmount.value = "";
  }

  handleTransfer(e) {
    e.preventDefault();
    const amount = Number(this.inputTransferAmount.value);
    const recipient = this.inputTransferTo.value;

    fetch("/transfer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipient: recipient, amount: amount }),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          return response.json().then((data) => {
            this.showAlert(data.message || "Transfer Denied");
            throw new Error(data.message || "Transfer Denied");
          });
        }
      })
      .then((data) => {
        if (data.success) {
          this.showAlert(data.message, data.success, () => {
            this.updateData();
          });
        } else {
          this.showAlert(data.message || "Transfer Denied");
          throw new Error(data.message || "Transfer Denied");
        }
      })
      .catch((error) => {
        console.error("Error transferring money:", error);
      });

    this.inputTransferTo.value = "";
    this.inputTransferAmount.value = "";

    clearInterval(this.timer);
    this.timer = this.startLogOutTimer();
  }

  handleCloseAccount(e) {
    e.preventDefault();

    fetch("/close_account", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Failed to delete account");
        }
      })
      .then((data) => {
        if (data.success && data.redirect_url) {
          this.showAlert(data.message, data.success, () => {
            window.location.href = data.redirect_url;
          });
        } else {
          throw new Error("Failed to delete account");
        }
      })
      .catch((error) => {
        console.error("Error closing account:", error);
      });
  }

  handleSortChange() {
    const selectedValue = this.dropdownSort.value;
    switch (selectedValue) {
      case "all":
        this.updateMovements(false);
        break;
      case "deposit":
        this.updateMovements("deposit");
        break;
      case "withdraw":
        this.updateMovements("withdraw");
        break;
      default:
        this.updateMovements(false);
    }
  }

  displaySpinner() {
    this.overlay.classList.remove("hidden");
    this.spinnerContainer.classList.remove("hidden");
  }

  removeSpinner() {
    this.spinnerContainer.classList.add("hidden");
  }

  showAlert(message, success, callback) {
    this.displaySpinner();
    setTimeout(() => {
      this.customMessage.textContent = message;
      if (success) {
        this.customMessageOkayButton.innerHTML = "&check;";
        this.customMessageOkayButton.style.color = "green";
      } else {
        this.customMessageOkayButton.innerHTML = "&times;";
        this.customMessageOkayButton.style.color = "red";
      }
      setTimeout(() => {
        this.removeSpinner();
        this.customMessageOkayButton.focus();
        this.customMessageOkayButton.addEventListener("click", (e) => {
          e.preventDefault();
          callback();
        });
      }, 1000);
      this.customMessageBox.classList.remove("hidden");
    }, 100);
  }

  hideAlert() {
    this.overlay.classList.add("hidden");
    this.customMessageBox.classList.add("hidden");
  }

  startLogOutTimer() {
    const tick = () => {
      const min = String(Math.trunc(this.time / 60)).padStart(2, "0");
      const sec = String(this.time % 60).padStart(2, "0");
      this.labelTimer.textContent = `${min}:${sec}`;
      if (this.time === 0) {
        clearInterval(this.timer);
        this.fadeOut(this.landingPage, 1000, () => {
          fetch("/logout", {
            method: "GET",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Logout request failed");
              }
              window.location.href = "/";
            })
            .catch((error) => {
              console.error("Error logging out:", error);
            });
        });
      }
      this.time--;
    };

    this.time = 180;
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
  }

  fadeOut(element, duration, callback) {
    let currentTime = 0;
    const interval = 10;
    const initialOpacity = 1;
    const targetOpacity = 0;
    const opacityChangePerInterval =
      (initialOpacity - targetOpacity) / (duration / interval);

    const fadeOutInterval = setInterval(() => {
      currentTime += interval;
      const opacity = initialOpacity - opacityChangePerInterval * currentTime;
      element.style.opacity = opacity;
      if (currentTime >= duration) {
        clearInterval(fadeOutInterval);
        if (callback) callback();
      }
    }, interval);
  }

  updateData() {
    this.getUserData();
    this.updateMovements();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const landingPage = new LandingPage();
});

// document.addEventListener("DOMContentLoaded", function () {
//   // Container
//   const landingPage = document.querySelector(".landing-page");
//   // Elements
//   const labelWelcome = document.querySelector(".welcome");
//   const labelDate = document.querySelector(".date");
//   const labelBalance = document.querySelector(".balance__value");
//   const labelSumIn = document.querySelector(".summary__value--in");
//   const labelSumOut = document.querySelector(".summary__value--out");
//   const labelSumInterest = document.querySelector(".summary__value--interest");
//   const labelTimer = document.querySelector(".timer");
//   // Buttons
//   const btnTransfer = document.querySelector(".form__btn--transfer");
//   const btnLoan = document.querySelector(".form__btn--loan");
//   const btnClose = document.querySelector(".form__btn--close");
//   const dropdownSort = document.querySelector(".dropdown--sort");
//   // Inputs
//   const inputTransferTo = document.querySelector(".form__input--to");
//   const inputTransferAmount = document.querySelector(".form__input--amount");
//   const inputLoanAmount = document.querySelector(".form__input--loan-amount");
//   // Message box
//   const overlay = document.querySelector(".overlay");
//   const customMessage = document.querySelector(".custom-message");
//   const customMessageBox = document.querySelector(".custom-message-box");
//   const customMessageOkayButton = document.querySelector(
//     ".custom-message__btn"
//   );
//   const spinnerContainer = document.querySelector(".spinner-container");

//   const containerMovements = document.querySelector(".movements");

//   // --- STATE ----
//   let userData = null;
//   let timer;

//   const getUserData = function () {
//     fetch("/get_user_data")
//       .then((response) => response.json())
//       .then((data) => {
//         userData = data;
//         updateUI(userData);
//       })
//       .catch((error) => {
//         // Handle errors
//         console.error("Error fetching data:", error);
//       });
//   };

//   const updateUI = function (data) {
//     // Show londing page
//     landingPage.style.opacity = 1;

//     // Show balance
//     labelBalance.textContent = `$${data["user_data"][0].current_balance}`;

//     const now = new Date();
//     const options = {
//       hour: "numeric",
//       minute: "numeric",
//       day: "numeric",
//       month: "numeric",
//       year: "numeric",
//     };

//     labelDate.textContent = new Intl.DateTimeFormat(undefined, options).format(
//       now
//     );

//     // Timer
//     if (timer) clearInterval(timer);
//     timer = startLogOutTimer();
//   };

//   const updateMovements = function (sort) {
//     fetch("/movements", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         } else {
//           throw new Error("Failed to fetch movements");
//         }
//       })
//       .then((data) => {
//         displayMovements(data, sort);
//       })
//       .catch((error) => {
//         console.error("Error fetching movements:", error);
//       });
//   };

//   const displayMovements = function (data, sort) {
//     containerMovements.innerHTML = "";
//     let mov;
//     if (sort)
//       mov = data.user_movements.filter((m) => m.transaction_type === sort);
//     else mov = data.user_movements;
//     mov.forEach((mov, i) => {
//       const html = `<div class="movements__row">
//       <div class="movements__type movements__type--${mov.transaction_type}">${
//         i + 1
//       } ${mov.transaction_type}</div>
//       <div class="movements__date">${mov.transaction_date}</div>
//       <div class="movements__value">$${mov.transaction_amount}</div>
//     </div>`;

//       containerMovements.insertAdjacentHTML("afterbegin", html);
//     });

//     // Calculate and Display Summary
//     labelSumIn.textContent = mov
//       .filter((input) => input.transaction_type === "deposit")
//       .reduce((acc, cur) => acc + cur.transaction_amount, 0);

//     labelSumOut.textContent = mov
//       .filter((input) => input.transaction_type === "withdraw")
//       .reduce((acc, cur) => acc + cur.transaction_amount, 0);

//     labelSumInterest.textContent = Math.trunc(
//       (labelSumIn.textContent / 100) * 2.8
//     );
//   };

//   btnLoan.addEventListener("click", function (e) {
//     e.preventDefault();
//     const loanAmount = Number(inputLoanAmount.value);

//     fetch("/request_loan", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ amount: loanAmount }),
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         } else {
//           return response.json().then((data) => {
//             showAlert(data.message || "Loan Denied");
//             throw new Error(data.message || "Loan Denied");
//           });
//         }
//       })
//       .then((data) => {
//         if (data.success) {
//           showAlert(data.message, data.success, () => {
//             updateData();
//           });
//         } else {
//           showAlert(data.message || "Loan Denied");
//           throw new Error(data.message || "Loan Denied");
//         }
//       })
//       .catch((error) => {
//         // Handle error
//         console.error("Error getting loan:", error);
//       });

//     // Clear field
//     inputLoanAmount.value = "";
//   });

//   btnTransfer.addEventListener("click", function (e) {
//     e.preventDefault();
//     const amount = Number(inputTransferAmount.value);
//     const recipient = inputTransferTo.value;

//     fetch("/transfer", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ recipient: recipient, amount: amount }),
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         } else {
//           return response.json().then((data) => {
//             showAlert(data.message || "Transfer Denied");
//             throw new Error(data.message || "Transfer Denied");
//           });
//         }
//       })
//       .then((data) => {
//         if (data.success) {
//           showAlert(data.message, data.success, () => {
//             updateData();
//           });
//         } else {
//           showAlert(data.message || "Transfer Denied");
//           throw new Error(data.message || "Transfer Denied");
//         }
//       })
//       .catch((error) => {
//         // Handle error
//         console.error("Error transferring money:", error);
//       });

//     // TODO Add password verification
//     // TODO 2 spep verification ?
//     // Clear fields
//     inputTransferTo.value = "";
//     inputTransferAmount.value = "";

//     // //Reset Timer
//     clearInterval(timer);
//     timer = startLogOutTimer();
//   });

//   // CLOSE ACCOUNT
//   btnClose.addEventListener("click", function (e) {
//     e.preventDefault();

//     fetch("/close_account", {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//       },
//     })
//       .then((response) => {
//         if (response.ok) {
//           return response.json();
//         } else {
//           throw new Error("Failed to delete account");
//         }
//       })
//       .then((data) => {
//         if (data.success && data.redirect_url) {
//           // Redirect to the URL received from the server
//           showAlert(data.message, data.success, () => {
//             window.location.href = data.redirect_url;
//           });
//         } else {
//           throw new Error("Failed to delete account");
//         }
//       })
//       .catch((error) => {
//         // Handle errors
//         console.error("Error closing account:", error);
//       });
//   });

//   dropdownSort.addEventListener("change", function () {
//     // Get the selected value
//     const selectedValue = dropdownSort.value;

//     // Perform actions based on the selected value
//     switch (selectedValue) {
//       case "all":
//         // Action for 'All' selected
//         updateMovements(false);
//         break;
//       case "deposit":
//         // Action for 'Deposit' selected
//         updateMovements("deposit");
//         break;
//       case "withdraw":
//         // Action for 'Withdraw' selected
//         updateMovements("withdraw");
//         break;
//       default:
//         // Action for other options or no option selected
//         updateMovements(false);
//     }
//   });

//   // ------- MESSAGE ---------------

//   const displaySpinner = function () {
//     overlay.classList.remove("hidden");
//     spinnerContainer.classList.remove("hidden");
//   };

//   const removeSpinner = function () {
//     // overlay.classList.add("hidden");
//     spinnerContainer.classList.add("hidden");
//   };

//   const showAlert = (message, success, callback) => {
//     // Display spinner first
//     displaySpinner();

//     // Set message box text after a short delay to ensure spinner is visible first
//     setTimeout(() => {
//       // Set message box text
//       customMessage.textContent = message;

//       // Apply button change
//       if (success) {
//         customMessageOkayButton.innerHTML = "&check;";
//         customMessageOkayButton.style.color = "green";
//       } else {
//         customMessageOkayButton.innerHTML = "&times;";
//         customMessageOkayButton.style.color = "red";
//       }

//       // Remove spinner after 1 second
//       setTimeout(() => {
//         removeSpinner();
//         customMessageOkayButton.focus();
//         customMessageOkayButton.addEventListener("click", function (e) {
//           e.preventDefault();
//           callback();
//         });
//       }, 1000);

//       // Show the message box
//       customMessageBox.classList.remove("hidden");
//     }, 100);
//   };

//   const hideAlert = () => {
//     overlay.classList.add("hidden");
//     customMessageBox.classList.add("hidden");
//   };

//   overlay.addEventListener("click", hideAlert);

//   customMessageOkayButton.addEventListener("click", hideAlert);

//   const startLogOutTimer = function () {
//     const tick = function () {
//       const min = String(Math.trunc(time / 60)).padStart(2, "0");
//       const sec = String(time % 60).padStart(2, "0");
//       // In each call print remaining time to interface
//       labelTimer.textContent = `${min}:${sec}`;
//       //When 0 seconds stop timer and log user out

//       if (time === 0) {
//         clearInterval(timer);
//         fadeOut(landingPage, 1000, function () {
//           // After fade out, trigger logout request
//           fetch("/logout", {
//             method: "GET",
//           })
//             .then((response) => {
//               if (!response.ok) {
//                 throw new Error("Logout request failed");
//               }
//               // Redirect user after successful logout
//               window.location.href = "/";
//             })
//             .catch((error) => {
//               console.error("Error logging out:", error);
//               // Handle errors if needed
//             });
//         });
//       }
//       // Decrease time by 1s
//       time--;
//     };

//     // Set time to 5 mins
//     let time = 400;
//     // Call timer every second
//     tick();
//     const timer = setInterval(tick, 1000);
//     return timer;
//   };

//   const fadeOut = function (element, duration, callback) {
//     let currentTime = 0;
//     const interval = 10;
//     const initialOpacity = 1; // Assuming the initial opacity is set to 1 in CSS
//     const targetOpacity = 0;
//     const opacityChangePerInterval =
//       (initialOpacity - targetOpacity) / (duration / interval);

//     const fadeOutInterval = setInterval(() => {
//       currentTime += interval;
//       const opacity = initialOpacity - opacityChangePerInterval * currentTime;
//       element.style.opacity = opacity;
//       if (currentTime >= duration) {
//         clearInterval(fadeOutInterval);
//         if (callback) callback();
//       }
//     }, interval);
//   };

//   const updateData = function () {
//     getUserData();
//     updateMovements();
//   };
//   updateData();
// });
