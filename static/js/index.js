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

  const btnTransfer = document.querySelector(".form__btn--transfer");
  const btnLoan = document.querySelector(".form__btn--loan");

  const inputTransferTo = document.querySelector(".form__input--to");
  const inputTransferAmount = document.querySelector(".form__input--amount");
  const inputLoanAmount = document.querySelector(".form__input--loan-amount");

  const overlay = document.querySelector(".overlay");
  const customMessage = document.querySelector(".custom-message");
  const customMessageBox = document.querySelector(".custom-message-box");
  const customMessageOkayButton = document.querySelector(
    ".custom-message__btn"
  );
  const spinnerContainer = document.querySelector(".spinner-container");

  // --- STATE ----
  let userData = null;
  let timer;

  const displaySpinner = function () {
    overlay.classList.remove("hidden");
    spinnerContainer.classList.remove("hidden");
  };

  const removeSpinner = function () {
    overlay.classList.add("hidden");
    spinnerContainer.classList.add("hidden");
  };

  // --- MESSAGE --
  const showAlert = (message, result) => {
    // customMessageOkayButton.innerHTML = "";
    // customMessageOkayButton.style.color = "inherit";
  
    // Display spinner
    displaySpinner();
    // Set message content
    customMessage.textContent = message;

    // Callback function to handle transition end
    const handleTransitionEnd = () => {
      if (result === "success") {
        customMessageOkayButton.innerHTML = "&check;";
        customMessageOkayButton.style.color = "green";
      } else {
        customMessageOkayButton.innerHTML = "&times;";
        customMessageOkayButton.style.color = "red";
      }
      customMessageOkayButton.focus();
      // Remove transitionend event listener
      customMessageBox.removeEventListener(
        "transitionend",
        handleTransitionEnd
      );
    };

    // Delay the appearance change until after the transition has completed
    customMessageBox.addEventListener("transitionend", handleTransitionEnd, {
      once: true,
    });

    // Set message after 1 second
    setTimeout(() => {
      // Remove spinner after 1 second
      removeSpinner();

      // Show message container
      document.body.classList.add("blur-background");
      overlay.classList.remove("hidden");
      customMessageBox.classList.remove("hidden");
    }, 1000); // 1 second delay
  };

  const hideAlert = () => {
    overlay.classList.add("hidden");
    customMessageBox.classList.add("hidden");
    document.body.classList.remove("blur-background");
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
        console.log("1");
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
    let time = 100;
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
          // Update Summary
          getUserData();
          showAlert(data.message, "success");
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
          // Update Summary
          getUserData();
          showAlert(data.message, "success");
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

    // Clear fields
    inputTransferTo.value = "";
    inputTransferAmount.value = "";

    // //Reset Timer
    // clearInterval(timer);
    // timer = startLogOutTimer();
  });

  const getUserData = function () {
    fetch("/get_user_data")
      .then((response) => response.json())
      .then((data) => {
        // Handle the received JSON data TODO ASYNC request + spinner
        userData = data;
        updateUI(userData);
        // You can manipulate the data or update the UI here
      })
      .catch((error) => {
        // Handle errors
        console.error("Error fetching data:", error);
      });
  };
  getUserData();
});
