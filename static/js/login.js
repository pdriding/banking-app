document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".login-form");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const usernameInput = loginForm.querySelector('input[name="username"]');
    const passwordInput = loginForm.querySelector('input[name="password"]');

    // Check if the username or password fields are empty
    if (!usernameInput.value.trim()) return showAlert("Input username");
    if (!passwordInput.value.trim()) return showAlert("Input password");

    const loginFormData = new FormData(loginForm);

    // Clear form
    loginForm.reset();

    fetch("/login", {
      method: "POST",
      body: loginFormData,
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
  });
});
