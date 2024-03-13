document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.querySelector(".overlay");
  const popupForm = document.querySelector(".new-form-container");
  const registerForm = document.querySelector(".register-form");
  const newForm = document.querySelector(".depositForm");
  const customMessageBox = document.querySelector(".custom-message-box");
  const customMessage = document.querySelector(".custom-message");
  const customMessageOkayButton = document.querySelector(
    ".custom-message__btn"
  );

  // TODO alerts button.focus()
  const showAlert = (message) => {
    overlay.classList.remove("hidden");
    customMessageBox.classList.remove("hidden");
    customMessage.textContent = message;
    document.body.classList.add("blur-background");
  };

  const hideAlert = () => {
    overlay.classList.add("hidden");
    customMessageBox.classList.add("hidden");
    document.body.classList.remove("blur-background");
  };

  document.querySelector(".overlay").addEventListener("click", hideAlert);

  customMessageOkayButton.addEventListener("click", hideAlert);

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    const usernameInput = registerForm.querySelector('input[name="username"]');
    const passwordInput = registerForm.querySelector('input[name="password"]');

    // Check if the username or password fields are empty
    if (!usernameInput.value.trim()) return showAlert("Input username");
    if (!passwordInput.value.trim()) return showAlert("Input password");

    const userData = {
      username: usernameInput.value.trim(),
      password: passwordInput.value.trim(),
    };

    // Make a fetch request with the password data
    fetch("/validate_password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      }, // Send password in the request body
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          overlay.classList.remove("hidden");
          popupForm.classList.remove("hidden");
          document.body.classList.add("blur-background");

          // After registerForm submission, listen to newForm submission
          newForm.addEventListener("submit", handleNewFormSubmission);
        } else {
          showAlert(data.message);
        }
      })
      .catch((error) => {
        // Handle fetch error
        console.error("Error:", error);
      });
  });

  const handleNewFormSubmission = function (event) {
    event.preventDefault();

    const registerFormData = new FormData(registerForm);
    const newFormData = new FormData(newForm);

    registerForm.reset();
    newForm.reset();

    const combinedFormData = new FormData();
    for (const [key, value] of registerFormData.entries()) {
      combinedFormData.append(key, value);
    }
    for (const [key, value] of newFormData.entries()) {
      combinedFormData.append(key, value);
    }

    fetch("/register", {
      method: "POST",
      body: combinedFormData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/";
        } else {
          showAlert(data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    overlay.classList.add("hidden");
    popupForm.classList.add("hidden");
  };
});
