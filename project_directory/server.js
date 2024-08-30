// Import necessary modules
const {
  express,
  https,
  socketIO,
  cors,
  fs,
  corsOptions,
} = require("./loadModules");

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

// Admin Express app setup
const adminApp = express();
console.log("\x1b[32m%s\x1b[0m", "Express connected to adminApp successfully");

const adminServer = https.createServer(options, adminApp); // Create HTTPS server for admin
const adminIo = socketIO(adminServer); // Attach Socket.IO to admin server
console.log("\x1b[32m%s\x1b[0m", "Admin Socket.IO loaded successfully");

adminApp.use(express.static("admin_public"));
adminApp.use(cors(corsOptions));

// Start the main server on port 25565
const PORT = process.env.PORT || 25565;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Start the admin server on port 26001
const ADMIN_PORT = process.env.ADMIN_PORT || 26001;
adminServer.listen(ADMIN_PORT, () => {
  console.log(`Admin server is running on port ${ADMIN_PORT}`);
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

// Load admin user data from JSON file
let admins = [];
try {
  const adminData = fs.readFileSync("admins.json", "utf-8");
  admins = JSON.parse(adminData);
} catch (err) {
  console.error("Error reading Admin user data:", err);
}

// Alphabet letters for key generation
const letters = "abcdefghijklmnopqrstuvwxyz";

// Socket.IO connection handling for the admin app
adminIo.on("connection", (socket) => {
  connection[socket.id] = {
    username: "admin",
    userId: "admin",
    key: "",
    status: "Connected",
    IsAdminSession: true,
  };

  const originalTime = socket.handshake.time;
  const originalDate = new Date(originalTime);
  const formattedTime = originalDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  socket.emit("getkey");

  socket.on("login", ({ username, password }) => {
    console.log("Login received");
    const admin = admins.find(
      (admin) => admin.username === username && admin.password === password
    );
    if (admin) {
      console.log(
        formattedTime,
        `An admin connected with socket ID: ${socket.id} and their IP address is ${socket.handshake.address.replace(/^.*:/, "")}`
      );
      connected_users.push({ socketId: socket.id });
      console.log(
        formattedTime,
        "Connected users (including admin):",
        connected_users.length
      );

      socket.emit("login_response", { success: true });

      // Generate a random key for the session
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);

      connection[socket.id].key = Array.from(array)
        .map((byte) => (byte % 2 === 0 ? byte % 10 : letters.charAt(byte % letters.length)))
        .join("");

      socket.emit("key", connection[socket.id].key);
      admin.usedkeys.push(connection[socket.id].key);

      // Optionally, save the updated admins array back to the file
      fs.writeFileSync("admins.json", JSON.stringify(admins, null, 2), "utf-8");

      printDashboard(socket, "admin_restricted");

      socket.emit("setkey", connection[socket.id].key);
    } else {
      console.log("Invalid username or password");
      socket.emit("login_response", { success: false });
    }
  });

  socket.on("savedkey", (receivedKey) => {
    if (!receivedKey) {
      handleNullOrUndefinedKey();
      return;
    }

    const isKeyUsed = admins.some(item => item.usedkeys.includes(receivedKey));
    if (isKeyUsed) {
      console.log(`${receivedKey} is found in the used keys`);
      connection[socket.id].key = receivedKey;

      socket.emit("login_response", { success: true });
      socket.emit("key", connection[socket.id].key);
      socket.emit("setkey", connection[socket.id].key);

      printDashboard(socket, "admin_restricted");
    } else {
      console.log(`${receivedKey} is not found in the used keys`);
    }
  });

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
        `Admin with socket ID: ${socket.id} disconnected.`
      );
      console.log(
        formattedTime,
        "Connected users (including admins):",
        connected_users.length
      );
    }
    connection[socket.id].status = "disconnected";
  });
});

// Helper function to handle null or undefined keys
function handleNullOrUndefinedKey() {
  console.log("The key is null or undefined. Please provide a valid key.");
}

// Helper function to load and send dashboard HTML and JS to the client
function printDashboard(socket, providedPath) {
  if (!providedPath) {
    console.log("Provided path is null or undefined.");
    return false;
  }

  const htmlFilePath = path.join(__dirname, providedPath, "dashboard.html");
  fs.readFile(htmlFilePath, "utf-8", (err, htmlData) => {
    if (err) {
      console.error("Error reading HTML file:", err);
      socket.emit("html_error", "Failed to load the dashboard.");
      return;
    }

    const bodyContent = htmlData.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyContent && bodyContent[1]) {
      const jsFilePath = path.join(__dirname, providedPath, "dashboard.js");
      fs.readFile(jsFilePath, "utf-8", (err, jsData) => {
        if (err) {
          console.error("Error reading JavaScript file:", err);
          socket.emit("html_error", "Failed to load the dashboard script.");
          return;
        }

        socket.emit("load_content", {
          html: bodyContent[1],
          script: jsData,
        });
      });
    } else {
      console.log("No body found in the HTML file.");
    }
  });
}
