import { body, param, query } from "express-validator";

const PROGRAM_STATUSES = [
	"DRAFT",
	"SCHEDULED",
	"ACTIVE",
	"PAUSED",
	"ENDED",
	"ARCHIVED",
] as const;

const REFERRER_TYPES = [
	"SALES_AGENT",
	"CUSTOMER",
	"VENDOR",
	"AFFILIATE",
	"PARTNER",
] as const;

const REFERRED_ENTITY_TYPES = ["CUSTOMER", "VENDOR", "BOTH"] as const;

const ATTRIBUTION_MODELS = [
	"FIRST_TOUCH",
	"LAST_TOUCH",
	"MANUAL_ASSIGNMENT",
	"CRM_OWNER",
	"REFERRAL_CODE_PRIORITY",
] as const;

const CURRENCY_MODES = [
	"TRANSACTION_CURRENCY",
	"FIXED_PAYOUT_CURRENCY",
] as const;

const QUALIFICATION_ENTITY_TYPES = ["CUSTOMER", "VENDOR", "BOTH"] as const;
const QUALIFICATION_OPERATORS = [
	"EQUALS",
	"GREATER_THAN_OR_EQUAL",
	"GREATER_THAN",
	"LESS_THAN_OR_EQUAL",
	"LESS_THAN",
] as const;

const qualificationRulesValidation = body("qualificationRules")
	.optional()
	.isArray({ max: 20 })
	.withMessage("Qualification rules must be an array containing at most 20 rules")
	.custom((rules) => {
		const ids = new Set<string>();
		for (const rule of rules) {
			if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
				throw new Error("Each qualification rule must be an object");
			}
			if (typeof rule.id !== "string" || !/^[A-Za-z][A-Za-z0-9_-]{0,59}$/.test(rule.id)) {
				throw new Error("Each qualification rule needs a valid unique ID");
			}
			if (ids.has(rule.id)) throw new Error("Qualification rule IDs must be unique");
			ids.add(rule.id);
			if (!QUALIFICATION_ENTITY_TYPES.includes(rule.entityType)) {
				throw new Error("Qualification rule entity type is invalid");
			}
			if (typeof rule.metric !== "string" || !/^[A-Z][A-Z0-9_]{0,79}$/.test(rule.metric)) {
				throw new Error("Qualification rule metric must be an uppercase metric key");
			}
			if (!QUALIFICATION_OPERATORS.includes(rule.operator)) {
				throw new Error("Qualification rule operator is invalid");
			}
			if (typeof rule.value !== "number" || !Number.isFinite(rule.value) || rule.value < 0) {
				throw new Error("Qualification rule value must be a non-negative number");
			}
			if (
				rule.windowDays !== undefined &&
				(!Number.isInteger(rule.windowDays) || rule.windowDays < 1 || rule.windowDays > 3650)
			) {
				throw new Error("Qualification rule window must be between 1 and 3650 days");
			}
		}
		return true;
	});

const commissionRulesValidation = body("commissionRules")
	.optional()
	.isArray({ max: 20 })
	.withMessage("Commission rules must be an array containing at most 20 rules")
	.custom((rules) => {
		const ids = new Set<string>();
		for (const rule of rules) {
			if (!rule || typeof rule !== "object" || Array.isArray(rule)) throw new Error("Each commission rule must be an object");
			if (typeof rule.id !== "string" || !/^[A-Za-z][A-Za-z0-9_-]{0,59}$/.test(rule.id)) throw new Error("Each commission rule needs a valid unique ID");
			if (ids.has(rule.id)) throw new Error("Commission rule IDs must be unique");
			ids.add(rule.id);
			if (!QUALIFICATION_ENTITY_TYPES.includes(rule.entityType)) throw new Error("Commission rule entity type is invalid");
			if (!["CUSTOMER_COMPLETED_ORDER", "VENDOR_COMPLETED_ORDER"].includes(rule.trigger)) throw new Error("Commission trigger is invalid");
			if (!["PERCENTAGE", "FIXED"].includes(rule.calculationType)) throw new Error("Commission calculation type is invalid");
			if (typeof rule.rate !== "number" || !Number.isFinite(rule.rate) || rule.rate <= 0) throw new Error("Commission rate must be greater than zero");
			if (rule.calculationType === "PERCENTAGE" && rule.rate > 100) throw new Error("Percentage commission cannot exceed 100");
			if (rule.currency !== undefined && !/^[A-Za-z]{3}$/.test(rule.currency)) throw new Error("Commission currency must be a three-letter code");
			for (const field of ["minimumSourceAmount", "maximumCommissionAmount"]) {
				if (rule[field] !== undefined && (typeof rule[field] !== "number" || !Number.isFinite(rule[field]) || rule[field] < 0)) throw new Error(`${field} must be a non-negative number`);
			}
		}
		return true;
	});

const commonProgramFields = (isUpdate: boolean) => [
	body("name")
		.optional(isUpdate)
		.trim()
		.notEmpty()
		.withMessage("Programme name is required")
		.isLength({ max: 150 }),
	body("code")
		.optional(isUpdate)
		.trim()
		.notEmpty()
		.withMessage("Programme code is required")
		.isLength({ max: 60 })
		.matches(/^[A-Za-z][A-Za-z0-9_-]*$/)
		.withMessage(
			"Programme code must start with a letter and contain only letters, numbers, hyphens, or underscores",
		),
	body("description").optional({ nullable: true }).isString(),
	body("referrerType").optional().isIn(REFERRER_TYPES),
	body("referredEntityType").optional().isIn(REFERRED_ENTITY_TYPES),
	body("attributionModel").optional().isIn(ATTRIBUTION_MODELS),
	body("attributionWindowDays")
		.optional()
		.isInt({ min: 1, max: 3650 })
		.toInt(),
	body("commissionDurationDays")
		.optional({ nullable: true })
		.isInt({ min: 1, max: 3650 })
		.toInt(),
	body("holdingPeriodDays")
		.optional()
		.isInt({ min: 0, max: 365 })
		.withMessage("Holding period must be between 0 and 365 days")
		.toInt(),
	qualificationRulesValidation,
	commissionRulesValidation,
	body("currencyMode").optional().isIn(CURRENCY_MODES),
	body("defaultPayoutCurrency")
		.optional({ nullable: true })
		.trim()
		.matches(/^[A-Za-z]{3}$/)
		.withMessage("Default payout currency must be a three-letter currency code"),
	body("minimumPayoutAmount")
		.optional()
		.isFloat({ min: 0 })
		.withMessage("Minimum payout amount must be zero or greater"),
	body("allowExistingUsers").optional().isBoolean().toBoolean(),
	body("allowSelfReferral").optional().isBoolean().toBoolean(),
	body("reassignmentRequiresApproval")
		.optional()
		.isBoolean()
		.toBoolean(),
	body("startsAt").optional({ nullable: true }).isISO8601().toDate(),
	body("endsAt").optional({ nullable: true }).isISO8601().toDate(),
	body("termsUrl").optional({ nullable: true }).isURL(),
];

export const createReferralProgramValidation = () => commonProgramFields(false);

export const updateReferralProgramValidation = () => [
	...commonProgramFields(true),
	body().custom((value) => {
		const editableFields = [
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
		];

		if (
			!editableFields.some((field) =>
				Object.prototype.hasOwnProperty.call(value, field),
			)
		) {
			throw new Error("At least one editable programme field is required");
		}
		return true;
	}),
];

export const referralProgramIdValidation = () => [
	param("programId").isUUID().withMessage("Invalid referral programme ID"),
];

export const listReferralProgramsValidation = () => [
	query("page").optional().isInt({ min: 1 }).toInt(),
	query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
	query("status").optional().isIn(PROGRAM_STATUSES),
	query("search").optional().trim().isLength({ max: 150 }),
];

export const transitionReferralProgramValidation = () => [
	...referralProgramIdValidation(),
	body("status")
		.isIn(["ACTIVE", "PAUSED", "ENDED", "ARCHIVED"])
		.withMessage("Unsupported programme status transition"),
];
