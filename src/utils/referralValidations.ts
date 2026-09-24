import { param, query } from "express-validator";

const REFERRAL_STATUSES = [
	"REGISTERED",
	"VERIFIED",
	"QUALIFIED",
	"CONVERTED",
	"INACTIVE",
	"REJECTED",
	"DISQUALIFIED",
] as const;

export const listReferralsValidation = () => [
	query("page").optional().isInt({ min: 1 }).toInt(),
	query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
	query("status").optional().isIn(REFERRAL_STATUSES),
	query("programId").optional().isUUID(),
	query("agentId").optional().isUUID(),
	query("referredEntityType").optional().isIn(["CUSTOMER", "VENDOR"]),
	query("search").optional().trim().isLength({ max: 150 }),
];

export const referralIdValidation = () => [
	param("referralId").isUUID().withMessage("Invalid referral ID"),
];
