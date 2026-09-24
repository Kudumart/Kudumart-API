import { body, param, query } from "express-validator";

export const listCommissionEarningsValidation = () => [
	query("page").optional().isInt({ min: 1 }).toInt(),
	query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
	query("status").optional().isIn(["PENDING", "AVAILABLE", "PAID", "REVERSED", "CANCELLED"]),
	query("agentId").optional().isUUID(),
	query("programId").optional().isUUID(),
];

export const reverseCommissionEarningValidation = () => [
	param("earningId").isUUID().withMessage("Invalid commission earning ID"),
	body("reason").trim().isLength({ min: 3, max: 500 }).withMessage("A reversal reason between 3 and 500 characters is required"),
];
