import { Request, Response } from "express";
import PlatformSetting from "../models/platformSetting";
import logger from "../middlewares/logger";

const PICKUP_SETTING_KEY = "pickup_settings";

export interface PickupSettingsData {
	pickupEnabled: boolean;
	pickupLabel: string;
	pickupAddress: string;
	pickupNote: string;
}

const DEFAULT_PICKUP_SETTINGS: PickupSettingsData = {
	pickupEnabled: true,
	pickupLabel: "Pick up from KuduMart",
	pickupAddress: "",
	pickupNote: "",
};

function parsePickupSettings(raw: string | null | undefined): PickupSettingsData {
	if (!raw) return { ...DEFAULT_PICKUP_SETTINGS };
	try {
		const parsed = JSON.parse(raw);
		return {
			pickupEnabled:
				typeof parsed.pickupEnabled === "boolean"
					? parsed.pickupEnabled
					: true,
			pickupLabel:
				typeof parsed.pickupLabel === "string" && parsed.pickupLabel.trim()
					? parsed.pickupLabel.trim()
					: DEFAULT_PICKUP_SETTINGS.pickupLabel,
			pickupAddress:
				typeof parsed.pickupAddress === "string"
					? parsed.pickupAddress.trim()
					: "",
			pickupNote:
				typeof parsed.pickupNote === "string" ? parsed.pickupNote.trim() : "",
		};
	} catch {
		return { ...DEFAULT_PICKUP_SETTINGS };
	}
}

export const getPickupSettings = async (
	_req: Request,
	res: Response,
): Promise<void> => {
	try {
		const record = await PlatformSetting.findByPk(PICKUP_SETTING_KEY);
		const data = parsePickupSettings(record?.value);
		res.status(200).json({
			message: "Pickup settings fetched successfully.",
			data,
		});
	} catch (error: any) {
		logger.error("Error fetching pickup settings:", error);
		res.status(200).json({
			message: "Default pickup settings returned.",
			data: { ...DEFAULT_PICKUP_SETTINGS },
		});
	}
};

export const updatePickupSettings = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { pickupEnabled, pickupLabel, pickupAddress, pickupNote } = req.body || {};

		const normalized: PickupSettingsData = {
			pickupEnabled:
				typeof pickupEnabled === "boolean" ? pickupEnabled : true,
			pickupLabel:
				typeof pickupLabel === "string" && pickupLabel.trim()
					? pickupLabel.trim().slice(0, 120)
					: DEFAULT_PICKUP_SETTINGS.pickupLabel,
			pickupAddress:
				typeof pickupAddress === "string"
					? pickupAddress.trim().slice(0, 500)
					: "",
			pickupNote:
				typeof pickupNote === "string" ? pickupNote.trim().slice(0, 300) : "",
		};

		const adminId = (req as any).admin?.id || (req as any).user?.id || null;

		await PlatformSetting.upsert({
			key: PICKUP_SETTING_KEY,
			value: JSON.stringify(normalized),
			updatedBy: adminId ? String(adminId) : null,
		});

		res.status(200).json({
			message: "Pickup address settings updated successfully.",
			data: normalized,
		});
	} catch (error: any) {
		logger.error("Error updating pickup settings:", error);
		res.status(500).json({
			message: error?.message || "Failed to update pickup settings.",
		});
	}
};
