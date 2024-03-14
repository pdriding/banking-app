export default class MessageHandler {
  constructor() {
    this.overlay = document.querySelector(".overlay");
    this.customMessageBox = document.querySelector(".custom-message-box");
    this.customMessage = document.querySelector(".custom-message");
    this.customMessageOkayButton = document.querySelector(
      ".custom-message__btn"
    );

    this.showAlert = this.showAlert.bind(this);
    this.hideAlert = this.hideAlert.bind(this);

    this.initialize();
  }

  initialize() {
    this.overlay.addEventListener("click", this.hideAlert);
    this.customMessageOkayButton.addEventListener("click", this.hideAlert);
  }

  showAlert(message) {
    this.overlay.classList.remove("hidden");
    this.customMessageBox.classList.remove("hidden");
    this.customMessage.textContent = message;
    document.body.classList.add("blur-background");
    setTimeout(() => {
      this.customMessageOkayButton.focus();
      this.customMessageOkayButton.style.color = "#ff3333";
    }, 100);
  }

  hideAlert() {
    this.overlay.classList.add("hidden");
    this.customMessageBox.classList.add("hidden");
    document.body.classList.remove("blur-background");
  }
}
