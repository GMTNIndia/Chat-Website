document.addEventListener("DOMContentLoaded", function () {
  // Check if the user is trying to access a specific page

  const pathname = window.location.pathname;
  const access = localStorage.getItem("token");

  if (
    pathname.endsWith("admin.html") ||
    pathname.endsWith("edit.html") ||
    pathname.endsWith("add.html") ||
    pathname.endsWith("chat.html")
  ) {
    // If trying to access admin.html without a token, redirect to home.html
    if (!access) {
      window.location.href = "./home.html";
      return;
    }
  } else if (
    pathname.endsWith("home.html") ||
    pathname.endsWith("about.html")
  ) {
    // If trying to access home.html or about.html with a token, redirect to admin.html
    if (access) {
      window.location.href = "./admin.html";
      return;
    }
  }

  // Load header
  fetch("header.html")
    .then((response) => response.text())
    .then((data) => {
      document.getElementById("header").innerHTML = data;

      // Toggle list of items on click
      const toggleButton = document.getElementById("toggleNavBtn");
      const navLinks = document.getElementById("navLinks");

      toggleButton.addEventListener("click", function () {
        navLinks.classList.toggle("hidden");
        navLinks.classList.toggle("flex");
      });

      // Collapse the menu when clicking anywhere outside
      document.addEventListener("click", function (event) {
        const isClickInside =
          toggleButton.contains(event.target) ||
          navLinks.contains(event.target);

        if (!isClickInside && !navLinks.classList.contains("hidden")) {
          navLinks.classList.add("hidden");
          navLinks.classList.remove("flex");
        }
      });

      // Show appropriate buttons based on user role
      const access = localStorage.getItem("token");

      if (access) {
        document.getElementById("logout").classList.remove("hidden");
        document.getElementById("chatAdmin").classList.remove("hidden");
      } else {
        document.getElementById("homeLink").classList.remove("hidden");
        document.getElementById("aboutLink").classList.remove("hidden");
        document.getElementById("agentSignIn").classList.remove("hidden");
      }

      // Show appropriate sections based on user role
      const userRole = localStorage.getItem("role");
      if (userRole) {
        if (userRole === "agent") {
          document.getElementById("adminSection").classList.remove("hidden");
          document.getElementById("roomSection").classList.remove("hidden");
        } else if (userRole === "undefined") {
          document.getElementById("roomSection").classList.remove("hidden");
        }
      } else {
        document.getElementById("roomSection").classList.remove("hidden");
      }

      // Handle logout
      const logoutButton = document.getElementById("logout");
      if (logoutButton) {
        logoutButton.addEventListener("click", function (event) {
          event.preventDefault(); // Prevent default link behavior
          localStorage.removeItem("token");
          localStorage.removeItem("role");
          window.location.href = "./home.html"; // Always redirect to sign-in on logout
        });
      } else {
        console.error("Logout button not found in the DOM");
      }
    })
    .catch((error) => {
      console.error("Error loading header:", error);
    });
});
