// -------------------------App.js---------------------------------------
const socket = io("https://ugels.com/", { transports: ["websocket"] });
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



// document.addEventListener('DOMContentLoaded', function() {
//   document.getElementById('orderForm').addEventListener('submit', function(e) {
//       e.preventDefault();
      
//       var formData = new FormData(e.target);
//       var data = {};
      
//       formData.forEach((value, key) => {
//           data[key] = value;
//       });
      
//       fetch('https://script.google.com/macros/s/AKfycbxmLguEHxFY3LDjKpH_g2hX7dRAbJJYgAaUMyotfFnbMXSNZw2o_y_GRrSFQMkoST18YQ/exec', {
//           method: 'POST',
//           body: JSON.stringify(data),
//           headers: {
//               'Content-Type': 'application/json'
//           },
//           mode: 'no-cors' // Ensure CORS mode is specified
//       })
//       .then(response => response.json())
//       .then(result => {
//           console.log('Success:', result);
//           alert('Order sent successfully!');
//       })
//       .catch(error => {
//           console.error('Error:', error);
//           alert('There was an error sending your order.');
//       });
//   });
// });
