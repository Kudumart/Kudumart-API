"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const express_service_1 = __importDefault(require("./services/express.service"));
const sequelize_service_1 = __importDefault(require("./services/sequelize.service")); // Adjusted to match your service structure
const authRoute_1 = __importDefault(require("./routes/authRoute")); // Import your routes here
const socket_service_1 = require("./services/socket.service");
require("./config/passportConfig"); // Import Password Configuration
const passport_1 = __importDefault(require("passport"));
const subscriptionCron_1 = __importDefault(require("./job/subscriptionCron")); // Import the cron job
const auctionStatusUpdate_1 = __importDefault(require("./job/auctionStatusUpdate")); // Import the cron job
dotenv_1.default.config();
// Initialize the Express app
const app = (0, express_service_1.default)();
// Create the HTTP server
const server = http_1.default.createServer(app);
// Attach Socket.IO to the HTTP server
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*", // Change to specific origins in production
    },
});
exports.io = io;
app.use(passport_1.default.initialize());
app.use("/api", authRoute_1.default); // Mount the router to /api
// Configure Socket.IO
(0, socket_service_1.configureSocket)(io);
// Initialize and sync Sequelize
sequelize_service_1.default.init()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    if (sequelize_service_1.default.connection) {
        yield sequelize_service_1.default.connection.authenticate(); // Ensure the connection is established
        console.log("Database connected successfully");
    }
    else {
        console.error("Database connection is not initialized.");
    }
}))
    .catch((error) => console.error("Error connecting to the database:", error));
// Create and start the HTTP server
const port = process.env.SERVER_PORT || 3000; // Get the port from the environment variables
// Start the cron job
(0, subscriptionCron_1.default)();
(0, auctionStatusUpdate_1.default)();
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
// Graceful shutdown
process.on("SIGINT", () => {
    console.log("Shutting down gracefully...");
    server.close(() => {
        var _a;
        console.log("HTTP server closed.");
        (_a = sequelize_service_1.default.connection) === null || _a === void 0 ? void 0 : _a.close().then(() => {
            console.log("Database connection closed.");
            process.exit(0);
        });
    });
});
//# sourceMappingURL=index.js.map