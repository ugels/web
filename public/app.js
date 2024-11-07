const socket = io("https://ugels.com", { transports: ["websocket"] });
// Handling connection errors
socket.on("connect_error", (error) => {
  console.error("Error connecting to the server:", error.message);
});
// Connection event
socket.on("connect", () => {
  console.log("Connected to the server");
});
// Disconnection event
socket.on("disconnect", () => {
  console.error("Disconnected from the server");
  console.log("Disconnected from the server");
});

window.onload = function () {
  // displayabout();
  displayhome();
};

// Variable defining:
let currentLanguage = "en";

// Functions:
document.documentElement.setAttribute("data-theme", "dark");

function changetheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";

  // Update the data-theme attribute
  document.documentElement.setAttribute("data-theme", newTheme);
}

function toggleLanguage() {
  if (currentLanguage === "en") {
    currentLanguage = "no";
  } else {
    currentLanguage = "en";
  }
  console.log(currentLanguage);
  // updateLanguageButton();
}

function hideflags() {
  document.getElementById("language").style.display = "none";
}

function homeclicked() {
  console.log("Homeclicked - Received");
  displayhome();
}
function aboutclicked() {
  console.log("Aboutclicked - Received");
  displayabout();
}
function projectsclicked() {
  console.log("Projectsclicked - Received");
  displayprojects();
}
function qualificationsclicked() {
  console.log("qualificationsclicked - Received");
  displayqualifications();
}

function displayhome() {
  console.log("Displayhome - Received");
  document.getElementById("home-screen").style.display = "block";
  document.getElementById("about-screen").style.display = "none";
  document.getElementById("projects-screen").style.display = "none";
  document.getElementById("qualifications-screen").style.display = "none";
  window.scrollTo(0, 0);
}
function displayabout() {
  console.log("Displayabout - Received");
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("about-screen").style.display = "block";
  document.getElementById("projects-screen").style.display = "none";
  document.getElementById("qualifications-screen").style.display = "none";
  window.scrollTo(0, 0);
}
function displayprojects() {
  console.log("Displayprojects - Received");
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("about-screen").style.display = "none";
  document.getElementById("projects-screen").style.display = "block";
  document.getElementById("qualifications-screen").style.display = "none";
  window.scrollTo(0, 0);
}
function displayqualifications() {
  console.log("Displayqualifications - Received");
  document.getElementById("home-screen").style.display = "none";
  document.getElementById("about-screen").style.display = "none";
  document.getElementById("projects-screen").style.display = "none";
  document.getElementById("qualifications-screen").style.display = "block";
  window.scrollTo(0, 0);
}
// window.addEventListener("scroll", function () {
//   var header = document.getElementById("header");
//   if (window.scrollY > 0) {
//     header.style.backgroundColor = "rgba(7, 8, 8, 0.9)"; // Adjust the opacity as needed
//     document.getElementById("footer").style.zIndex = "12";
//   } else {
//     header.style.backgroundColor = "rgba(7, 8, 8, 1)"; // Fully opaque when at the top
//   }
// });
