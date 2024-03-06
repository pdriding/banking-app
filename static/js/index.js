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

  // --- STATE ----
  let userData = null;
  let timer;

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
});
