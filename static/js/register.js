document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.querySelector(".overlay");
  const popupForm = document.querySelector(".new-form-container");
  // Get references to the register form and new form container
  const registerForm = document.querySelector(".register-form");
  const newForm = document.querySelector(".depositForm");

  registerForm.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    // Show overlay
    overlay.style.display = "block";

    // // Apply blur effect to background
    document.body.classList.add("blur-background");
    // document.querySelector(".overlay").classList.add("blur-background");

    // Show new form container
    popupForm.style.display = "block";
  });

  // Add event listener to the deposit amount form submit button
  newForm.addEventListener("submit", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Gather data from both forms
    const registerFormData = new FormData(registerForm);
    const newFormData = new FormData(newForm);

    // Clear form
    registerForm.reset();
    newForm.reset();

    // Combine data from both forms into a single FormData object
    const combinedFormData = new FormData();
    for (const [key, value] of registerFormData.entries()) {
      combinedFormData.append(key, value);
    }
    for (const [key, value] of newFormData.entries()) {
      combinedFormData.append(key, value);
    }

    // Make an AJAX request to the Flask server
    fetch("/register", {
      method: "POST",
      body: combinedFormData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          window.location.href = "/"; // Redirect to dashboard on successful registration
        } else {
          TODO;
          alert(data.message); // Display error message
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    overlay.style.display = "none";
    popupForm.style.display = "none";
  });

  document.querySelector(".overlay").addEventListener("click", () => {
    // Hide the overlay and new form container
    overlay.style.display = "none";
    popupForm.style.display = "none";
  });
});
