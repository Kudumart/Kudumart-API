import { Request, Response } from "express";
import { Op, UniqueConstraintError } from "sequelize";
import Admin from "../models/admin";
import ReferralProgram from "../models/referralprogram";
import logger from "../middlewares/logger";

interface AdminRequest extends Request {
	adminId?: string;
	admin?: Admin;
}

const EDITABLE_FIELDS = [
	"name",
	"code",
	"description",
	"referrerType",
	"referredEntityType",
	"attributionModel",
	"attributionWindowDays",
	"commissionDurationDays",
	"holdingPeriodDays",
	"qualificationRules",
	"commissionRules",
	"currencyMode",
	"defaultPayoutCurrency",
	"minimumPayoutAmount",
	"allowExistingUsers",
	"allowSelfReferral",
	"reassignmentRequiresApproval",
	"startsAt",
	"endsAt",
	"termsUrl",
] as const;

type ProgramStatus =
	| "DRAFT"
	| "SCHEDULED"
	| "ACTIVE"
	| "PAUSED"
	| "ENDED"
	| "ARCHIVED";

const STATUS_TRANSITIONS: Record<ProgramStatus, ProgramStatus[]> = {
	DRAFT: [],
	SCHEDULED: ["ACTIVE", "PAUSED", "ENDED"],
	ACTIVE: ["PAUSED", "ENDED"],
	PAUSED: ["ACTIVE", "ENDED"],
	ENDED: ["ARCHIVED"],
	ARCHIVED: [],
};

const pickEditableFields = (body: Record<string, unknown>) =>
	Object.fromEntries(
		EDITABLE_FIELDS.filter((field) =>
			Object.prototype.hasOwnProperty.call(body, field),
		).map((field) => [field, body[field]]),
	);

const validateProgrammeConfiguration = (
	program: Partial<ReferralProgram>,
	requireQualificationRules = false,
): string | null => {
	if (program.startsAt && program.endsAt) {
		if (new Date(program.endsAt).getTime() <= new Date(program.startsAt).getTime()) {
			return "Programme end date must be later than its start date";
		}
	}

	if (
		program.currencyMode === "FIXED_PAYOUT_CURRENCY" &&
		!program.defaultPayoutCurrency
	) {
		return "A default payout currency is required for fixed-currency programmes";
	}

	if (program.qualificationRules?.length && program.referredEntityType !== "BOTH") {
		const incompatibleRule = program.qualificationRules.some(
			(rule) =>
				rule.entityType !== "BOTH" &&
				rule.entityType !== program.referredEntityType,
		);
		if (incompatibleRule) {
			return `Qualification rules must apply to ${program.referredEntityType?.toLowerCase()} referrals`;
		}
	}

	if (requireQualificationRules) {
		const rules = program.qualificationRules || [];
		const requiredEntityTypes =
			program.referredEntityType === "BOTH"
				? ["CUSTOMER", "VENDOR"]
				: [program.referredEntityType];
		const missingEntityType = requiredEntityTypes.find(
			(entityType) =>
				!rules.some(
					(rule) =>
						rule.entityType === "BOTH" || rule.entityType === entityType,
				),
		);
		if (missingEntityType) {
			return `Add at least one ${missingEntityType?.toLowerCase()} qualification rule before publishing`;
		}

		const commissionRules = program.commissionRules || [];
		const missingCommissionEntityType = requiredEntityTypes.find(
			(entityType) =>
				!commissionRules.some(
					(rule) =>
						(rule.entityType === "BOTH" || rule.entityType === entityType) &&
						rule.trigger === `${entityType}_COMPLETED_ORDER`,
				),
		);
		if (missingCommissionEntityType) {
			return `Add at least one ${missingCommissionEntityType?.toLowerCase()} commission rule before publishing`;
		}
	}

	return null;
};

const handleControllerError = (
	error: unknown,
	res: Response,
	operation: string,
) => {
	if (error instanceof UniqueConstraintError) {
		res.status(409).json({ message: "A programme with this code already exists" });
		return;
	}

	logger.error(`Error ${operation}:`, error);
	res.status(500).json({ message: "Internal server error" });
};

export const listReferralPrograms = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const page = Number(req.query.page) || 1;
		const limit = Number(req.query.limit) || 20;
		const status = req.query.status as ProgramStatus | undefined;
		const search = req.query.search as string | undefined;
		const where: Record<string | symbol, unknown> = {};

		if (status) where.status = status;
		if (search) {
			where[Op.or] = [
				{ name: { [Op.like]: `%${search}%` } },
				{ code: { [Op.like]: `%${search}%` } },
			];
		}

		const { rows, count } = await ReferralProgram.findAndCountAll({
			where,
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
		handleControllerError(error, res, "listing referral programmes");
	}
};

export const getReferralProgram = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const program = await ReferralProgram.findByPk(req.params.programId as string);
		if (!program) {
			res.status(404).json({ message: "Referral programme not found" });
			return;
		}
		res.status(200).json({ data: program });
	} catch (error) {
		handleControllerError(error, res, "fetching referral programme");
	}
};

export const createReferralProgram = async (
	req: AdminRequest,
	res: Response,
): Promise<void> => {
	try {
		const attributes = pickEditableFields(req.body);
		const configurationError = validateProgrammeConfiguration(
			attributes as Partial<ReferralProgram>,
		);
		if (configurationError) {
			res.status(422).json({ message: configurationError });
			return;
		}

		const program = await ReferralProgram.create({
			...attributes,
			status: "DRAFT",
			createdBy: req.adminId,
			updatedBy: req.adminId,
		});

		res.status(201).json({
			message: "Referral programme draft created successfully",
			data: program,
		});
	} catch (error) {
		handleControllerError(error, res, "creating referral programme");
	}
};

export const updateReferralProgram = async (
	req: AdminRequest,
	res: Response,
): Promise<void> => {
	try {
		const program = await ReferralProgram.findByPk(req.params.programId as string);
		if (!program) {
			res.status(404).json({ message: "Referral programme not found" });
			return;
		}
		if (program.status !== "DRAFT") {
			res.status(409).json({
				message: "Only draft programmes can be edited",
			});
			return;
		}

		const attributes = pickEditableFields(req.body);
		const candidate = { ...program.get(), ...attributes } as Partial<ReferralProgram>;
		const configurationError = validateProgrammeConfiguration(candidate);
		if (configurationError) {
			res.status(422).json({ message: configurationError });
			return;
		}

		await program.update({ ...attributes, updatedBy: req.adminId });
		res.status(200).json({
			message: "Referral programme draft updated successfully",
			data: program,
		});
	} catch (error) {
		handleControllerError(error, res, "updating referral programme");
	}
};

export const publishReferralProgram = async (
	req: AdminRequest,
	res: Response,
): Promise<void> => {
	try {
		const program = await ReferralProgram.findByPk(req.params.programId as string);
		if (!program) {
			res.status(404).json({ message: "Referral programme not found" });
			return;
		}
		if (program.status !== "DRAFT") {
			res.status(409).json({ message: "Only draft programmes can be published" });
			return;
		}

		const configurationError = validateProgrammeConfiguration(program, true);
		if (configurationError) {
			res.status(422).json({ message: configurationError });
			return;
		}

		const status: ProgramStatus =
			program.startsAt && program.startsAt.getTime() > Date.now()
				? "SCHEDULED"
				: "ACTIVE";
		await program.update({ status, updatedBy: req.adminId });

		res.status(200).json({
			message:
				status === "SCHEDULED"
					? "Referral programme scheduled successfully"
					: "Referral programme published successfully",
			data: program,
		});
	} catch (error) {
		handleControllerError(error, res, "publishing referral programme");
	}
};

export const transitionReferralProgram = async (
	req: AdminRequest,
	res: Response,
): Promise<void> => {
	try {
		const program = await ReferralProgram.findByPk(req.params.programId as string);
		if (!program) {
			res.status(404).json({ message: "Referral programme not found" });
			return;
		}

		const targetStatus = req.body.status as ProgramStatus;
		const allowed = STATUS_TRANSITIONS[program.status as ProgramStatus] || [];
		if (!allowed.includes(targetStatus)) {
			res.status(409).json({
				message: `Cannot move a referral programme from ${program.status} to ${targetStatus}`,
				allowedTransitions: allowed,
			});
			return;
		}

		await program.update({ status: targetStatus, updatedBy: req.adminId });
		res.status(200).json({
			message: `Referral programme status changed to ${targetStatus}`,
			data: program,
		});
	} catch (error) {
		handleControllerError(error, res, "changing referral programme status");
	}
};
