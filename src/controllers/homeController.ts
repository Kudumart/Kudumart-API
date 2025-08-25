// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import logger from "../middlewares/logger"; // Adjust the path to your logger.js
import Product from "../models/product";
import { Op, ForeignKeyConstraintError, Sequelize, Order } from "sequelize";
import SubCategory from "../models/subcategory";
import Category from "../models/category";
import User from "../models/user";
import Store from "../models/store";
import KYC from "../models/kyc";
import { shuffleArray, getJobsBySearch, initStripe } from "../utils/helpers";
import AuctionProduct from "../models/auctionproduct";
import Currency from "../models/currency";
import Admin from "../models/admin";
import Advert from "../models/advert";
import Testimonial from "../models/testimonial";
import FaqCategory from "../models/faqcategory";
import Faq from "../models/faq";
import Contact from "../models/contact";
import ReviewProduct from "../models/reviewproduct";
import Job from "../models/job";
import sequelizeService from "../services/sequelize.service";
import Applicant from "../models/applicant";
import Banner from "../models/banner";
import { AuthenticatedRequest } from "../types/index";
import ShowInterest from "../models/showinterest";
import BlockedVendor from "../models/blockedvendor";
import BlockedProduct from "../models/blockedproduct";
import ServiceCategories from "../models/serviceCategories";
import ServiceSubCategories from "../models/serviceSubCategories";
import ServiceCategoryToAttributeMap from "../models/serviceCategoryToAttributeMap";
import AttributeDefinitions from "../models/attributeDefinitions";
import AttributeOptions from "../models/attributeOptions";
import Services from "../models/services";
import ServiceReviews from "../models/servicereview";

export const getAllCategories = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const categories = await Category.findAll();

		res.status(200).json({ data: categories });
	} catch (error: any) {
		logger.error("Error fetching categories", error);
		res.status(500).json({
			message: "An error occurred while fetching categories.",
		});
	}
};

export const getCategorySubCategories = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { categoryId } = req.query;

	try {
		const subCategories = await SubCategory.findAll({
			where: { categoryId },
		});

		res.status(200).json({ data: subCategories });
	} catch (error: any) {
		logger.error("Error fetching sub categories", error);
		res.status(500).json({
			message: "An error occurred while fetching sub categories.",
		});
	}
};

export const getCategoriesWithSubcategories = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const categories = await Category.findAll({
			include: [
				{
					model: SubCategory,
					as: "subCategories",
				},
			],
		});

		res.status(200).json({ data: categories });
	} catch (error: any) {
		logger.error("Error fetching categories with subcategories:", error);
		res.status(500).json({
			message: error.message || "An error occurred while fetching categories.",
		});
	}
};

export const products = async (req: Request, res: Response): Promise<void> => {
	const {
		country,
		productId,
		storeId,
		minPrice,
		maxPrice,
		name, // Product name
		subCategoryName, // Subcategory name filter
		condition, // Product condition filter
		categoryId,
		popular, // Query parameter to sort by most viewed
		symbol,
		page = "1", // Default page '1' if not provided
		limit = "20", // Default limit '20' if not provided
	} = req.query;

	try {
		// Convert page and limit to numbers
		const currentPage = Number(page);
		const currentLimit = Number(limit);

		// Validate page and limit to ensure they are valid numbers
		if (isNaN(currentPage) || currentPage < 1) {
			res.status(400).json({ message: "Invalid page number." });
			return;
		}
		if (isNaN(currentLimit) || currentLimit < 1) {
			res.status(400).json({ message: "Invalid limit number." });
			return;
		}

		// Define the base where clause with the active status
		const whereClause: any = { status: "active" };

		// Additional filters based on query parameters
		if (productId) {
			whereClause[Op.or] = [{ id: productId }, { sku: productId }];
		}
		if (storeId) {
			whereClause.storeId = storeId;
		}
		if (minPrice) {
			whereClause.price = { [Op.gte]: Number(minPrice) };
		}
		if (maxPrice) {
			whereClause.price = { ...whereClause.price, [Op.lte]: Number(maxPrice) };
		}
		if (name) {
			const normalizedName = String(name).trim().replace(/\s+/g, " "); // Normalize spaces
			whereClause[Op.or] = [
				{ name: { [Op.like]: `%${normalizedName}%` } }, // Use LIKE query for product name search
			];
		}
		if (condition) {
			whereClause.condition = condition; // Filter by product condition
		}

		// Blocked vendor exclusion logic
		let blockedVendorIds: string[] = [];
		const userId = (req as AuthenticatedRequest).user?.id;
		if (userId) {
			const blockedVendors = await BlockedVendor.findAll({ where: { userId } });
			blockedVendorIds = blockedVendors.map((bv: any) => bv.vendorId);
		}
		// Exclude products from blocked vendors
		if (blockedVendorIds.length > 0) {
			whereClause.vendorId = { [Op.notIn]: blockedVendorIds };
		}

		// Construct the where clause for subCategory with conditional categoryId and subCategoryName
		const subCategoryWhereClause: any = {};
		if (subCategoryName) {
			subCategoryWhereClause.name = { [Op.like]: `%${subCategoryName}%` };
		}
		if (categoryId) {
			subCategoryWhereClause.categoryId = categoryId; // Filter by categoryId
		}

		// Include the subCategory relation with name and id filtering
		const includeClause = [
			{
				model: User,
				as: "vendor",
				include: [
					{
						model: KYC,
						as: "kyc",
						attributes: ["isVerified"], // Fetch isVerified from KYC
					},
				],
			},
			{
				model: Admin,
				as: "admin",
				attributes: ["id", "name", "email"],
			},
			{
				model: SubCategory,
				as: "sub_category",
				where:
					Object.keys(subCategoryWhereClause).length > 0
						? subCategoryWhereClause
						: undefined,
				attributes: ["id", "name", "categoryId"],
			},
			{
				model: Store,
				as: "store",
				include: [
					{
						model: Currency,
						as: "currency",
						attributes: ["id", "symbol"],
					},
				],
			},
		];

		// **Apply the currency symbol filter separately**
		if (symbol) {
			whereClause["$store.currency.symbol$"] = symbol;
		}

		// Determine sorting order dynamically
		const orderClause: Order =
			popular === "true"
				? [
						["views", "DESC"],
						[Sequelize.literal("RAND()"), "ASC"],
					] // Sort by views first, then randomize
				: [[Sequelize.literal("RAND()"), "ASC"]]; // Default random sorting

		// Calculate the offset based on page and limit
		const offset = (currentPage - 1) * currentLimit;

		// Fetch active products with subcategory details and dynamic pagination
		const { count, rows: products } = await Product.findAndCountAll({
			where: whereClause,
			include: includeClause,
			order: orderClause, // Dynamic ordering
			limit: currentLimit, // Fetch based on the provided limit
			offset: offset, // Dynamic offset based on page and limit
			subQuery: false, // Ensures the currency filter is applied correctly
		});

		// Calculate the total number of pages
		const totalPages = Math.ceil(count / currentLimit);

		// Generate the next and previous page links
		const nextPage =
			currentPage < totalPages
				? `${req.baseUrl}?page=${currentPage + 1}&limit=${currentLimit}`
				: null;
		const prevPage =
			currentPage > 1
				? `${req.baseUrl}?page=${currentPage - 1}&limit=${currentLimit}`
				: null;

		// ✅ **Transform the response to include `isVerified`**
		const formattedProducts = products.map((product: any) => {
			let vendorData = product.vendor ? product.vendor.toJSON() : null;

			if (vendorData) {
				vendorData.isVerified = vendorData.kyc
					? vendorData.kyc.isVerified
					: false;
				delete vendorData.kyc; // Remove nested kyc object if unnecessary
			}

			return {
				...product.toJSON(),
				vendor: vendorData ?? null, // Ensure vendor is null if not present
			};
		});

		// Send the response with products and pagination info
		res.status(200).json({
			data: formattedProducts,
			pagination: {
				currentPage: currentPage,
				totalPages: totalPages,
				nextPage: nextPage,
				prevPage: prevPage,
				totalCount: count,
			},
		});
	} catch (error: any) {
		logger.error("Error fetching products:", error);
		res.status(500).json({
			message: error.message || "An error occurred while fetching products.",
		});
	}
};

// Get Product By ID or SKU with Recommended Products
export const getProductById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { productId } = req.query;

	try {
		// Blocked vendor exclusion logic
		let blockedVendorIds: string[] = [];
		const userId = (req as AuthenticatedRequest).user?.id;
		if (userId) {
			const blockedVendors = await BlockedVendor.findAll({ where: { userId } });
			blockedVendorIds = blockedVendors.map((bv: any) => bv.vendorId);
		}

		// Build where clause
		const whereClause: any = {
			status: "active",
			[Op.or]: [
				{ id: productId },
				{ SKU: productId }, // Replace 'SKU' with the actual SKU column name if different
			],
		};

		// Add blocked vendor filter if user has blocked vendors
		if (blockedVendorIds.length > 0) {
			whereClause.vendorId = { [Op.notIn]: blockedVendorIds };
		}

		// Fetch the main product by ID or SKU
		const product = await Product.findOne({
			where: whereClause,
			include: [
				{
					model: User,
					as: "vendor",
				},
				{
					model: Admin,
					as: "admin",
					attributes: ["id", "name", "email"],
				},
				{
					model: Store,
					as: "store",
					include: [
						{
							model: Currency,
							as: "currency",
							attributes: ["symbol"],
						},
					],
				},
				{
					model: SubCategory,
					as: "sub_category",
					attributes: ["id", "name"],
				},
				{
					model: ReviewProduct,
					as: "reviews",
					include: [
						{
							model: User,
							as: "user",
							attributes: ["id", "firstName", "lastName", "email"],
						},
					],
				},
			],
		});

		if (!product) {
			res.status(404).json({ message: "Product not found" });
			return;
		}

		// Increment the view count by 1
		await product.increment("views", { by: 1 });

		// Fetch vendor KYC verification status
		if (product.vendor) {
			const kyc = await KYC.findOne({ where: { vendorId: product.vendor.id } });
			product.vendor.setDataValue("isVerified", kyc ? kyc.isVerified : false);
		}

		// ✅ Calculate Review Rating
		const reviews: ReviewProduct[] = Array.isArray(product.reviews)
			? product.reviews
			: [];
		const totalReviews = reviews.length;
		const averageRating =
			totalReviews > 0
				? (
						reviews.reduce(
							(sum, review) => sum + Number(review.rating) || 0,
							0,
						) / totalReviews
					).toFixed(1)
				: "0.0";

		// Attach review data to the product
		product.setDataValue("averageRating", parseFloat(averageRating));
		product.setDataValue("totalReviews", totalReviews);

		// Build where clause for recommended products
		const recommendedWhereClause: any = {
			categoryId: product.categoryId, // Fetch products from the same subcategory
			id: { [Op.ne]: product.id }, // Exclude the currently viewed product
			status: "active",
		};

		// Add blocked vendor filter to recommended products
		if (blockedVendorIds.length > 0) {
			recommendedWhereClause.vendorId = { [Op.notIn]: blockedVendorIds };
		}

		// Fetch recommended products based on the same subcategory
		const recommendedProducts = await Product.findAll({
			where: recommendedWhereClause,
			include: [
				{
					model: User,
					as: "vendor",
					required: true, // Ensure the user is included
				},
				{
					model: Admin,
					as: "admin",
				},
				{
					model: Store,
					as: "store",
					include: [
						{
							model: Currency,
							as: "currency",
							attributes: ["symbol"],
						},
					],
				},
				{
					model: SubCategory,
					as: "sub_category",
					attributes: ["id", "name"],
				},
			],
			limit: 10,
			order: Sequelize.literal("RAND()"), // Randomize the order
		});

		// Send the product and recommended products in the response
		res.status(200).json({ data: product, recommendedProducts });
	} catch (error: any) {
		logger.error("Error fetching product:", error);
		res.status(500).json({
			message: error.message || "An error occurred while fetching the product.",
		});
	}
};

// Controller to get all stores with optional filters and pagination
export const getAllStores = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// Extract query parameters with default values
		const {
			name = "", // Default to an empty string for name filter
			city = "", // Default to an empty string for city filter
			page = 1, // Default to page 1
			limit = 10, // Default to 10 items per page
		} = req.query;

		// Define search filters dynamically
		const filters: { [key: string]: any } = {};
		if (name) {
			filters.name = { [Op.like]: `%${name}%` }; // Case-insensitive partial match for name
		}
		if (city) {
			filters["location.city"] = { [Op.like]: `%${city}%` }; // Case-insensitive partial match for city
		}

		// Calculate pagination settings
		const offset = (Number(page) - 1) * Number(limit);

		// Fetch stores with filters and pagination
		const { rows: stores, count: total } = await Store.findAndCountAll({
			where: filters,
			include: [
				{
					model: Currency,
					as: "currency",
					attributes: ["symbol"],
				},
			],
			limit: Number(limit),
			offset,
			order: [["createdAt", "DESC"]], // Sort by creation date in descending order
		});

		// Send response with stores data and pagination info
		res.status(200).json({
			message: "Stores fetched successfully",
			data: stores,
			pagination: {
				total, // Total number of matching records
				page: Number(page), // Current page number
				limit: Number(limit), // Number of items per page
			},
		});
	} catch (error: any) {
		logger.error("Error fetching stores:", error);
		res.status(500).json({
			message: error.message || "An error occurred while fetching stores.",
		});
	}
};

// Controller to fetch a store's products with optional shuffle and pagination
export const getStoreProducts = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		// Extract storeId from query parameters or request params
		const storeId = req.query.storeId as string;
		const { productName = "", page = 1, limit = 10 } = req.query;

		if (!storeId) {
			res.status(400).json({ message: "Store ID is required" });
			return;
		}

		// Blocked vendor exclusion logic
		let blockedVendorIds: string[] = [];
		const userId = (req as AuthenticatedRequest).user?.id;
		if (userId) {
			const blockedVendors = await BlockedVendor.findAll({ where: { userId } });
			blockedVendorIds = blockedVendors.map((bv: any) => bv.vendorId);
		}

		// Calculate pagination values
		const offset = (Number(page) - 1) * Number(limit);

		// Build where clause
		const whereClause: any = {
			storeId,
			...(productName ? { name: { [Op.like]: `%${productName}%` } } : {}),
		};

		// Add blocked vendor filter if user has blocked vendors
		if (blockedVendorIds.length > 0) {
			whereClause.vendorId = { [Op.notIn]: blockedVendorIds };
		}

		// Fetch products along with the associated currency
		const products = await Product.findAll({
			where: whereClause,
			include: [
				{
					model: User,
					as: "vendor",
				},
				{
					model: Admin,
					as: "admin",
					attributes: ["id", "name", "email"],
				},
				{
					model: Store,
					as: "store",
					attributes: ["name"],
					include: [
						{
							model: Currency,
							as: "currency",
							attributes: ["symbol"],
						},
					],
				},
			],
			limit: Number(limit),
			offset,
		});

		// Shuffle products
		const shuffledProducts = shuffleArray(products);

		res.status(200).json({
			message: "Store products fetched successfully",
			data: shuffledProducts,
			pagination: {
				total: products.length,
				page: Number(page),
				limit: Number(limit),
			},
		});
	} catch (error: any) {
		logger.error("Error fetching store products:", error);
		res.status(500).json({
			message:
				error.message || "An error occurred while fetching store products.",
		});
	}
};

// Function to get all auction products with search functionality
export const getAuctionProducts = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const {
		productId,
		storeId,
		name, // Product name
		subCategoryName, // Subcategory name filter
		condition, // Product condition filter
		auctionStatus, // 'upcoming' or 'ongoing'
		startDate, // Filter by today's date
		limit = 10, // Default to 10 results if not specified
		offset = 0, // Default to 0 offset (start from the beginning)
	} = req.query;

	try {
		// Blocked vendor exclusion logic
		let blockedVendorIds: string[] = [];
		const userId = (req as AuthenticatedRequest).user?.id;
		if (userId) {
			const blockedVendors = await BlockedVendor.findAll({ where: { userId } });
			blockedVendorIds = blockedVendors.map((bv: any) => bv.vendorId);
		}

		// Get today's date (start of the day)
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		// Build the search criteria dynamically
		const whereConditions: any = {};

		// Filter by auction status
		if (auctionStatus === "upcoming") {
			whereConditions.auctionStatus = "upcoming";
			whereConditions.startDate = { [Op.gte]: new Date() }; // Ensure start date is in the future
		} else if (auctionStatus === "ongoing") {
			whereConditions.auctionStatus = "ongoing";
			whereConditions.startDate = { [Op.lte]: new Date() }; // Ensure start date is in the past or today
		}

		// Filter by today's startDate if provided
		if (startDate === "today") {
			whereConditions.startDate = {
				[Op.gte]: today,
				[Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Less than tomorrow
			};
		}

		// Add search filters to the where condition
		if (productId) {
			whereConditions[Op.or] = [{ id: productId }, { sku: productId }];
		}
		if (name) {
			whereConditions.name = { [Op.like]: `%${name}%` }; // Search by product name
		}
		if (subCategoryName) {
			whereConditions.subCategoryName = { [Op.like]: `%${subCategoryName}%` }; // Search by subcategory name
		}
		if (condition) {
			whereConditions.condition = condition; // Filter by product condition (e.g., new, used, etc.)
		}
		if (storeId) {
			whereConditions.storeId = storeId; // Filter by store ID if provided
		}

		// Add blocked vendor filter if user has blocked vendors
		if (blockedVendorIds.length > 0) {
			whereConditions.vendorId = { [Op.notIn]: blockedVendorIds };
		}

		// Fetch auction products based on conditions
		const products = await AuctionProduct.findAll({
			where: whereConditions,
			include: [
				{
					model: User,
					as: "vendor",
					include: [
						{
							model: KYC,
							as: "kyc",
							attributes: ["isVerified"], // Fetch isVerified from KYC
						},
					],
				},
				{
					model: Admin,
					as: "admin",
					attributes: ["id", "name", "email"],
				},
				{
					model: Store,
					as: "store",
					attributes: ["name"],
					include: [
						{
							model: Currency,
							as: "currency",
							attributes: ["symbol"],
						},
					],
				},
				{
					model: SubCategory,
					as: "sub_category",
					attributes: ["id", "name"],
				},
			],
			limit: Number(limit),
			offset: Number(offset),
			order: [["startDate", "ASC"]], // Sort by start date (ascending)
		});

		// ✅ **Transform the response to include `isVerified`**
		const formattedProducts = products.map((product: any) => {
			let vendorData = product.vendor ? product.vendor.toJSON() : null;

			if (vendorData) {
				vendorData.isVerified = vendorData.kyc
					? vendorData.kyc.isVerified
					: false;
				delete vendorData.kyc; // Remove nested kyc object if unnecessary
			}

			return {
				...product.toJSON(),
				vendor: vendorData ?? null, // Ensure vendor is null if not present
			};
		});

		// Return the results as JSON response
		res.json({ data: formattedProducts });
	} catch (error) {
		logger.error("Error fetching auction products:", error);
		res.status(500).json({ message: "Could not fetch auction products." });
	}
};

// Get Auction Product By ID or SKU with Recommended Products
export const getAuctionProductById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { auctionproductId } = req.query; // Ensure userId is passed in the request
	const userId = (req as AuthenticatedRequest).user?.id; // Get the authenticated user's ID

	try {
		// Blocked vendor exclusion logic
		let blockedVendorIds: string[] = [];
		if (userId) {
			const blockedVendors = await BlockedVendor.findAll({ where: { userId } });
			blockedVendorIds = blockedVendors.map((bv: any) => bv.vendorId);
		}

		// Build where clause
		const whereClause: any = {
			[Op.or]: [
				{ id: auctionproductId },
				{ SKU: auctionproductId }, // Replace 'SKU' with the actual SKU column name if different
			],
		};

		// Add blocked vendor filter if user has blocked vendors
		if (blockedVendorIds.length > 0) {
			whereClause.vendorId = { [Op.notIn]: blockedVendorIds };
		}

		// Fetch the main product by ID or SKU
		const product = await AuctionProduct.findOne({
			where: whereClause,
			include: [
				{
					model: User,
					as: "vendor",
				},
				{
					model: Admin,
					as: "admin",
					attributes: ["id", "name", "email"],
				},
				{
					model: Store,
					as: "store",
					include: [
						{
							model: Currency,
							as: "currency",
							attributes: ["symbol"],
						},
					],
				},
				{
					model: SubCategory,
					as: "sub_category",
					attributes: ["id", "name"],
				},
			],
		});

		if (!product) {
			res.status(404).json({ message: "Product not found" });
			return;
		}

		if (product && product.vendor) {
			const kyc = await KYC.findOne({ where: { vendorId: product.vendor.id } });
			product.vendor.setDataValue("isVerified", kyc ? kyc.isVerified : false);
		}

		// Check if the user has shown interest in this auction product
		const interest = await ShowInterest.findOne({
			where: {
				userId,
				auctionProductId: product.id,
			},
		});

		// Attach interest field dynamically
		const productWithInterest = {
			...product.toJSON(),
			interest: !!interest, // true if interest exists, false otherwise
		};

		// Send the product and recommended products in the response
		res.status(200).json({ data: productWithInterest });
	} catch (error: any) {
		logger.error("Error fetching product:", error);
		res.status(500).json({
			message: error.message || "An error occurred while fetching the product.",
		});
	}
};

export const getAdverts = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { search = "", page = 1, limit = 10, showOnHomePage } = req.query;

		// Convert pagination params
		const pageNumber = parseInt(page as string) || 1;
		const pageSize = parseInt(limit as string) || 10;
		const offset = (pageNumber - 1) * pageSize;

		// Base condition: Only approved adverts
		const searchCondition: any = { status: "approved" };

		// Apply search query if provided
		if (search) {
			searchCondition[Op.or] = [
				{ title: { [Op.like]: `%${search}%` } }, // Search in advert title
				{ categoryId: { [Op.like]: `%${search}%` } },
				{ productId: { [Op.like]: `%${search}%` } },
				{ "$sub_category.name$": { [Op.like]: `%${search}%` } }, // Search in category name
				{ "$product.name$": { [Op.like]: `%${search}%` } }, // Search in product name
			];
		}

		// Handle boolean filtering for showOnHomePage
		if (showOnHomePage !== undefined) {
			searchCondition.showOnHomePage = showOnHomePage === "true";
		}

		const shuffle = "true";

		// Determine sorting order
		const orderClause: Order = [[Sequelize.literal("RAND()"), "ASC"]]; // Ensure valid format

		// Query adverts
		const { rows: adverts, count } = await Advert.findAndCountAll({
			where: searchCondition,
			include: [
				{
					model: User,
					as: "vendor",
					attributes: ["id", "firstName", "lastName", "email"],
				},
				{
					model: Admin,
					as: "admin",
					attributes: ["id", "name", "email"],
				},
				{
					model: SubCategory,
					as: "sub_category",
					attributes: ["id", "name"], // Include only necessary fields
				},
				{
					model: Product,
					as: "product",
					attributes: ["id", "name"], // Include only necessary fields
				},
			],
			limit: pageSize,
			offset: offset,
			order: orderClause,
		});

		res.status(200).json({
			message: "Adverts retrieved successfully.",
			data: adverts,
			pagination: {
				total: count,
				page: pageNumber,
				limit: pageSize,
			},
		});
	} catch (error) {
		logger.error("Error fetching adverts:", error);
		res.status(500).json({ message: "Failed to retrieve adverts." });
	}
};

export const viewAdvert = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const advertId = req.query.advertId as string;

		if (!advertId) {
			res.status(400).json({ message: "Advert ID is required." });
			return;
		}

		// Find the advert by ID
		const advert = await Advert.findOne({
			where: { id: advertId },
			include: [
				{
					model: User,
					as: "vendor",
					attributes: ["id", "firstName", "lastName", "email"],
				},
				{
					model: Admin,
					as: "admin",
					attributes: ["id", "name", "email"],
				},
				{
					model: SubCategory,
					as: "sub_category",
					attributes: ["id", "name"],
				},
				{
					model: Product,
					as: "product",
					attributes: ["id", "name"],
				},
			],
		});

		if (!advert) {
			res.status(404).json({ message: "Advert not found." });
			return;
		}

		// Increment the `clicks` field by 1
		await Advert.update(
			{ clicks: Sequelize.literal("clicks + 1") },
			{ where: { id: advertId } },
		);

		res.status(200).json({
			message: "Advert retrieved successfully.",
			data: advert,
		});
	} catch (error) {
		logger.error("Error viewing advert:", error);
		res.status(500).json({ message: "Failed to retrieve advert." });
	}
};

// Get all testimonials
export const getAllTestimonials = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const testimonials = await Testimonial.findAll();
		res.status(200).json({ data: testimonials });
	} catch (error: any) {
		logger.error(`Error retrieving testimonials: ${error.message}`);
		res.status(500).json({
			message:
				"An error occurred while retrieving testimonials. Please try again later.",
		});
	}
};

// Get FAQ Categories with its FAQs
export const getFaqCategoryWithFaqs = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const categories = await FaqCategory.findAll({
			include: [
				{
					model: Faq,
					as: "faqs",
					attributes: ["id", "question", "answer"], // Select only required fields
				},
			],
		});

		if (!categories) {
			res.status(404).json({ message: "FAQ category not found" });
			return;
		}

		res.status(200).json({ data: categories });
	} catch (error: any) {
		logger.error(`Error fetching FAQ categories with faqs: ${error.message}`);
		res
			.status(500)
			.json({ message: "An error occurred while fetching the FAQ category." });
	}
};

export const submitContactForm = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { name, phoneNumber, email, message } = req.body;

	try {
		// Create a new contact entry in the database
		const newContact = await Contact.create({
			name,
			phoneNumber,
			email,
			message,
		});

		res.status(201).json({
			message:
				"Thank you for reaching out! Your message has been successfully submitted. We will get back to you as soon as possible.",
			data: newContact,
		});
	} catch (error: any) {
		logger.error("Error submitting contact form:", error);
		res.status(500).json({
			message: "An error occurred while submitting the contact form.",
		});
	}
};

export const fetchJobs = async (req: Request, res: Response): Promise<void> => {
	try {
		const { keyword, limit } = req.query;
		const jobLimit = limit ? parseInt(limit as string, 10) || 20 : 20;
		const jobs = await getJobsBySearch(keyword as string, jobLimit);

		res.status(200).json({
			message: "All jobs retrieved successfully.",
			data: jobs,
		});
	} catch (error: any) {
		logger.error(error);
		res.status(500).json({ message: error.message });
	}
};

export const viewJob = async (req: Request, res: Response): Promise<void> => {
	try {
		const jobId = req.query.jobId as string;

		const job = await Job.findByPk(jobId);
		if (!job) {
			res.status(404).json({
				message: "Not found in our database.",
			});
			return;
		}

		// Ensure `views` is not null before incrementing
		job.views = (job.views ?? 0) + 1;
		await job.save();

		res.status(200).json({
			message: "Job retrieved successfully.",
			data: job,
		});
	} catch (error: any) {
		logger.error(error);
		res.status(500).json({ message: error.message });
	}
};

export const applyJob = async (req: Request, res: Response): Promise<void> => {
	// Start transaction
	const transaction = await sequelizeService.connection!.transaction();

	try {
		const { jobId, name, emailAddress, phoneNumber, resumeType, resume } =
			req.body;

		// Validation: Ensure resumeType is required and must be "pdf"
		if (!resumeType || resumeType.toLowerCase() !== "pdf") {
			res
				.status(400)
				.json({ message: "Invalid resume type. Only PDF is allowed." });
			return;
		}

		const job = await Job.findByPk(jobId);
		if (!job) {
			res.status(404).json({ message: "Job not found in our database." });
			return;
		}

		const existingApplication = await Applicant.findOne({
			where: { emailAddress, jobId },
		});
		if (existingApplication) {
			res
				.status(400)
				.json({ message: "You have already applied for this job." });
			return;
		}

		const status = job.status === "active" ? "applied" : "in-progress";
		const application = await Applicant.create(
			{
				jobId,
				name,
				emailAddress,
				phoneNumber,
				resumeType,
				resume,
				status,
			},
			{ transaction },
		);

		const jobOwner = await Admin.findByPk(job.creatorId);
		if (!jobOwner) {
			throw new Error("User or job owner not found.");
		}

		// Prepare emails
		const applicantMessage = emailTemplates.applicantNotify(job, application);
		const jobOwnerMessage = emailTemplates.jobOwnerMailData(
			job,
			jobOwner,
			application,
		);

		// Send emails
		await sendMail(
			emailAddress,
			`${process.env.APP_NAME} - Application Confirmation`,
			applicantMessage,
		);
		await sendMail(
			jobOwner.email,
			`${process.env.APP_NAME} - New Job Application Received`,
			jobOwnerMessage,
		);

		await transaction.commit();
		res.status(200).json({
			message: `Your application has been successfully sent to ${process.env.APP_NAME}.`,
			data: application,
		});
	} catch (error: any) {
		await transaction.rollback();
		logger.error("Error in applyJob:", error);
		res.status(500).json({ message: "Error in applying job." });
	}
};

// Get all banners
export const getAllBanners = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const banners = await Banner.findAll();
		res.status(200).json({ data: banners });
	} catch (error: any) {
		logger.error(`Error retrieving banners: ${error.message}`);
		res.status(500).json({
			message:
				"An error occurred while retrieving banners. Please try again later.",
		});
	}
};

export const createPaymentIntent = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { amount, currency } = req.body;

		// Ensure amount and currency are provided
		if (!amount || !currency) {
			res.status(400).json({ message: "Amount and currency are required" });
			return;
		}

		const stripe = await initStripe(); // Await the function to get the Stripe instance

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amount * 100, // Convert amount to cents
			currency: currency || "usd",
		});

		res.status(200).json({ data: paymentIntent.client_secret });
	} catch (error) {
		logger.error("Stripe Error:", error);
		res.status(500).json({ error: (error as Error).message });
	}
};

export const getAllServiceCategories = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { page, limit } = req.query;

	try {
		const offset = (Number(page) - 1) * (Number(limit) || 10);

		const categories = await ServiceCategories.findAll({
			limit: Number(limit) || 10,
			offset: offset || 0,
		});

		if (!categories) {
			res.status(404).json({ message: "Service categories not found" });
			return;
		}

		res.status(200).json({ data: categories });
	} catch (error: any) {
		logger.error(`Error fetching service categories: ${error.message}`);
		res.status(500).json({
			message: "An error occurred while fetching service categories.",
		});
	}
};

export const getAllServiceSubCategories = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { id: serviceCategoryId } = req.params;

	const { page, limit } = req.query;

	try {
		const offset = (Number(page) - 1) * (Number(limit) || 10);

		const subCategories = await ServiceSubCategories.findAll({
			where: {
				serviceCategoryId,
			},
			limit: Number(limit) || 10,
			offset: offset || 0,
		});

		if (!subCategories) {
			res.status(404).json({ message: "Service subcategories not found" });
			return;
		}

		res.status(200).json({ data: subCategories });
	} catch (error: any) {
		logger.error(`Error fetching service subcategories: ${error.message}`);
		res.status(500).json({
			message: "An error occurred while fetching service subcategories.",
		});
	}
};

export const getAttributesForServiceCategory = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { categoryId: serviceCategoryId } = req.params;

	const { page, limit } = req.query;

	const offset = (Number(page) - 1) * Number(limit);

	try {
		if (!serviceCategoryId) {
			res.status(400).json({ message: "Service category ID is required." });
			return;
		}

		const serviceCategory = await ServiceCategories.findByPk(serviceCategoryId);

		if (!serviceCategory) {
			res.status(404).json({ message: "Service category not found." });
			return;
		}

		const attributeMappings = await ServiceCategoryToAttributeMap.findAll({
			where: { service_category_id: serviceCategoryId },
			limit: Number(limit) || 10,
			offset: offset || 0,
			include: [
				{
					model: AttributeDefinitions,
					as: "attribute",
					include: [
						{
							model: AttributeOptions,
							as: "options",
							attributes: ["id", "option_value"],
						},
					],
				},
			],
		});

		const attributes = attributeMappings.map((mapping) => mapping.attribute);

		res.status(200).json({ data: attributes });
	} catch (error: any) {
		logger.error(
			`Error retrieving attributes for service category: ${error.message}`,
		);
		res.status(500).json({
			message:
				"An error occurred while retrieving attributes for the service category. Please try again later.",
		});
	}
};

export const getAllServices = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { page, limit, categoryId, subCategoryId } = req.query;

	try {
		// Calculate pagination values
		const currentPage = Number(page) || 1;
		const currentLimit = Number(limit) || 10;
		const offset = (currentPage - 1) * currentLimit;

		// Build where clause
		const whereClause: any = {};

		if (categoryId) {
			whereClause.categoryId = categoryId;
		}

		if (subCategoryId) {
			whereClause.subCategoryId = subCategoryId;
		}

		whereClause.status = "active"; // Only fetch active services

		// Fetch services with pagination
		const { count, rows: services } = await Services.findAndCountAll({
			where: whereClause,
			include: [
				{
					model: User,
					as: "provider",
					include: [
						{
							model: KYC,
							as: "kyc",
							attributes: ["isVerified"], // Fetch isVerified from KYC
						},
					],
				},
				{
					model: ServiceCategories,
					as: "category",
					attributes: ["id", "name"],
				},
				{
					model: ServiceSubCategories,
					as: "sub_category",
					attributes: ["id", "name"],
				},
			],
			limit: currentLimit,
			offset,
			order: [["createdAt", "DESC"]],
		});

		// Calculate total pages
		const totalPages = Math.ceil(count / currentLimit);

		// Generate next and previous page links
		const nextPage =
			currentPage < totalPages
				? `${req.baseUrl}?page=${currentPage + 1}&limit=${currentLimit}`
				: null;
		const prevPage =
			currentPage > 1
				? `${req.baseUrl}?page=${currentPage - 1}&limit=${currentLimit}`
				: null;

		// Transform the response to include isVerified
		const formattedServices = services.map((service: any) => {
			let providerData = service.provider ? service.provider.toJSON() : null;

			if (providerData) {
				providerData.isVerified = providerData.kyc
					? providerData.kyc.isVerified
					: false;
				delete providerData.kyc; // Remove nested kyc object if unnecessary
			}

			return {
				...service.toJSON(),
				provider: providerData ?? null, // Ensure provider is null if not present
			};
		});

		// Send the response with services and pagination info
		res.status(200).json({
			message: "Services fetched successfully",
			data: formattedServices,
			pagination: {
				totalItems: count,
				totalPages,
				currentPage,
				nextPage,
				prevPage,
			},
		});
	} catch (error: any) {
		logger.error("Error fetching services:", error);
		res.status(500).json({
			message: error.message || "An error occurred while fetching services.",
		});
	}
};

export const getServiceById = async (
	req: Request,
	res: Response,
): Promise<void> => {
	const { serviceId } = req.params;

	try {
		if (!serviceId) {
			res.status(400).json({ message: "Service ID is required" });
			return;
		}

		// Fetch the service by ID
		const service = await Services.findOne({
			where: { id: serviceId, status: "active" },
			include: [
				{
					model: User,
					as: "provider",
					include: [
						{
							model: KYC,
							as: "kyc",
							attributes: ["isVerified"], // Fetch isVerified from KYC
						},
					],
				},
				{
					model: ServiceCategories,
					as: "category",
					attributes: ["id", "name"],
				},
				{
					model: ServiceSubCategories,
					as: "sub_category",
					attributes: ["id", "name"],
				},
			],
		});

		if (!service) {
			res.status(404).json({ message: "Service not found" });
			return;
		}

		if (service && service.provider) {
			const kyc = await KYC.findOne({
				where: { vendorId: service.provider.id },
			});
			service.provider.setDataValue("isVerified", kyc ? kyc.isVerified : false);
		}

		// Send the service in the response
		res.status(200).json({ data: service });
	} catch (error: any) {
		logger.error("Error fetching service:", error);
		res.status(500).json({
			message: error.message || "An error occurred while fetching the service.",
		});
	}
};

export const getServiceReviews = async (
	req: Request,
	res: Response,
): Promise<void> => {
	try {
		const { serviceId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		if (!serviceId) {
			res.status(400).json({ message: "Service ID is required" });
			return;
		}

		// Calculate pagination values
		const currentPage = Number(page) || 1;
		const currentLimit = Number(limit) || 10;
		const offset = (currentPage - 1) * currentLimit;

		// Fetch reviews with pagination
		const { count, rows: reviews } = await ServiceReviews.findAndCountAll({
			where: { serviceId },
			include: [
				{
					model: User,
					as: "user",
					attributes: ["id", "firstName", "lastName", "email", "photo"],
				},
			],
			limit: currentLimit,
			offset,
			order: [["createdAt", "DESC"]],
		});

		// Calculate total pages
		const totalPages = Math.ceil(count / currentLimit);

		// Generate next and previous page links
		const nextPage =
			currentPage < totalPages
				? `${req.baseUrl}?page=${currentPage + 1}&limit=${currentLimit}`
				: null;
		const prevPage =
			currentPage > 1
				? `${req.baseUrl}?page=${currentPage - 1}&limit=${currentLimit}`
				: null;

		res.status(200).json({
			message: "Service reviews fetched successfully",
			data: reviews,
			pagination: {
				totalItems: count,
				totalPages,
				currentPage,
				nextPage,
				prevPage,
			},
		});
	} catch (error: any) {
		logger.error("Error fetching service reviews:", error);
		res.status(500).json({
			message:
				error.message || "An error occurred while fetching service reviews.",
		});
	}
};
