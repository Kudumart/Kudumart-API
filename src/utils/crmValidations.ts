import { body, param, query } from "express-validator";
const stages = ["NEW", "CONTACTED", "QUALIFIED", "ONBOARDING", "WON", "LOST"];
export const listCrmLeadsValidation = () => [query("page").optional().isInt({ min: 1 }).toInt(), query("limit").optional().isInt({ min: 1, max: 100 }).toInt(), query("stage").optional().isIn(stages), query("ownerAgentId").optional().isUUID(), query("entityType").optional().isIn(["CUSTOMER", "VENDOR"]), query("search").optional().trim().isLength({ max: 191 })];
export const crmLeadIdValidation = () => [param("leadId").isUUID().withMessage("Invalid CRM lead ID")];
const fields = (update = false, includeOwner = true) => [
	...(includeOwner ? [body("ownerAgentId").optional(update).isUUID()] : []), body("firstName").optional(update).trim().notEmpty().isLength({ max: 100 }), body("lastName").optional(update).trim().notEmpty().isLength({ max: 100 }),
	body("email").optional({ nullable: true }).isEmail().normalizeEmail(), body("phoneNumber").optional({ nullable: true }).trim().isLength({ max: 40 }), body("entityType").optional(update).isIn(["CUSTOMER", "VENDOR"]),
	body("source").optional({ nullable: true }).trim().isLength({ max: 80 }), body("referralCodeId").optional({ nullable: true }).isUUID(), body("nextFollowUpAt").optional({ nullable: true }).isISO8601().toDate(),
	body("expectedValue").optional({ nullable: true }).isFloat({ min: 0 }).toFloat(), body("currency").optional({ nullable: true }).matches(/^[A-Za-z]{3}$/), body("lostReason").optional({ nullable: true }).trim().isLength({ max: 1000 }),
];
export const createCrmLeadValidation = () => fields(false);
export const createOwnCrmLeadValidation = () => fields(false, false);
export const updateCrmLeadValidation = () => fields(true);
export const changeCrmLeadStageValidation = () => [...crmLeadIdValidation(), body("stage").isIn(stages), body("lostReason").if(body("stage").equals("LOST")).trim().isLength({ min: 3, max: 1000 })];
export const createCrmActivityValidation = () => [...crmLeadIdValidation(), body("type").isIn(["NOTE", "CALL", "EMAIL", "MEETING", "TASK"]), body("subject").trim().notEmpty().isLength({ max: 191 }), body("details").optional({ nullable: true }).isString().isLength({ max: 5000 }), body("dueAt").optional({ nullable: true }).isISO8601().toDate(), body("completedAt").optional({ nullable: true }).isISO8601().toDate()];
