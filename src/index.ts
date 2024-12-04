import dotenv from "dotenv";
import http from "http";
import { Server } from "socket.io";
import createExpressApp from "./services/express.service";
import sequelizeService from "./services/sequelize.service"; // Adjusted to match your service structure
import apiRouter from "./routes/authRoute"; // Import your routes here
import { configureSocket } from "./services/socket.service";

dotenv.config();

// Initialize the Express app
const app = createExpressApp();

// Create the HTTP server
const server = http.createServer(app);

// Attach Socket.IO to the HTTP server
const io = new Server(server, {
    cors: {
        origin: "*", // Change to specific origins in production
    },
});

app.use("/api", apiRouter); // Mount the router to /api

// Configure Socket.IO
configureSocket(io);

// Export the io instance so it can be used elsewhere
export { io };

// Initialize and sync Sequelize
sequelizeService.init()
    .then(async () => {
        if (sequelizeService.connection) {
            await sequelizeService.connection.authenticate(); // Ensure the connection is established
            console.log("Database connected successfully");
        } else {
            console.error("Database connection is not initialized.");
        }
    })
    .catch((error: Error) => console.error("Error connecting to the database:", error));

// Create and start the HTTP server
const port = process.env.SERVER_PORT || 3000; // Get the port from the environment variables

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("Shutting down gracefully...");
    server.close(() => {
        console.log("HTTP server closed.");
        sequelizeService.connection?.close().then(() => {
            console.log("Database connection closed.");
            process.exit(0);
        });
    });
});