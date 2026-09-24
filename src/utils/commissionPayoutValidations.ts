import { body, param, query } from "express-validator";

const payoutId = param("payoutId").isUUID().withMessage("Invalid commission payout ID");

export const listCommissionPayoutsValidation = () => [
	query("page").optional().isInt({ min: 1 }).toInt(),
	query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
	query("status").optional().isIn(["DRAFT", "APPROVED", "PROCESSING", "PAID", "FAILED", "CANCELLED"]),
	query("agentId").optional().isUUID(),
];

export const createCommissionPayoutValidation = () => [
	body("agentId").isUUID().withMessage("Valid sales agent is required"),
	body("currency").trim().matches(/^[A-Za-z]{3}$/).withMessage("Currency must be a three-letter code"),
	body("earningIds").optional().isArray({ min: 1, max: 500 }),
	body("earningIds.*").optional().isUUID(),
];

export const commissionPayoutIdValidation = () => [payoutId];

export const markCommissionPayoutPaidValidation = () => [
	payoutId,
	body("paymentReference").trim().isLength({ min: 3, max: 191 }).withMessage("Payment reference is required"),
];
