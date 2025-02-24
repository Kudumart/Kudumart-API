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
const node_cron_1 = __importDefault(require("node-cron"));
const sequelize_1 = require("sequelize");
const auctionproduct_1 = __importDefault(require("../models/auctionproduct"));
const logger_1 = __importDefault(require("../middlewares/logger"));
const bid_1 = __importDefault(require("../models/bid"));
const index_1 = require("../index");
const mail_service_1 = require("../services/mail.service");
const messages_1 = require("../utils/messages");
const user_1 = __importDefault(require("../models/user"));
// Runs every minute to check and update auction statuses
const auctionStatusUpdate = () => {
    node_cron_1.default.schedule('* * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
        logger_1.default.info('Running auction status update...');
        try {
            // Move 'upcoming' auctions to 'ongoing' when startDate is reached
            yield auctionproduct_1.default.update({ auctionStatus: 'ongoing' }, {
                where: {
                    auctionStatus: 'upcoming',
                    startDate: { [sequelize_1.Op.lte]: new Date(new Date().toISOString()) }, // startDate <= now
                },
            });
            // Find auctions that have ended
            const endedAuctions = yield auctionproduct_1.default.findAll({
                where: {
                    auctionStatus: 'ongoing',
                    endDate: { [sequelize_1.Op.lte]: new Date() }, // endDate <= now
                },
            });
            for (const auction of endedAuctions) {
                // Find the highest bid
                const highestBid = yield bid_1.default.findOne({
                    where: { auctionProductId: auction.id, isWinningBid: true },
                    order: [['bidAmount', 'DESC']], // Get highest bid
                });
                const winnerId = highestBid ? highestBid.bidderId : null;
                const winningBid = highestBid ? highestBid.bidAmount : 0;
                // Update auction status to 'ended'
                yield auctionproduct_1.default.update({ auctionStatus: 'ended' }, { where: { id: auction.id } });
                // If there's a winner, send an email notification
                if (winnerId) {
                    const winner = yield user_1.default.findByPk(winnerId);
                    if (winner) {
                        // Emit auctionEnded event to all clients
                        index_1.io.to(auction.id).emit('auctionEnded', {
                            auctionProductId: auction.id,
                            winner,
                            winningBid,
                        });
                        logger_1.default.info(`Auction ${auction.id} ended. Winner: ${winnerId}, Amount: ${winningBid}`);
                        // Send mail
                        let message = messages_1.emailTemplates.auctionProductConfirmationNotification(winner, auction, winningBid);
                        try {
                            yield (0, mail_service_1.sendMail)(winner.email, `${process.env.APP_NAME} - Congratulations! You've Won the Auction!`, message);
                        }
                        catch (emailError) {
                            logger_1.default.error("Error sending email:", emailError); // Log error for internal use
                        }
                        logger_1.default.info(`Email sent to winner: ${winner.email}`);
                    }
                }
            }
            logger_1.default.info('Auction status updated successfully.');
        }
        catch (error) {
            logger_1.default.info('Error updating auction status:', error);
        }
    }));
};
exports.default = auctionStatusUpdate;
//# sourceMappingURL=auctionStatusUpdate.js.map