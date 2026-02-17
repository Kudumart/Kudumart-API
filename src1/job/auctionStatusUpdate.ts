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
			// Move 'upcoming' auctions to 'ongoing' when startDate is reached
			await AuctionProduct.update(
				{ auctionStatus: "ongoing" },
				{
					where: {
						auctionStatus: "upcoming",
						startDate: { [Op.lte]: new Date(new Date().toISOString()) }, // startDate <= now
					},
				},
			);

			// Find auctions that have ended
			const endedAuctions = await AuctionProduct.findAll({
				where: {
					auctionStatus: "ongoing",
					endDate: { [Op.lte]: new Date() }, // endDate <= now
				},
			});

			for (const auction of endedAuctions) {
				// Find the highest bid
				const highestBid = await Bid.findOne({
					where: { auctionProductId: auction.id, isWinningBid: true },
					order: [["bidAmount", "DESC"]], // Get highest bid
				});

				const winnerId = highestBid ? highestBid.bidderId : null;
				const winningBid = highestBid ? highestBid.bidAmount : 0;

				// Update auction status to 'ended'
				await AuctionProduct.update(
					{ auctionStatus: "ended" },
					{ where: { id: auction.id } },
				);

				// If there's a winner, send an email notification
				if (winnerId) {
					const winner = await User.findByPk(winnerId);
					if (winner) {
						// Emit auctionEnded event to all clients
						io.to(auction.id).emit("auctionEnded", {
							auctionProductId: auction.id,
							winner,
							winningBid,
						});

						logger.info(
							`Auction ${auction.id} ended. Winner: ${winnerId}, Amount: ${winningBid}`,
						);

						// Send mail
						let message = emailTemplates.auctionProductConfirmationNotification(
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
							logger.error("Error sending email:", emailError); // Log error for internal use
						}

						logger.info(`Email sent to winner: ${winner.email}`);
					}
				}
			}

			logger.info("Auction status updated successfully.");
		} catch (error) {
			logger.info("Error updating auction status:", error);
		}
	});
};

export default auctionStatusUpdate;

