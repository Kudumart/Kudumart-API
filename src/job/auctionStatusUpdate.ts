import cron from "node-cron";
import { Op } from "sequelize";
import AuctionProduct from "../models/auctionproduct";
import logger from "../middlewares/logger";
import Bid from "../models/bid";
import { io } from "../index";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import User from "../models/user";

// Runs every minute to check and update auction statuses
const auctionStatusUpdate = () => {
	cron.schedule("* * * * *", async () => {
		logger.info("Running auction status update...");

		try {
			const now = new Date();

			// 1. Move 'upcoming' auctions to 'ongoing' when startDate is reached
			const auctionsToStart = await AuctionProduct.findAll({
				where: {
					auctionStatus: "upcoming",
					startDate: { [Op.lte]: now },
					endDate: { [Op.gt]: now },
				},
			});

			for (const auction of auctionsToStart) {
				await auction.update({ auctionStatus: "ongoing" });
				io.to(auction.id).emit("auctionStarted", {
					auctionProductId: auction.id,
					auctionStatus: "ongoing",
				});
				logger.info(`Auction ${auction.id} transitioned from upcoming to ongoing.`);
			}

			// 2. Find auctions that have reached end date (whether ongoing or upcoming)
			const endedAuctions = await AuctionProduct.findAll({
				where: {
					auctionStatus: { [Op.in]: ["upcoming", "ongoing"] },
					endDate: { [Op.lte]: now },
				},
			});

			for (const auction of endedAuctions) {
				// Find highest valid bid directly from database by amount (not relying on boolean flags)
				const highestBid = await Bid.findOne({
					where: { auctionProductId: auction.id },
					order: [["bidAmount", "DESC"]],
				});

				const winnerId = highestBid ? highestBid.bidderId : null;
				const winningBid = highestBid ? Number(highestBid.bidAmount) : 0;

				// Ensure winning bid flag is synchronized
				if (highestBid) {
					await Bid.update(
						{ isWinningBid: false },
						{ where: { auctionProductId: auction.id } },
					);
					highestBid.isWinningBid = true;
					await highestBid.save();
				}

				// Update auction status to 'ended'
				await auction.update({ auctionStatus: "ended" });

				// Always emit auctionEnded event to all clients in the auction room
				if (winnerId) {
					const winner = await User.findByPk(winnerId);
					io.to(auction.id).emit("auctionEnded", {
						auctionProductId: auction.id,
						winner: winner ? {
							id: winner.id,
							firstName: winner.firstName,
							lastName: winner.lastName,
							email: winner.email,
						} : null,
						winningBid,
					});

					logger.info(
						`Auction ${auction.id} ended. Winner: ${winnerId}, Amount: ${winningBid}`,
					);

					// Send congratulations email
					if (winner && winner.email) {
						const message = emailTemplates.auctionProductConfirmationNotification(
							winner,
							auction,
							winningBid,
						);
						try {
							await sendMail(
								winner.email,
								`${process.env.APP_NAME} - Congratulations! You've Won the Auction!`,
								message,
							);
						} catch (emailError) {
							logger.error("Error sending auction winner email:", emailError);
						}
					}
				} else {
					// Zero-bid auction end broadcast
					io.to(auction.id).emit("auctionEnded", {
						auctionProductId: auction.id,
						winner: null,
						winningBid: 0,
					});
					logger.info(`Auction ${auction.id} ended with no bids.`);
				}
			}

			logger.info("Auction status updated successfully.");
		} catch (error) {
			logger.error("Error updating auction status:", error);
		}
	});
};

export default auctionStatusUpdate;

