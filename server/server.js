// Import necessary modules
const {
  express,
  https,
  socketIO,
  cors,
  fs,
  corsOptions,
} = require("../loadModules");

const path = require("path");
const cookieParser = require("cookie-parser");

// Load SSL certificate and key files
const options = {
  key: fs.readFileSync("cert/ugels.com_key.key"), // Path to your private key
  cert: fs.readFileSync("cert/ugels.com.crt"), // Path to your certificate
  ca: fs.readFileSync("cert/ugels.com.ca-bundle"), // Path to your CA bundle
};

// Main Express app setup
const app = express();
console.log("\x1b[32m%s\x1b[0m", "Express connected to app successfully");

const server = https.createServer(options, app); // Create HTTPS server
console.log("\x1b[32m%s\x1b[0m", "App loaded successfully");

const io = socketIO(server); // Attach Socket.IO to server
console.log("\x1b[32m%s\x1b[0m", "Socket.IO loaded successfully");

app.use(express.static("public"));
app.use(cors(corsOptions));
pp.use(cors(corsOptions));

// Start the main server on port 25565
const PORT = process.env.PORT || 25565;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Initialize data structures
let connection = {};
let connected_users = [];

// Socket.IO connection handling for the main app
io.on("connection", (socket) => {
  connection[socket.id] = {
    username: "",
    userId: "",
    key: "",
    status: "Connected",
    IsAdminSession: false,
  };

  const originalTime = socket.handshake.time;
  const originalDate = new Date(originalTime);
  const formattedTime = originalDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log(
    formattedTime,
    `A user connected with socket ID: ${socket.id} and their IP address is ${socket.handshake.address.replace(/^.*:/, "")}`
  );

  connected_users.push({ socketId: socket.id });
  console.log(formattedTime, "Connected users:", connected_users.length);

  socket.on("disconnect", () => {
    const disconnectedUser = connected_users.find(
      (user) => user.socketId === socket.id
    );
    if (disconnectedUser) {
      connected_users = connected_users.filter(
        (user) => user.socketId !== socket.id
      );
      console.log(
        formattedTime,
        `User with socket ID: ${socket.id} disconnected.`
      );
      console.log(formattedTime, "Connected users:", connected_users.length);
    }
    connection[socket.id].status = "disconnected";
  });
});