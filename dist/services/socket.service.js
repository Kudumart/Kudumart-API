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
exports.configureSocket = void 0;
const userController_1 = require("../controllers/userController");
const conversation_1 = __importDefault(require("../models/conversation"));
const sequelize_1 = require("sequelize");
// Active user connections
const activeConnections = new Map(); // <UserId, SocketId>
const configureSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("New connection:", socket.id);
        // Register user
        socket.on("register", (userId) => {
            activeConnections.set(userId, socket.id);
            console.log(`User ${userId} connected with Socket ID ${socket.id}`);
        });
        // Handle message sending
        socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            const { productId, userId, receiverId, content, fileUrl } = data;
            // Find or create conversation
            let conversation = yield conversation_1.default.findOne({
                where: {
                    [sequelize_1.Op.or]: [
                        { senderId: userId, receiverId: receiverId },
                        { senderId: receiverId, receiverId: userId }
                    ]
                }
            });
            if (!conversation) {
                conversation = yield conversation_1.default.create({
                    senderId: userId,
                    receiverId,
                    productId
                });
            }
            // Save message to database
            const message = yield (0, userController_1.saveMessage)(conversation.id, userId, content, fileUrl);
            // Emit message to receiver if online
            const receiverSocketId = activeConnections.get(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("receiveMessage", message);
                console.log(`Message sent to receiver with Socket ID ${receiverSocketId}`);
            }
            else {
                console.log(`Receiver ${receiverId} is not online`);
            }
        }));
        // Let users join an auction room
        socket.on("joinAuction", (auctionProductId) => {
            socket.join(auctionProductId);
            console.log(`User ${socket.id} joined auction ${auctionProductId}`);
        });
        // Listen for events from the client
        socket.on("newBid", (data) => {
            console.log("Received new bid:", data);
            // Emit this new bid to all connected clients
            io.emit("newBid", data);
        });
        // Optionally, listen for other events like auction status updates, etc.
        socket.on("auctionEnded", (data) => {
            console.log("Auction ended:", data);
            // Update the UI to display the winner or end the auction
        });
        // Handle disconnection
        socket.on("disconnect", () => {
            activeConnections.forEach((socketId, userId) => {
                if (socketId === socket.id) {
                    activeConnections.delete(userId);
                }
            });
            console.log("User disconnected:", socket.id);
        });
    });
};
exports.configureSocket = configureSocket;
//# sourceMappingURL=socket.service.js.map