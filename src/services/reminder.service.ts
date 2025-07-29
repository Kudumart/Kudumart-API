import { Op } from "sequelize";
import AuctionReminders from "../models/reminder";
import User from "../models/user";
import AuctionProduct from "../models/auctionproduct";
import { emailTemplates } from "../utils/messages";
import { sendMail } from "./mail.service";
import pLimit from "p-limit";

const limit = pLimit(10);

const MESSAGE_INTERVAL = 1000 * 60 * 60 * 24; // 24 hours

export async function createAuctionReminder(
	userId: string,
	auctionProductId: string,
	auctionDate: Date,
) {
	const auctionDateTime = new Date(auctionDate).getTime();

	const daysAway = Math.ceil((auctionDateTime - Date.now()) / MESSAGE_INTERVAL);

	const reminderDates = [];

	for (let i = daysAway; i > 0; i--) {
		const reminderDate = new Date(auctionDateTime - i * MESSAGE_INTERVAL);

		reminderDates.push({
			userId,
			auctionProductId,
			sendDate: reminderDate.toISOString().slice(0, 10),
			daysBefore: i,
			sent: false,
		});
	}

	return await AuctionReminders.bulkCreate(reminderDates, {
		ignoreDuplicates: true,
	});
}

export async function sendAuctionReminders() {
	const batchSize = 20;
	let lastAuctionReminderId = null;
	let batch;

	do {
		const where: any = {
			sendDate: { [Op.gte]: new Date().toISOString().slice(0, 10) },
			sent: false,
		};

		if (lastAuctionReminderId) {
			where.id = { [Op.gt]: lastAuctionReminderId };
		}

		batch = await AuctionReminders.findAll({
			where,
			limit: batchSize,
			order: [["id", "ASC"]],
			include: [
				{
					model: User,
					as: "User",
					attributes: ["id", "email", "firstName", "lastName"],
				},
				{
					model: AuctionProduct,
					as: "AuctionProduct",
					attributes: ["id", "name", "startDate"],
				},
			],
		});

		await Promise.all(
			batch.map((reminder) =>
				limit(async () => {
					const user = reminder.user;
					const auctionProduct = reminder.auctionProduct;
					if (user && auctionProduct) {
						const emailContent = emailTemplates.auctionReminderNotification(
							{
								email: user.email,
								firstName: user.firstName,
								lastName: user.lastName,
							},
							{
								productName: auctionProduct?.name as string,
								auctionDate: auctionProduct.startDate
									.toISOString()
									.slice(0, 10),
								daysBefore: reminder.daysBefore,
								startingBid: String(auctionProduct.price),
							},
						);

						// Assuming you have a function to send emails
						await sendMail(user.email, "Auction Reminder", emailContent);
					}
				}),
			),
		);

		const idsToMark = batch.map((r) => r.id);

		await AuctionReminders.update({ sent: true }, { where: { id: idsToMark } });

		lastAuctionReminderId =
			batch.length > 0 ? batch[batch.length - 1].id : null;
	} while (batch.length === batchSize);
}

export async function deleteAuctionReminder() {
	return await AuctionReminders.destroy({
		where: {
			sendDate: { [Op.lt]: new Date().toISOString().slice(0, 10) },
			sent: true,
		},
	});
}
