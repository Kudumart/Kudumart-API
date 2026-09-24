import { Transaction } from "sequelize";
import Notification from "../models/notification";
import SalesAgent from "../models/salesagent";

export const notifySalesAgent = async (agentId: string, title: string, message: string, type: string, transaction?: Transaction) => {
	const agent = await SalesAgent.findByPk(agentId, { attributes: ["id", "userId"], transaction });
	if (!agent?.userId) return null;
	return Notification.create({ userId: agent.userId, title, message, type, isRead: false }, { transaction });
};

export const notifyLinkedUser = (userId: string, title: string, message: string, type: string, transaction?: Transaction) =>
	Notification.create({ userId, title, message, type, isRead: false }, { transaction });
