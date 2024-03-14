import MessageHandler from "./messageHandler.js";

class LoginForm {
  constructor() {
    this.loginForm = document.querySelector(".login-form");
    this.messageHandler = new MessageHandler();
    this.handleSubmit = this.handleSubmit.bind(this);

    this.initialize();
  }

  initialize() {
    this.loginForm.addEventListener("submit", this.handleSubmit);
  }

  showAlert(message) {
    this.messageHandler.showAlert(message);
  }

  hideAlert() {
    this.messageHandler.hideAlert();
  }

  handleSubmit(event) {
    event.preventDefault();

    const usernameInput = this.loginForm.querySelector(
      'input[name="username"]'
    );
    const passwordInput = this.loginForm.querySelector(
      'input[name="password"]'
    );

    if (!usernameInput.value.trim()) return this.showAlert("Input username");
    if (!passwordInput.value.trim()) return this.showAlert("Input password");

    const loginFormData = new FormData(this.loginForm);
    this.loginForm.reset();

    fetch("/login", {
      method: "POST",
      body: loginFormData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/";
        } else {
          this.showAlert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new LoginForm();
});

// document.addEventListener("DOMContentLoaded", function () {
//   const overlay = document.querySelector(".overlay");
//   const loginForm = document.querySelector(".login-form");
//   const customMessage = document.querySelector(".custom-message");
//   const customMessageBox = document.querySelector(".custom-message-box");
//   const customMessageOkayButton = document.querySelector(
//     ".custom-message__btn"
//   );

//   const showAlert = (message) => {
//     overlay.classList.remove("hidden");
//     customMessageBox.classList.remove("hidden");
//     customMessage.textContent = message;
//     document.body.classList.add("blur-background");
//   };

//   const hideAlert = () => {
//     overlay.classList.add("hidden");
//     customMessageBox.classList.add("hidden");
//     document.body.classList.remove("blur-background");
//   };

//   overlay.addEventListener("click", hideAlert);

//   customMessageOkayButton.addEventListener("click", hideAlert);

//   loginForm.addEventListener("submit", function (e) {
//     e.preventDefault();
//     const usernameInput = loginForm.querySelector('input[name="username"]');
//     const passwordInput = loginForm.querySelector('input[name="password"]');

//     // Check if the username or password fields are empty
//     if (!usernameInput.value.trim()) return showAlert("Input username");
//     if (!passwordInput.value.trim()) return showAlert("Input password");

//     const loginFormData = new FormData(loginForm);

//     // Clear form
//     loginForm.reset();

//     fetch("/login", {
//       method: "POST",
//       body: loginFormData,
//     })
//       .then((response) => response.json())
//       .then((data) => {
//         if (data.success) {
//           window.location.href = "/";
//         } else {
//           showAlert(data.message);
//         }
//       })
//       .catch((error) => {
//         console.error("Error:", error);
//       });
//   });
// });
