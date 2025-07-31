// src/types/index.ts or similar file
import { Request } from "express";
import User from "../models/user"; // Adjust the import path as necessary

export interface AuthenticatedRequest extends Request {
	userId?: string;
	accountType?: string;
	user?: User; // Use your User type here
}

// Define ProductData interface
export interface ProductData {
	id: string;
	vendorId: string;
	storeId: string;
	categoryId: string;
	name: string;
	sku: string;
	condition: string;
	description: string;
	specification: string;
	price: string;
	discount_price: string;
	image_url: string;
	additional_images: string;
	warranty: string;
	return_policy: string;
	seo_title: string;
	meta_description: string;
	keywords: string;
	views: number;
	status: string;
	createdAt: string;
	updatedAt: string;
	store: {
		name: string;
		currency: {
			name: string;
			symbol: string;
		};
	};
	sub_category: {
		id: string;
		name: string;
	};
	[key: string]: any; // Allow additional properties
}

export const PushNotificationTypes = {
	NEW_MESSAGE: "NEW_MESSAGE",
	ORDER_CREATED: "ORDER_CREATED",
	ORDER_CONFIRMATION: "ORDER_CONFIRMATION",
	ORDER_SHIPPED: "ORDER_SHIPPED",
  ORDER_STATUS_UPDATE: "ORDER_STATUS_UPDATE",
} as const;
