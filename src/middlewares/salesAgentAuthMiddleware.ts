import { NextFunction, Request, Response } from "express";
import SalesAgent from "../models/salesagent";
import { AuthenticatedRequest } from "../types";

export interface SalesAgentRequest extends AuthenticatedRequest { salesAgent?: SalesAgent }

const salesAgentAuthMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	const user = (req as AuthenticatedRequest).user;
	if (!user || user.status !== "active") { res.status(403).json({ message: "Active Kudu account required" }); return; }
	const agent = await SalesAgent.findOne({ where: { userId: user.id } });
	if (!agent) { res.status(403).json({ message: "This account is not linked to a sales agent" }); return; }
	if (agent.status !== "ACTIVE") { res.status(403).json({ message: `Sales agent access is ${agent.status.toLowerCase()}` }); return; }
	(req as SalesAgentRequest).salesAgent = agent;
	next();
};
export default salesAgentAuthMiddleware;
