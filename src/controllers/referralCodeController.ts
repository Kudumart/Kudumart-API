import crypto from "crypto";
import { Request, Response } from "express";
import { Op, UniqueConstraintError } from "sequelize";
import logger from "../middlewares/logger";
import ReferralCode from "../models/referralcode";
import ReferralProgram from "../models/referralprogram";
import SalesAgent from "../models/salesagent";

type CodeStatus = "ACTIVE" | "PAUSED" | "REVOKED" | "EXPIRED";

const STATUS_TRANSITIONS: Record<CodeStatus, CodeStatus[]> = {
	ACTIVE: ["PAUSED", "REVOKED", "EXPIRED"],
	PAUSED: ["ACTIVE", "REVOKED", "EXPIRED"],
	REVOKED: [],
	EXPIRED: [],
};

const EDITABLE_FIELDS = [
	"destinationUrl",
	"campaignCode",
	"channel",
	"maximumUses",
	"expiresAt",
] as const;

const codeIncludes = [
	{
		model: ReferralProgram,
		as: "program",
		attributes: [
			"id",
			"name",
			"code",
			"status",
			"referredEntityType",
			"startsAt",
			"endsAt",
		],
	},
	{
		model: SalesAgent,
		as: "agent",
		attributes: [
			"id",
			"agentCode",
			"firstName",
			"lastName",
			"email",
			"status",
		],
	},
];

const pickEditableFields = (body: Record<string, unknown>) =>
	Object.fromEntries(
		EDITABLE_FIELDS.filter((field) =>
			Object.prototype.hasOwnProperty.call(body, field),
		).map((field) => [field, body[field]]),
	);

const frontendOrigin = () => {
	const configured = process.env.FRONTEND_URL || process.env.APP_URL;
	if (!configured) return null;
	try {
		return new URL(configured).origin;
	} catch {
		return null;
	}
};

const normalizeDestinationUrl = (value?: unknown) => {
	const origin = frontendOrigin();
	if (!origin) {
		throw new Error("FRONTEND_URL or APP_URL must be configured");
	}

	const destination = String(value || "/sign-up").trim();
	const url = new URL(destination, origin);
	if (url.origin !== origin) {
		throw new Error("Referral destinations must use the configured frontend origin");
	}
	return url.toString();
};

export const buildReferralUrl = (code: ReferralCode) => {
	const url = new URL(code.destinationUrl);
	url.searchParams.set("ref", code.code);
	if (code.campaignCode) url.searchParams.set("campaign", code.campaignCode);
	if (code.channel) url.searchParams.set("channel", code.channel.toLowerCase());
	return url.toString();
};

const serializeCode = (code: ReferralCode) => ({
	...code.toJSON(),
	referralUrl: buildReferralUrl(code),
});

const isProgramCurrentlyActive = (program: ReferralProgram) => {
	const now = Date.now();
	return (
		program.status === "ACTIVE" &&
		(!program.startsAt || program.startsAt.getTime() <= now) &&
		(!program.endsAt || program.endsAt.getTime() > now)
	);
};

const codeEligibilityError = (
	code: ReferralCode,
	program: ReferralProgram,
	agent: SalesAgent,
	checkCodeStatus = true,
): string | null => {
	if (checkCodeStatus && code.status !== "ACTIVE") {
		return "Referral code is not active";
	}
	if (code.expiresAt && code.expiresAt.getTime() <= Date.now()) {
		return "Referral code has expired";
	}
	if (code.maximumUses !== undefined && code.maximumUses !== null) {
		if (code.usageCount >= code.maximumUses) {
			return "Referral code usage limit has been reached";
		}
	}
	if (!isProgramCurrentlyActive(program)) return "Referral programme is not active";
	if (agent.status !== "ACTIVE") return "Sales agent is not active";
	return null;
};

const handleControllerError = (
	error: unknown,
	res: Response,
	operation: string,
) => {
	if (error instanceof UniqueConstraintError) {
		res.status(409).json({ message: "This referral code already exists" });
		return;
	}
	if (
		error instanceof Error &&
		(error.message.includes("configured frontend") ||
			error.message.includes("frontend origin"))
	) {
		res.status(422).json({ message: error.message });
		return;
	}
	logger.error(`Error ${operation}:`, error);
	res.status(500).json({ message: "Internal server error" });
};

const generateCode = async (agentCode: string) => {
	for (let attempt = 0; attempt < 10; attempt += 1) {
		const suffix = crypto.randomBytes(4).toString("hex").toUpperCase();
		const candidate = `${agentCode}-${suffix}`;
		if (!(await ReferralCode.findOne({ where: { code: candidate } }))) {
			return candidate;
		}
	}
	throw new Error("Unable to generate a unique referral code");
};

export const listReferralCodes = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const { status, programId, agentId, channel, search } = req.query;
		const where: Record<string | symbol, unknown> = {};
		if (status) where.status = status;
		if (programId) where.programId = programId;
		if (agentId) where.agentId = agentId;
		if (channel) where.channel = channel;
		if (search) {
			where[Op.or] = [
				{ code: { [Op.like]: `%${search}%` } },
				{ campaignCode: { [Op.like]: `%${search}%` } },
			];
		}

		const { rows, count } = await ReferralCode.findAndCountAll({
			where,
			include: codeIncludes,
			distinct: true,
			limit,
			offset: (page - 1) * limit,
			order: [["createdAt", "DESC"]],
		});

		res.status(200).json({
			data: rows.map(serializeCode),
			pagination: {
				page,
				limit,
				total: count,
				totalPages: Math.ceil(count / limit),
			},
		});
	} catch (error) {
		handleControllerError(error, res, "listing referral codes");
	}
};

export const getReferralCode = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const code = await ReferralCode.findByPk(req.params.codeId as string, {
			include: codeIncludes,
		});
		if (!code) {
			res.status(404).json({ message: "Referral code not found" });
			return;
		}
		res.status(200).json({ data: serializeCode(code) });
	} catch (error) {
		handleControllerError(error, res, "fetching referral code");
	}
};

export const createReferralCode = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const [program, agent] = await Promise.all([
			ReferralProgram.findByPk(req.body.programId),
			SalesAgent.findByPk(req.body.agentId),
		]);
		if (!program) {
			res.status(404).json({ message: "Referral programme not found" });
			return;
		}
		if (!agent) {
			res.status(404).json({ message: "Sales agent not found" });
			return;
		}
		if (agent.status !== "ACTIVE") {
			res.status(422).json({ message: "Only active sales agents can receive codes" });
			return;
		}
		if (req.body.expiresAt && req.body.expiresAt.getTime() <= Date.now()) {
			res.status(422).json({ message: "Referral-code expiry must be in the future" });
			return;
		}

		const destinationUrl = normalizeDestinationUrl(req.body.destinationUrl);
		const codeValue = await generateCode(agent.agentCode);
		const status: CodeStatus = isProgramCurrentlyActive(program)
			? "ACTIVE"
			: "PAUSED";
		const code = await ReferralCode.create({
			programId: program.id,
			agentId: agent.id,
			code: codeValue,
			destinationUrl,
			campaignCode: req.body.campaignCode || null,
			channel: req.body.channel || null,
			maximumUses: req.body.maximumUses || null,
			expiresAt: req.body.expiresAt || null,
			status,
		});

		res.status(201).json({
			message:
				status === "ACTIVE"
					? "Referral code created successfully"
					: "Referral code created in a paused state because the programme is not active",
			data: serializeCode(code),
		});
	} catch (error) {
		handleControllerError(error, res, "creating referral code");
	}
};

export const updateReferralCode = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const code = await ReferralCode.findByPk(req.params.codeId as string);
		if (!code) {
			res.status(404).json({ message: "Referral code not found" });
			return;
		}
		if (["REVOKED", "EXPIRED"].includes(code.status)) {
			res.status(409).json({ message: `${code.status} referral codes cannot be edited` });
			return;
		}
		if (req.body.expiresAt && req.body.expiresAt.getTime() <= Date.now()) {
			res.status(422).json({ message: "Referral-code expiry must be in the future" });
			return;
		}

		const attributes = pickEditableFields(req.body);
		if (Object.prototype.hasOwnProperty.call(attributes, "destinationUrl")) {
			attributes.destinationUrl = normalizeDestinationUrl(attributes.destinationUrl);
		}
		await code.update(attributes);

		res.status(200).json({
			message: "Referral code updated successfully",
			data: serializeCode(code),
		});
	} catch (error) {
		handleControllerError(error, res, "updating referral code");
	}
};

export const transitionReferralCode = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const code = await ReferralCode.findByPk(req.params.codeId as string, {
			include: codeIncludes,
		});
		if (!code) {
			res.status(404).json({ message: "Referral code not found" });
			return;
		}

		const targetStatus = req.body.status as CodeStatus;
		const allowed = STATUS_TRANSITIONS[code.status as CodeStatus] || [];
		if (!allowed.includes(targetStatus)) {
			res.status(409).json({
				message: `Cannot move a referral code from ${code.status} to ${targetStatus}`,
				allowedTransitions: allowed,
			});
			return;
		}

		if (targetStatus === "ACTIVE") {
			const eligibilityError = codeEligibilityError(
				code,
				code.get("program") as ReferralProgram,
				code.get("agent") as SalesAgent,
				false,
			);
			if (eligibilityError) {
				res.status(422).json({ message: eligibilityError });
				return;
			}
		}

		await code.update({
			status: targetStatus,
			revokedAt: targetStatus === "REVOKED" ? new Date() : code.revokedAt,
		});
		res.status(200).json({
			message: `Referral code status changed to ${targetStatus}`,
			data: serializeCode(code),
		});
	} catch (error) {
		handleControllerError(error, res, "changing referral code status");
	}
};

export const validateReferralCode = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const code = await ReferralCode.findOne({
			where: { code: String(req.params.code).trim().toUpperCase() },
			include: [
				{ model: ReferralProgram, as: "program" },
				{ model: SalesAgent, as: "agent" },
			],
		});
		if (!code) {
			res.status(404).json({ valid: false, message: "Referral code is invalid" });
			return;
		}

		const program = code.get("program") as ReferralProgram;
		const agent = code.get("agent") as SalesAgent;
		const eligibilityError = codeEligibilityError(code, program, agent);
		if (eligibilityError) {
			res.status(200).json({ valid: false, message: eligibilityError });
			return;
		}
		const accountType = req.query.accountType as "CUSTOMER" | "VENDOR" | undefined;
		if (
			accountType &&
			program.referredEntityType !== "BOTH" &&
			program.referredEntityType !== accountType
		) {
			res.status(200).json({
				valid: false,
				message: `This referral code is not valid for ${accountType.toLowerCase()} accounts`,
			});
			return;
		}

		res.status(200).json({
			valid: true,
			data: {
				code: code.code,
				programName: program.name,
				referredEntityType: program.referredEntityType,
			},
		});
	} catch (error) {
		handleControllerError(error, res, "validating referral code");
	}
};
