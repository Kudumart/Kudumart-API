import { Router } from "express";
import adminAuthMiddleware from "../middlewares/adminAuthMiddleware";
import checkPermission from "../middlewares/checkPermissionMiddleware";
import * as crm from "../controllers/crmController";

const routes = Router();
routes.use(adminAuthMiddleware);

routes.get("/dashboard", checkPermission("view-crm"), crm.dashboard);
routes.get("/campaigns", checkPermission("view-crm"), crm.listCampaigns);
routes.post("/campaigns", checkPermission("manage-crm"), crm.createCampaign);
routes.put("/campaigns/:campaignId", checkPermission("manage-crm"), crm.updateCampaign);
routes.post("/campaigns/:campaignId/representatives", checkPermission("manage-crm"), crm.assignRepresentative);

routes.get("/representatives", checkPermission("view-crm"), crm.listRepresentatives);
routes.post("/representatives", checkPermission("manage-crm"), crm.createRepresentative);
routes.put("/representatives/:representativeId", checkPermission("manage-crm"), crm.updateRepresentative);

routes.get("/referrals", checkPermission("view-crm"), crm.listReferrals);
routes.post("/referrals", checkPermission("manage-crm"), crm.createReferral);
routes.patch("/referrals/:referralId/status", checkPermission("manage-crm"), crm.qualifyReferral);

routes.get("/commission-rules", checkPermission("view-crm"), crm.listRules);
routes.post("/commission-rules", checkPermission("manage-crm"), crm.createRule);
routes.get("/commissions", checkPermission("view-crm"), crm.listCommissions);
routes.patch("/commissions/:commissionId/status", checkPermission("manage-crm"), crm.updateCommission);

routes.get("/payouts", checkPermission("view-crm"), crm.listPayouts);
routes.post("/payouts", checkPermission("manage-crm"), crm.createPayout);
routes.patch("/payouts/:payoutId/status", checkPermission("manage-crm"), crm.updatePayout);

export default routes;
