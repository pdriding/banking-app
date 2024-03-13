document.addEventListener("DOMContentLoaded", function () {
  // Container
  const landingPage = document.querySelector(".landing-page");
  // Elements
  const labelWelcome = document.querySelector(".welcome");
  const labelDate = document.querySelector(".date");
  const labelBalance = document.querySelector(".balance__value");
  const labelSumIn = document.querySelector(".summary__value--in");
  const labelSumOut = document.querySelector(".summary__value--out");
  const labelSumInterest = document.querySelector(".summary__value--interest");
  const labelTimer = document.querySelector(".timer");
  // Buttons
  const btnTransfer = document.querySelector(".form__btn--transfer");
  const btnLoan = document.querySelector(".form__btn--loan");
  const btnClose = document.querySelector(".form__btn--close");
  const dropdownSort = document.querySelector(".dropdown--sort");
  // Inputs
  const inputTransferTo = document.querySelector(".form__input--to");
  const inputTransferAmount = document.querySelector(".form__input--amount");
  const inputLoanAmount = document.querySelector(".form__input--loan-amount");
  // Message box
  const overlay = document.querySelector(".overlay");
  const customMessage = document.querySelector(".custom-message");
  const customMessageBox = document.querySelector(".custom-message-box");
  const customMessageOkayButton = document.querySelector(
    ".custom-message__btn"
  );
  const spinnerContainer = document.querySelector(".spinner-container");

  const containerMovements = document.querySelector(".movements");

  // --- STATE ----
  let userData = null;
  let timer;

  const getUserData = function () {
    fetch("/get_user_data")
      .then((response) => response.json())
      .then((data) => {
        userData = data;
        updateUI(userData);
      })
      .catch((error) => {
        // Handle errors
        console.error("Error fetching data:", error);
      });
  };

  const updateUI = function (data) {
    // Show londing page
    landingPage.style.opacity = 1;

    // Show balance
    labelBalance.textContent = `$${data["user_data"][0].current_balance}`;

    const now = new Date();
    const options = {
      hour: "numeric",
      minute: "numeric",
      day: "numeric",
      month: "numeric",
      year: "numeric",
    };

    labelDate.textContent = new Intl.DateTimeFormat(undefined, options).format(
      now
    );

    // Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();
  };

  const updateMovements = function (sort) {
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
        displayMovements(data, sort);
      })
      .catch((error) => {
        console.error("Error fetching movements:", error);
      });
  };

  const displayMovements = function (data, sort) {
    containerMovements.innerHTML = "";
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

      containerMovements.insertAdjacentHTML("afterbegin", html);
    });

    // Calculate and Display Summary
    labelSumIn.textContent = mov
      .filter((input) => input.transaction_type === "deposit")
      .reduce((acc, cur) => acc + cur.transaction_amount, 0);

    labelSumOut.textContent = mov
      .filter((input) => input.transaction_type === "withdraw")
      .reduce((acc, cur) => acc + cur.transaction_amount, 0);

    labelSumInterest.textContent = Math.trunc(
      (labelSumIn.textContent / 100) * 2.8
    );
  };

  btnLoan.addEventListener("click", function (e) {
    e.preventDefault();
    const loanAmount = Number(inputLoanAmount.value);

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
            showAlert(data.message || "Loan Denied");
            throw new Error(data.message || "Loan Denied");
          });
        }
      })
      .then((data) => {
        if (data.success) {
          showAlert(data.message, data.success, () => {
            updateData();
          });
        } else {
          showAlert(data.message || "Loan Denied");
          throw new Error(data.message || "Loan Denied");
        }
      })
      .catch((error) => {
        // Handle error
        console.error("Error getting loan:", error);
      });

    // Clear field
    inputLoanAmount.value = "";
  });

  btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();
    const amount = Number(inputTransferAmount.value);
    const recipient = inputTransferTo.value;

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
            showAlert(data.message || "Transfer Denied");
            throw new Error(data.message || "Transfer Denied");
          });
        }
      })
      .then((data) => {
        if (data.success) {
          showAlert(data.message, data.success, () => {
            updateData();
          });
        } else {
          showAlert(data.message || "Transfer Denied");
          throw new Error(data.message || "Transfer Denied");
        }
      })
      .catch((error) => {
        // Handle error
        console.error("Error transferring money:", error);
      });

    // TODO Add password verification
    // TODO 2 spep verification ?
    // Clear fields
    inputTransferTo.value = "";
    inputTransferAmount.value = "";

    // //Reset Timer
    clearInterval(timer);
    timer = startLogOutTimer();
  });

  // CLOSE ACCOUNT
  btnClose.addEventListener("click", function (e) {
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
          // Redirect to the URL received from the server
          showAlert(data.message, data.success, () => {
            window.location.href = data.redirect_url;
          });
        } else {
          throw new Error("Failed to delete account");
        }
      })
      .catch((error) => {
        // Handle errors
        console.error("Error closing account:", error);
      });
  });

  dropdownSort.addEventListener("change", function () {
    // Get the selected value
    const selectedValue = dropdownSort.value;

    // Perform actions based on the selected value
    switch (selectedValue) {
      case "all":
        // Action for 'All' selected
        updateMovements(false);
        break;
      case "deposit":
        // Action for 'Deposit' selected
        updateMovements("deposit");
        break;
      case "withdraw":
        // Action for 'Withdraw' selected
        updateMovements("withdraw");
        break;
      default:
        // Action for other options or no option selected
        updateMovements(false);
    }
  });

  // ------- MESSAGE ---------------

  const displaySpinner = function () {
    overlay.classList.remove("hidden");
    spinnerContainer.classList.remove("hidden");
  };

  const removeSpinner = function () {
    // overlay.classList.add("hidden");
    spinnerContainer.classList.add("hidden");
  };

  const showAlert = (message, success, callback) => {
    // Display spinner first
    displaySpinner();

    // Set message box text after a short delay to ensure spinner is visible first
    setTimeout(() => {
      // Set message box text
      customMessage.textContent = message;

      // Apply button change
      if (success) {
        customMessageOkayButton.innerHTML = "&check;";
        customMessageOkayButton.style.color = "green";
      } else {
        customMessageOkayButton.innerHTML = "&times;";
        customMessageOkayButton.style.color = "red";
      }

      // Remove spinner after 1 second
      setTimeout(() => {
        removeSpinner();
        customMessageOkayButton.focus();
        customMessageOkayButton.addEventListener("click", function (e) {
          e.preventDefault();
          callback();
        });
      }, 1000);

      // Show the message box
      customMessageBox.classList.remove("hidden");
    }, 100);
  };

  const hideAlert = () => {
    overlay.classList.add("hidden");
    customMessageBox.classList.add("hidden");
  };

  overlay.addEventListener("click", hideAlert);

  customMessageOkayButton.addEventListener("click", hideAlert);

  const startLogOutTimer = function () {
    const tick = function () {
      const min = String(Math.trunc(time / 60)).padStart(2, "0");
      const sec = String(time % 60).padStart(2, "0");
      // In each call print remaining time to interface
      labelTimer.textContent = `${min}:${sec}`;
      //When 0 seconds stop timer and log user out

      if (time === 0) {
        clearInterval(timer);
        fadeOut(landingPage, 1000, function () {
          // After fade out, trigger logout request
          fetch("/logout", {
            method: "GET",
          })
            .then((response) => {
              if (!response.ok) {
                throw new Error("Logout request failed");
              }
              // Redirect user after successful logout
              window.location.href = "/";
            })
            .catch((error) => {
              console.error("Error logging out:", error);
              // Handle errors if needed
            });
        });
      }
      // Decrease time by 1s
      time--;
    };

    // Set time to 5 mins
    let time = 400;
    // Call timer every second
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
  };

  const fadeOut = function (element, duration, callback) {
    let currentTime = 0;
    const interval = 10;
    const initialOpacity = 1; // Assuming the initial opacity is set to 1 in CSS
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
  };

  const updateData = function () {
    getUserData();
    updateMovements();
  };
  updateData();
});
