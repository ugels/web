const {
  express,
  https,
  socketIO,
  cors,
  fs,
  corsOptions,
} = require("./loadModules");
// Load SSL certificate and key files
const options = {
  key: fs.readFileSync("cert/ugels.com_key.key"), // Path to your private key
  cert: fs.readFileSync("cert/ugels.com.crt"), // Path to your certificate
  ca: fs.readFileSync("cert/ugels.com.ca-bundle"), // Path to your CA bundle
};
const path = require("path");
// Main app setup
const app = express();
console.log("\x1b[32m%s\x1b[0m", "express connected to app successfully");

const server = https.createServer(options, app); // Use HTTPS server
console.log("\x1b[32m%s\x1b[0m", "app loaded successfully");

const io = socketIO(server);
console.log("\x1b[32m%s\x1b[0m", "io loaded successfully");

app.use(express.static("public"));
app.use(cors(corsOptions));

// Admin app setup
const adminApp = express();
console.log("\x1b[32m%s\x1b[0m", "express connected to adminApp successfully");

const adminServer = https.createServer(options, adminApp); // Use HTTPS server for admin
const adminIo = socketIO(adminServer);
console.log("\x1b[32m%s\x1b[0m", "admin io loaded successfully");

adminApp.use(express.static("admin_public"));
adminApp.use(cors(corsOptions));

// Start the main server on port 25565
const PORT = process.env.PORT || 25565;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
// Start the admin server on port 26002
const ADMIN_PORT = process.env.ADMIN_PORT || 26001;
adminServer.listen(ADMIN_PORT, () => {
  console.log(`Admin server is running on port ${ADMIN_PORT}`);
});

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
    `A user connected with socket ID: ${
      socket.id
    } and their ip address is ${socket.handshake.address.replace(/^.*:/, "")}`
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
try {
  // Read user data from the JSON file
  const adminData = fs.readFileSync("admins.json", "utf-8");
  admins = JSON.parse(adminData);
} catch (err) {
  console.error("Error reading Admin user data:", err);
}
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

  socket.on("login", ({ username, password }) => {
    console.log("Login recieved");
    const admin = admins.find(
      (admin) => admin.username === username && admin.password === password
    );
    if (admin) {
      console.log(
        formattedTime,
        `An admin connected with socket ID: ${
          socket.id
        } and their ip address is ${socket.handshake.address.replace(
          /^.*:/,
          ""
        )}`
      );
      connected_users.push({ socketId: socket.id });
      console.log(
        formattedTime,
        "Connected users (including admin):",
        connected_users.length
      );
      socket.emit("login_response", { success: true });
      const array = new Uint8Array(32);

      crypto.getRandomValues(array);

      connection[socket.id].key = "";
      Array.from(array).forEach((byte) => {
        if (byte % 2 === 0) {
          connection[socket.id].key += byte % 10;
        } else {
          connection[socket.id].key += letters.charAt(byte % letters.length);
        }
      });
      socket.emit("key", connection[socket.id].key);
      const htmlFilePath = path.join(
        __dirname,
        "admin_restricted",
        "dashboard.html"
      );
      fs.readFile(htmlFilePath, "utf-8", (err, htmlData) => {
        if (err) {
          console.error("Error reading HTML file:", err);
          socket.emit("html_error", "Failed to load the dashboard.");
          return;
        }

        // Extract the body content from the HTML
        const bodyContent = htmlData.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        if (bodyContent && bodyContent[1]) {
          // Read the JavaScript file content
          const jsFilePath = path.join(
            __dirname,
            "admin_restricted",
            "dashboard.js"
          );
          fs.readFile(jsFilePath, "utf-8", (err, jsData) => {
            if (err) {
              console.error("Error reading JavaScript file:", err);
              socket.emit("html_error", "Failed to load the dashboard script.");
              return;
            }

            // Send both HTML body content and JavaScript code to the client
            socket.emit("load_content", {
              html: bodyContent[1],
              script: jsData,
            });
          });
        } else {
          socket.emit("html_error", "No body content found in the HTML file.");
        }
      });
      socket.on("fetchuserdata", (id, receivedkey) => {
        if (connection[socket.id].key === receivedkey) {
          console.log("Key Matches")
          fetch(
            "https://api.steampowered.com/ISteamUserStats/GetUserStatsForGame/v2/?appid=252490&key=834AD1B9022BD5BBB397ACA706F926DC&steamid=76561198404326392",
            {
              method: "GET",
            }
          )
            .then((response) => {
              if (!response.ok) {
                throw new Error("Network response was not ok");
              }
              return response.json();
            })
            .then((data) => {
              try {
                const playerStats = data.playerstats;
                console.log(playerStats);
              } catch (error) {
                console.error("Error processing data:", error);
              }
            })
            .catch((error) => {
              console.error("Error fetching data:", error);
            });
        } else {
          socket.emit("WrongKey", "fetchuserdata")
        }
      });
    } else {
      // Invalid username or password
      socket.emit("login_response", { success: false });
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
