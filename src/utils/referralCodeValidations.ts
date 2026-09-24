import { body, param, query } from "express-validator";

const CODE_STATUSES = ["ACTIVE", "PAUSED", "REVOKED", "EXPIRED"] as const;
const CHANNELS = [
	"WHATSAPP",
	"EMAIL",
	"PHONE",
	"FIELD_SALES",
	"SOCIAL_MEDIA",
	"EVENT",
	"WEBSITE",
	"OTHER",
] as const;

const optionalCodeFields = () => [
	body("destinationUrl")
		.optional()
		.trim()
		.isLength({ min: 1, max: 2048 }),
	body("campaignCode")
		.optional({ nullable: true })
		.trim()
		.isLength({ max: 80 })
		.matches(/^[A-Za-z0-9_-]+$/)
		.withMessage(
			"Campaign code may contain only letters, numbers, hyphens, and underscores",
		),
	body("channel").optional({ nullable: true }).isIn(CHANNELS),
	body("maximumUses")
		.optional({ nullable: true })
		.isInt({ min: 1 })
		.toInt(),
	body("expiresAt").optional({ nullable: true }).isISO8601().toDate(),
];

export const createReferralCodeValidation = () => [
	body("programId").isUUID().withMessage("Invalid referral programme ID"),
	body("agentId").isUUID().withMessage("Invalid sales agent ID"),
	...optionalCodeFields(),
];

export const updateReferralCodeValidation = () => [
	...optionalCodeFields(),
	body().custom((value) => {
		const editableFields = [
			"destinationUrl",
			"campaignCode",
			"channel",
			"maximumUses",
			"expiresAt",
		];
		if (
			!editableFields.some((field) =>
				Object.prototype.hasOwnProperty.call(value, field),
			)
		) {
			throw new Error("At least one editable referral-code field is required");
		}
		return true;
	}),
];

export const referralCodeIdValidation = () => [
	param("codeId").isUUID().withMessage("Invalid referral code ID"),
];

export const publicReferralCodeValidation = () => [
	param("code")
		.trim()
		.notEmpty()
		.isLength({ max: 80 })
		.matches(/^[A-Za-z0-9_-]+$/)
		.withMessage("Invalid referral code"),
	query("accountType")
		.optional()
		.customSanitizer((value) => String(value).toUpperCase())
		.isIn(["CUSTOMER", "VENDOR"])
		.withMessage("Account type must be CUSTOMER or VENDOR"),
];

export const listReferralCodesValidation = () => [
	query("page").optional().isInt({ min: 1 }).toInt(),
	query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
	query("status").optional().isIn(CODE_STATUSES),
	query("programId").optional().isUUID(),
	query("agentId").optional().isUUID(),
	query("channel").optional().isIn(CHANNELS),
	query("search").optional().trim().isLength({ max: 150 }),
];

export const transitionReferralCodeValidation = () => [
	...referralCodeIdValidation(),
	body("status")
		.isIn(CODE_STATUSES)
		.withMessage("Unsupported referral code status"),
];

export const recordReferralVisitValidation = () => [
	body("code")
		.trim()
		.notEmpty()
		.isLength({ max: 80 })
		.matches(/^[A-Za-z0-9_-]+$/),
	body("landingUrl")
		.optional({ nullable: true })
		.isURL({ require_protocol: true, require_tld: false })
		.isLength({ max: 2048 }),
	body("referrerUrl")
		.optional({ nullable: true })
		.isURL({ require_protocol: true, require_tld: false })
		.isLength({ max: 2048 }),
	body("visitorToken")
		.optional({ nullable: true })
		.isLength({ min: 64, max: 64 })
		.isHexadecimal(),
];
