import { Server, Socket } from "socket.io";
import { saveMessage } from "../controllers/userController";
import Conversation from "../models/conversation";
import { Op } from "sequelize";

// Active user connections
const activeConnections: Map<string, string> = new Map(); // <UserId, SocketId>

export const configureSocket = (io: Server) => {
    io.on("connection", (socket: Socket) => {
        console.log("New connection:", socket.id);

        // Register user
        socket.on("register", (userId: string) => {
            activeConnections.set(userId, socket.id);
            console.log(`User ${userId} connected with Socket ID ${socket.id}`);
        });

        // Handle message sending
        socket.on(
            "sendMessage",
            async (data: { productId: string; userId: string; receiverId: string; content: string; fileUrl: string }) => {
                const { productId, userId, receiverId, content, fileUrl } = data;

                // Find or create conversation
                let conversation = await Conversation.findOne({
                    where: {
                        [Op.or]: [
                            { senderId: userId, receiverId: receiverId },
                            { senderId: receiverId, receiverId: userId }
                        ]
                    }
                });
            
                if (!conversation) {
                    conversation = await Conversation.create({
                    senderId: userId,
                    receiverId,
                    productId
                    });
                }

                // Save message to database
                const message = await saveMessage(conversation.id, userId, content, fileUrl);

                // Emit message to receiver if online
                const receiverSocketId = activeConnections.get(receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("receiveMessage", message);
                    console.log(`Message sent to receiver with Socket ID ${receiverSocketId}`);
                } else {
                    console.log(`Receiver ${receiverId} is not online`);
                }
            }
        );

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
