import crypto from "crypto";
import { Request, Response } from "express";
import { Op, UniqueConstraintError } from "sequelize";
import logger from "../middlewares/logger";
import Admin from "../models/admin";
import SalesAgent from "../models/salesagent";
import User from "../models/user";
import SalesAgentLinkEvent from "../models/salesagentlinkevent";
import { notifyLinkedUser } from "../services/salesNotification.service";

interface AdminRequest extends Request {
	adminId?: string;
	admin?: Admin;
}

type AgentStatus = "INVITED" | "ACTIVE" | "SUSPENDED" | "TERMINATED";

const STATUS_TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
	INVITED: ["ACTIVE", "SUSPENDED", "TERMINATED"],
	ACTIVE: ["SUSPENDED", "TERMINATED"],
	SUSPENDED: ["ACTIVE", "TERMINATED"],
	TERMINATED: [],
};

const EDITABLE_FIELDS = [
	"firstName",
	"lastName",
	"email",
	"phoneNumber",
	"employeeReference",
	"agentType",
	"managerId",
	"crmUserId",
] as const;

const pickEditableFields = (body: Record<string, unknown>) =>
	Object.fromEntries(
		EDITABLE_FIELDS.filter((field) =>
			Object.prototype.hasOwnProperty.call(body, field),
		).map((field) => [field, body[field]]),
	);

const handleControllerError = (
	error: unknown,
	res: Response,
	operation: string,
) => {
	if (error instanceof UniqueConstraintError) {
		const field = Object.keys(error.fields || {})[0];
		res.status(409).json({
			message: field
				? `A sales agent with this ${field} already exists`
				: "A matching sales agent already exists",
		});
		return;
	}

	logger.error(`Error ${operation}:`, error);
	res.status(500).json({ message: "Internal server error" });
};

const generateAgentCode = async (firstName: string, lastName: string) => {
	const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`
		.replace(/[^A-Za-z]/g, "")
		.toUpperCase() || "AG";

	for (let attempt = 0; attempt < 10; attempt += 1) {
		const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
		const code = `KDM-${initials}-${suffix}`;
		if (!(await SalesAgent.findOne({ where: { agentCode: code } }))) return code;
	}

	throw new Error("Unable to generate a unique sales agent code");
};

const validateRelationships = async (
	attributes: Record<string, unknown>,
	agentId?: string,
): Promise<string | null> => {
	if (attributes.userId) {
		const user = await User.findByPk(attributes.userId as string);
		if (!user) return "The selected Kudu user does not exist";

		const linkedAgent = await SalesAgent.findOne({
			where: {
				userId: attributes.userId,
				...(agentId ? { id: { [Op.ne]: agentId } } : {}),
			},
		});
		if (linkedAgent) return "The selected Kudu user is already linked to an agent";
	}

	if (attributes.managerId) {
		if (attributes.managerId === agentId) return "An agent cannot manage themselves";

		const manager = await SalesAgent.findByPk(attributes.managerId as string);
		if (!manager) return "The selected manager does not exist";
		if (manager.status === "TERMINATED") {
			return "A terminated agent cannot be assigned as a manager";
		}

		if (agentId) {
			let ancestor: SalesAgent | null = manager;
			const visited = new Set<string>();
			while (ancestor) {
				if (ancestor.id === agentId) {
					return "This manager assignment would create a reporting cycle";
				}
				if (!ancestor.managerId || visited.has(ancestor.id)) break;
				visited.add(ancestor.id);
				ancestor = await SalesAgent.findByPk(ancestor.managerId);
			}
		}
	}

	return null;
};

const agentIncludes = [
	{
		model: User,
		as: "user",
		attributes: ["id", "firstName", "lastName", "email", "accountType", "status"],
	},
	{
		model: SalesAgent,
		as: "manager",
		attributes: ["id", "agentCode", "firstName", "lastName", "email", "status"],
	},
];

export const listSalesAgents = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const { status, agentType, managerId, search } = req.query;
		const where: Record<string | symbol, unknown> = {};

		if (status) where.status = status;
		if (agentType) where.agentType = agentType;
		if (managerId) where.managerId = managerId;
		if (search) {
			where[Op.or] = [
				{ firstName: { [Op.like]: `%${search}%` } },
				{ lastName: { [Op.like]: `%${search}%` } },
				{ email: { [Op.like]: `%${search}%` } },
				{ agentCode: { [Op.like]: `%${search}%` } },
				{ employeeReference: { [Op.like]: `%${search}%` } },
			];
		}

		const { rows, count } = await SalesAgent.findAndCountAll({
			where,
			include: agentIncludes,
			distinct: true,
			limit,
			offset: (page - 1) * limit,
			order: [["createdAt", "DESC"]],
		});

		res.status(200).json({
			data: rows,
			pagination: {
				page,
				limit,
				total: count,
				totalPages: Math.ceil(count / limit),
			},
		});
	} catch (error) {
		handleControllerError(error, res, "listing sales agents");
	}
};

export const getSalesAgent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const agent = await SalesAgent.findByPk(req.params.agentId as string, {
			include: agentIncludes,
		});
		if (!agent) {
			res.status(404).json({ message: "Sales agent not found" });
			return;
		}
		res.status(200).json({ data: agent });
	} catch (error) {
		handleControllerError(error, res, "fetching sales agent");
	}
};

export const createSalesAgent = async (
	req: AdminRequest,
	res: Response,
): Promise<void> => {
	try {
		const attributes = pickEditableFields(req.body);
		const relationshipError = await validateRelationships(attributes);
		if (relationshipError) {
			res.status(422).json({ message: relationshipError });
			return;
		}

		const agentCode = await generateAgentCode(
			attributes.firstName as string,
			attributes.lastName as string,
		);
		const agent = await SalesAgent.create({
			...attributes,
			agentCode,
			status: "INVITED",
		});

		res.status(201).json({
			message: "Sales agent created successfully",
			data: agent,
		});
	} catch (error) {
		handleControllerError(error, res, "creating sales agent");
	}
};

export const updateSalesAgent = async (
	req: AdminRequest,
	res: Response,
): Promise<void> => {
	try {
		const agent = await SalesAgent.findByPk(req.params.agentId as string);
		if (!agent) {
			res.status(404).json({ message: "Sales agent not found" });
			return;
		}
		if (agent.status === "TERMINATED") {
			res.status(409).json({ message: "Terminated sales agents cannot be edited" });
			return;
		}

		const attributes = pickEditableFields(req.body);
		const relationshipError = await validateRelationships(attributes, agent.id);
		if (relationshipError) {
			res.status(422).json({ message: relationshipError });
			return;
		}

		await agent.update(attributes);
		res.status(200).json({
			message: "Sales agent updated successfully",
			data: agent,
		});
	} catch (error) {
		handleControllerError(error, res, "updating sales agent");
	}
};

export const transitionSalesAgent = async (
	req: AdminRequest,
	res: Response,
): Promise<void> => {
	try {
		const agent = await SalesAgent.findByPk(req.params.agentId as string);
		if (!agent) {
			res.status(404).json({ message: "Sales agent not found" });
			return;
		}

		const targetStatus = req.body.status as AgentStatus;
		const allowed = STATUS_TRANSITIONS[agent.status as AgentStatus] || [];
		if (!allowed.includes(targetStatus)) {
			res.status(409).json({
				message: `Cannot move a sales agent from ${agent.status} to ${targetStatus}`,
				allowedTransitions: allowed,
			});
			return;
		}

		const now = new Date();
		const timestamps: Record<string, Date | null> = {};
		if (targetStatus === "ACTIVE") {
			if (!agent.joinedAt) timestamps.joinedAt = now;
			timestamps.suspendedAt = null;
		}
		if (targetStatus === "SUSPENDED") timestamps.suspendedAt = now;
		if (targetStatus === "TERMINATED") timestamps.terminatedAt = now;

		await agent.update({ status: targetStatus, ...timestamps });
		res.status(200).json({
			message: `Sales agent status changed to ${targetStatus}`,
			data: agent,
		});
	} catch (error) {
		handleControllerError(error, res, "changing sales agent status");
	}
};

export const linkSalesAgentAccount = async (req: AdminRequest, res: Response): Promise<void> => {
	try {
		if (!SalesAgent.sequelize) throw new Error("Database is not initialized");
		const result = await SalesAgent.sequelize.transaction(async (transaction) => {
			const agent = await SalesAgent.findByPk(req.params.agentId as string, { transaction, lock: transaction.LOCK.UPDATE });
			if (!agent) return { error: "Sales agent not found", status: 404 };
			if (agent.status === "TERMINATED") return { error: "Terminated agents cannot be linked", status: 409 };
			const user = await User.findOne({ where: { email: String(req.body.email).trim().toLowerCase() }, transaction });
			if (!user) return { error: "No Kudu account uses this email address", status: 404 };
			if (user.status !== "active") return { error: "The Kudu account is not active", status: 409 };
			if (!user.email_verified_at) return { error: "The Kudu account email must be verified first", status: 409 };
			const existing = await SalesAgent.findOne({ where: { userId: user.id, id: { [Op.ne]: agent.id } }, transaction });
			if (existing) return { error: "This Kudu account is already linked to another sales agent", status: 409 };
			if (agent.userId === user.id) return { agent, user, alreadyLinked: true };
			if (agent.userId) return { error: "Unlink the current Kudu account before linking another", status: 409 };
			const linkedAt = new Date();
			await agent.update({ userId: user.id, linkedAt, linkedByAdminId: req.adminId }, { transaction });
			await SalesAgentLinkEvent.create({ agentId: agent.id, userId: user.id, adminId: req.adminId, action: "LINKED", occurredAt: linkedAt }, { transaction });
			await notifyLinkedUser(user.id, "Sales workspace enabled", `Your Kudu account is now linked to sales agent ${agent.agentCode}.`, "sales_agent_linked", transaction);
			return { agent, user, alreadyLinked: false };
		});
		if ("error" in result) { res.status(result.status ?? 500).json({ message: result.error }); return; }
		res.status(200).json({ message: result.alreadyLinked ? "Sales agent is already linked to this account" : "Sales agent linked to Kudu account", data: result.agent });
	} catch (error) { handleControllerError(error, res, "linking sales agent account"); }
};

export const unlinkSalesAgentAccount = async (req: AdminRequest, res: Response): Promise<void> => {
	try {
		if (!SalesAgent.sequelize) throw new Error("Database is not initialized");
		const result = await SalesAgent.sequelize.transaction(async (transaction) => {
			const agent = await SalesAgent.findByPk(req.params.agentId as string, { transaction, lock: transaction.LOCK.UPDATE });
			if (!agent) return { error: "Sales agent not found", status: 404 };
			if (!agent.userId) return { error: "Sales agent is not linked to a Kudu account", status: 409 };
			const userId = agent.userId, occurredAt = new Date();
			await SalesAgentLinkEvent.create({ agentId: agent.id, userId, adminId: req.adminId, action: "UNLINKED", reason: req.body.reason, occurredAt }, { transaction });
			await agent.update({ userId: null, linkedAt: null, linkedByAdminId: null }, { transaction });
			return { agent };
		});
		if ("error" in result) { res.status(result.status ?? 500).json({ message: result.error }); return; }
		res.status(200).json({ message: "Sales agent account unlinked", data: result.agent });
	} catch (error) { handleControllerError(error, res, "unlinking sales agent account"); }
};
