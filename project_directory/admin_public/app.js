// -------------------------App.js---------------------------------------
const socket = io("ugels.com:26001", { transports: ["websocket"] });
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
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Send username and password to the server for verification
    socket.emit("login", { username, password });
    console.log("Submitted username and password");
  });
});
let currentkey = undefined;
socket.on("login_response", function (data) {
  if (data.success) {
    console.log("Successfully logged in");
    document.getElementById("login-container").style.display = "none";
  } else {
    alert("Invalid username or password. Please try again.");
  }
});
// Listen for the HTML content
socket.on('load_content', ({ html, script }) => {
  console.log("Loading body HTML content and executing script");

  // Clear the current body content
  document.body.innerHTML = '';

  // Insert the new HTML content
  document.body.innerHTML = html;

  // Execute the received JavaScript code
  const scriptElement = document.createElement('script');
  scriptElement.text = script;
  document.body.appendChild(scriptElement);
});
socket.on("key", (data) => {
  console.log("Received key:", data);
  currentkey = data;
});
socket.on("getkey", (data) => {
  console.log("getKeyrecieved")
  const savedkey = getCookie("userkey");
  socket.emit("savedkey", savedkey)
});
function getCookie(name) {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}
socket.on ("WrongKey", (data)=>{
  console.log("WrongKey in function:", data)
})
function setCookie(name, value, days) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  console.log("Cookie set to");
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

// Usage:
socket.on("setkey", (data) => {
    console.log("SetkeyRecieved")
    setCookie("userkey",data,7)
  });