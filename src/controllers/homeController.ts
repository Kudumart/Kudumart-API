// src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import JwtService from "../services/jwt.service";
import logger from "../middlewares/logger"; // Adjust the path to your logger.js
import Product from "../models/product";
import { Op, ForeignKeyConstraintError, Sequelize, Order } from "sequelize";
import SubCategory from "../models/subcategory";
import Category from "../models/category";
import User from "../models/user";
import Store from "../models/store";
import KYC from "../models/kyc";
import { shuffleArray } from "../utils/helpers";
import AuctionProduct from "../models/auctionproduct";
import Currency from "../models/currency";
import Admin from "../models/admin";
import Advert from "../models/advert";
import Testimonial from "../models/testimonial";
import FaqCategory from "../models/faqcategory";
import Faq from "../models/faq";
import Contact from "../models/contact";
import ReviewProduct from "../models/reviewproduct";

export const getAllCategories = async (
    req: Request,
    res: Response
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
    res: Response
): Promise<void> => {
    const { categoryId } = req.query;

    try {
        const subCategories = await SubCategory.findAll({
            where: { categoryId }
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
    res: Response
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
        storeId,
        minPrice,
        maxPrice,
        name, // Product name
        subCategoryName, // Subcategory name filter
        condition, // Product condition filter
        categoryId,
        popular // Query parameter to sort by most viewed
    } = req.query;

    try {
        // Define the base where clause with the active status
        const whereClause: any = { status: "active" };

        // Additional filters based on query parameters
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
            whereClause.name = { [Op.like]: `%${name}%` }; // Case-insensitive search for product name
        }
        if (name) {
            const normalizedName = String(name).trim().replace(/\s+/g, " "); // Normalize spaces
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${normalizedName}%` } } // Use LIKE query for product name search
            ];
        }
        
        if (condition) {
            whereClause.condition = condition; // Filter by product condition
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
                        attributes: ["symbol"],
                    },
                ],
            },
        ];

        // Determine sorting order dynamically
        const orderClause: Order = popular === "true"
        ? [["views", "DESC"], [Sequelize.literal("RAND()"), "ASC"]] // Sort by views first, then randomize
        : [[Sequelize.literal("RAND()"), "ASC"]]; // Default random sorting

        // Fetch active products with subcategory details
        const products = await Product.findAll({
            where: whereClause,
            include: includeClause,
            order: orderClause, // Dynamic ordering
            limit: 20, // Fetch top 20 products
        });

        res.status(200).json({ data: products });
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
    res: Response
): Promise<void> => {
    const { productId } = req.query;

    try {
        // Fetch the main product by ID or SKU
        const product = await Product.findOne({
            where: {
                status: "active",
                [Op.or]: [
                    { id: productId },
                    { SKU: productId }, // Replace 'SKU' with the actual SKU column name if different
                ],
            },
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
                          attributes: ["id", "firstName", "lastName", "email"] 
                        }
                    ],
                }
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
        const reviews: ReviewProduct[] = Array.isArray(product.reviews) ? product.reviews : [];
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0 
            ? (reviews.reduce((sum, review) => sum + Number(review.rating) || 0, 0) / totalReviews).toFixed(1) 
            : "0.0";

        // Attach review data to the product
        product.setDataValue("averageRating", parseFloat(averageRating));
        product.setDataValue("totalReviews", totalReviews);

        // Fetch recommended products based on the same subcategory
        const recommendedProducts = await Product.findAll({
            where: {
                categoryId: product.categoryId, // Fetch products from the same subcategory
                id: { [Op.ne]: product.id }, // Exclude the currently viewed product
                status: "active",
            },
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
export const getAllStores = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract query parameters with default values
        const {
            name = "",         // Default to an empty string for name filter
            city = "",         // Default to an empty string for city filter
            page = 1,          // Default to page 1
            limit = 10         // Default to 10 items per page
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
                    attributes: ['symbol']
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
                total,           // Total number of matching records
                page: Number(page),  // Current page number
                limit: Number(limit) // Number of items per page
            }
        });
    } catch (error: any) {
        logger.error("Error fetching stores:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching stores.",
        });
    }
};

// Controller to fetch a store's products with optional shuffle and pagination
export const getStoreProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        // Extract storeId from query parameters or request params
        const storeId = req.query.storeId as string;
        const { productName = "", page = 1, limit = 10 } = req.query;

        if (!storeId) {
            res.status(400).json({ message: "Store ID is required" });
            return;
        }

        // Calculate pagination values
        const offset = (Number(page) - 1) * Number(limit);

        // Fetch products along with the associated currency
        const products = await Product.findAll({
            where: {
                storeId,
                ...(productName ? { name: { [Op.like]: `%${productName}%` } } : {}),
            },
            include: [
                {
                    model: User,
                    as: "vendor"
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Store,
                    as: "store",
                    attributes: ['name'],
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
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
            message: error.message || "An error occurred while fetching store products.",
        });
    }
};

// Function to get all upcoming auction products with search functionality
export const getUpcomingAuctionProducts = async (req: Request, res: Response): Promise<void> => {
    const {
        storeId,
        name, // Product name
        subCategoryName, // Subcategory name filter
        condition, // Product condition filter
        limit = 10, // Default to 10 results if not specified
        offset = 0, // Default to 0 offset (start from the beginning)
    } = req.query;

    try {
        // Build the search criteria dynamically
        const whereConditions: any = {
            auctionStatus: 'upcoming',
            startDate: { [Op.gte]: new Date() }, // Ensure start date is in the future
        };

        // Add search filters to the where condition
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

        // Fetch upcoming auction products based on conditions
        const products = await AuctionProduct.findAll({
            where: whereConditions,
            include: [
                {
                    model: User,
                    as: "vendor"
                },
                {
                    model: Admin,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: Store,
                    as: "store",
                    attributes: ['name'],
                    include: [
                        {
                            model: Currency,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
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

        // Return the results as JSON response
        res.json({ data: products });
    } catch (error) {
        logger.error("Error fetching upcoming auction products:", error);
        res.status(500).json({ message: "Could not fetch upcoming auction products." });
    }
};

// Get Auction Product By ID or SKU with Recommended Products
export const getAuctionProductById = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { auctionproductId } = req.query;

    try {
        // Fetch the main product by ID or SKU
        const product = await AuctionProduct.findOne({
            where: {
                auctionStatus: "upcoming",
                [Op.or]: [
                    { id: auctionproductId },
                    { SKU: auctionproductId }, // Replace 'SKU' with the actual SKU column name if different
                ],
            },
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
                            attributes: ['symbol']
                        },
                    ]
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

        if (product && product.vendor) { // This should now return the associated User (vendor)
            const kyc = await KYC.findOne({ where: { vendorId: product.vendor.id } });
            product.vendor.setDataValue('isVerified', kyc ? kyc.isVerified : false);
        }

        // Send the product and recommended products in the response
        res.status(200).json({ data: product });
    } catch (error: any) {
        logger.error("Error fetching product:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching the product.",
        });
    }
};

export const getAdverts = async (req: Request, res: Response): Promise<void> => {
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

// Get all testimonials
export const getAllTestimonials = async (req: Request, res: Response): Promise<void> => {
    try {
        const testimonials = await Testimonial.findAll();
        res.status(200).json({ data: testimonials });

    } catch (error: any) {
        logger.error(`Error retrieving testimonials: ${error.message}`);
        res.status(500).json({ message: "An error occurred while retrieving testimonials. Please try again later." });
    }
};

// Get FAQ Categories with its FAQs
export const getFaqCategoryWithFaqs = async (req: Request, res: Response): Promise<void> => {

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
        res.status(500).json({ message: "An error occurred while fetching the FAQ category." });
    }
};

export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
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
            message: "Thank you for reaching out! Your message has been successfully submitted. We will get back to you as soon as possible.",
            data: newContact,
        });
    } catch (error: any) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({
            message: "An error occurred while submitting the contact form.",
        });
    }
};