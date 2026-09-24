import { body, param, query } from "express-validator";

const AGENT_TYPES = [
	"INTERNAL_SALES",
	"CONTRACTOR",
	"AFFILIATE",
	"INFLUENCER",
	"PARTNER",
] as const;

const AGENT_STATUSES = [
	"INVITED",
	"ACTIVE",
	"SUSPENDED",
	"TERMINATED",
] as const;

export const normalizeSalesAgentEmail = (value: unknown) => String(value).trim().toLowerCase();

const agentFields = (isUpdate: boolean) => [
	body("firstName")
		.optional(isUpdate)
		.trim()
		.notEmpty()
		.withMessage("First name is required")
		.isLength({ max: 100 }),
	body("lastName")
		.optional(isUpdate)
		.trim()
		.notEmpty()
		.withMessage("Last name is required")
		.isLength({ max: 100 }),
	body("email")
		.optional(isUpdate)
		.trim()
		.isEmail()
		.withMessage("A valid email address is required")
		.customSanitizer(normalizeSalesAgentEmail),
	body("phoneNumber")
		.optional({ nullable: true })
		.trim()
		.isLength({ min: 7, max: 40 }),
	body("employeeReference")
		.optional({ nullable: true })
		.trim()
		.isLength({ max: 80 }),
	body("agentType").optional().isIn(AGENT_TYPES),
	body("managerId").optional({ nullable: true }).isUUID(),
	body("crmUserId")
		.optional({ nullable: true })
		.trim()
		.isLength({ max: 191 }),
];

export const createSalesAgentValidation = () => agentFields(false);

export const updateSalesAgentValidation = () => [
	...agentFields(true),
	body().custom((value) => {
		const editableFields = [
			"firstName",
			"lastName",
			"email",
			"phoneNumber",
			"employeeReference",
			"agentType",
			"managerId",
			"crmUserId",
		];
		if (
			!editableFields.some((field) =>
				Object.prototype.hasOwnProperty.call(value, field),
			)
		) {
			throw new Error("At least one editable agent field is required");
		}
		return true;
	}),
];

export const salesAgentIdValidation = () => [
	param("agentId").isUUID().withMessage("Invalid sales agent ID"),
];

export const listSalesAgentsValidation = () => [
	query("page").optional().isInt({ min: 1 }).toInt(),
	query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
	query("status").optional().isIn(AGENT_STATUSES),
	query("agentType").optional().isIn(AGENT_TYPES),
	query("managerId").optional().isUUID(),
	query("search").optional().trim().isLength({ max: 150 }),
];

export const transitionSalesAgentValidation = () => [
	...salesAgentIdValidation(),
	body("status")
		.isIn(["ACTIVE", "SUSPENDED", "TERMINATED"])
		.withMessage("Unsupported sales agent status transition"),
];

export const linkSalesAgentAccountValidation = () => [
	...salesAgentIdValidation(),
	body("email").trim().isEmail().withMessage("A valid Kudu account email is required").customSanitizer(normalizeSalesAgentEmail),
];

export const unlinkSalesAgentAccountValidation = () => [
	...salesAgentIdValidation(),
	body("reason").trim().isLength({ min: 3, max: 500 }).withMessage("An unlink reason between 3 and 500 characters is required"),
];
