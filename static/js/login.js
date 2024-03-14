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
