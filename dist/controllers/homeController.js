"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBanners = exports.applyJob = exports.viewJob = exports.fetchJobs = exports.submitContactForm = exports.getFaqCategoryWithFaqs = exports.getAllTestimonials = exports.viewAdvert = exports.getAdverts = exports.getAuctionProductById = exports.getAuctionProducts = exports.getStoreProducts = exports.getAllStores = exports.getProductById = exports.products = exports.getCategoriesWithSubcategories = exports.getCategorySubCategories = exports.getAllCategories = void 0;
const mail_service_1 = require("../services/mail.service");
const messages_1 = require("../utils/messages");
const logger_1 = __importDefault(require("../middlewares/logger")); // Adjust the path to your logger.js
const product_1 = __importDefault(require("../models/product"));
const sequelize_1 = require("sequelize");
const subcategory_1 = __importDefault(require("../models/subcategory"));
const category_1 = __importDefault(require("../models/category"));
const user_1 = __importDefault(require("../models/user"));
const store_1 = __importDefault(require("../models/store"));
const kyc_1 = __importDefault(require("../models/kyc"));
const helpers_1 = require("../utils/helpers");
const auctionproduct_1 = __importDefault(require("../models/auctionproduct"));
const currency_1 = __importDefault(require("../models/currency"));
const admin_1 = __importDefault(require("../models/admin"));
const advert_1 = __importDefault(require("../models/advert"));
const testimonial_1 = __importDefault(require("../models/testimonial"));
const faqcategory_1 = __importDefault(require("../models/faqcategory"));
const faq_1 = __importDefault(require("../models/faq"));
const contact_1 = __importDefault(require("../models/contact"));
const reviewproduct_1 = __importDefault(require("../models/reviewproduct"));
const job_1 = __importDefault(require("../models/job"));
const sequelize_service_1 = __importDefault(require("../services/sequelize.service"));
const applicant_1 = __importDefault(require("../models/applicant"));
const banner_1 = __importDefault(require("../models/banner"));
const showinterest_1 = __importDefault(require("../models/showinterest"));
const getAllCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_1.default.findAll();
        res.status(200).json({ data: categories });
    }
    catch (error) {
        logger_1.default.error("Error fetching categories", error);
        res.status(500).json({
            message: "An error occurred while fetching categories.",
        });
    }
});
exports.getAllCategories = getAllCategories;
const getCategorySubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId } = req.query;
    try {
        const subCategories = yield subcategory_1.default.findAll({
            where: { categoryId }
        });
        res.status(200).json({ data: subCategories });
    }
    catch (error) {
        logger_1.default.error("Error fetching sub categories", error);
        res.status(500).json({
            message: "An error occurred while fetching sub categories.",
        });
    }
});
exports.getCategorySubCategories = getCategorySubCategories;
const getCategoriesWithSubcategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_1.default.findAll({
            include: [
                {
                    model: subcategory_1.default,
                    as: "subCategories",
                },
            ],
        });
        res.status(200).json({ data: categories });
    }
    catch (error) {
        logger_1.default.error("Error fetching categories with subcategories:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching categories.",
        });
    }
});
exports.getCategoriesWithSubcategories = getCategoriesWithSubcategories;
const products = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { country, productId, storeId, minPrice, maxPrice, name, // Product name
    subCategoryName, // Subcategory name filter
    condition, // Product condition filter
    categoryId, popular, // Query parameter to sort by most viewed
    symbol } = req.query;
    try {
        // Define the base where clause with the active status
        const whereClause = { status: "active" };
        // Additional filters based on query parameters
        if (productId) {
            whereClause[sequelize_1.Op.or] = [
                { id: productId },
                { sku: productId }
            ];
        }
        if (storeId) {
            whereClause.storeId = storeId;
        }
        if (minPrice) {
            whereClause.price = { [sequelize_1.Op.gte]: Number(minPrice) };
        }
        if (maxPrice) {
            whereClause.price = Object.assign(Object.assign({}, whereClause.price), { [sequelize_1.Op.lte]: Number(maxPrice) });
        }
        if (name) {
            const normalizedName = String(name).trim().replace(/\s+/g, " "); // Normalize spaces
            whereClause[sequelize_1.Op.or] = [
                { name: { [sequelize_1.Op.like]: `%${normalizedName}%` } } // Use LIKE query for product name search
            ];
        }
        if (condition) {
            whereClause.condition = condition; // Filter by product condition
        }
        // Construct the where clause for subCategory with conditional categoryId and subCategoryName
        const subCategoryWhereClause = {};
        if (subCategoryName) {
            subCategoryWhereClause.name = { [sequelize_1.Op.like]: `%${subCategoryName}%` };
        }
        if (categoryId) {
            subCategoryWhereClause.categoryId = categoryId; // Filter by categoryId
        }
        // Include the subCategory relation with name and id filtering
        const includeClause = [
            {
                model: user_1.default,
                as: "vendor",
                include: [
                    {
                        model: kyc_1.default,
                        as: "kyc",
                        attributes: ["isVerified"], // Fetch isVerified from KYC
                    },
                ],
            },
            {
                model: admin_1.default,
                as: "admin",
                attributes: ["id", "name", "email"],
            },
            {
                model: subcategory_1.default,
                as: "sub_category",
                where: Object.keys(subCategoryWhereClause).length > 0
                    ? subCategoryWhereClause
                    : undefined,
                attributes: ["id", "name", "categoryId"],
            },
            {
                model: store_1.default,
                as: "store",
                include: [
                    {
                        model: currency_1.default,
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
        const orderClause = popular === "true"
            ? [["views", "DESC"], [sequelize_1.Sequelize.literal("RAND()"), "ASC"]] // Sort by views first, then randomize
            : [[sequelize_1.Sequelize.literal("RAND()"), "ASC"]]; // Default random sorting
        // Fetch active products with subcategory details
        const products = yield product_1.default.findAll({
            where: whereClause,
            include: includeClause,
            order: orderClause, // Dynamic ordering
            limit: 20, // Fetch top 20 products
            subQuery: false, // Ensures the currency filter is applied correctly
        });
        // ✅ **Transform the response to include `isVerified`**
        const formattedProducts = products.map((product) => {
            let vendorData = product.vendor ? product.vendor.toJSON() : null;
            if (vendorData) {
                vendorData.isVerified = vendorData.kyc ? vendorData.kyc.isVerified : false;
                delete vendorData.kyc; // Remove nested kyc object if unnecessary
            }
            return Object.assign(Object.assign({}, product.toJSON()), { vendor: vendorData !== null && vendorData !== void 0 ? vendorData : null });
        });
        res.status(200).json({ data: formattedProducts });
    }
    catch (error) {
        logger_1.default.error("Error fetching products:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching products.",
        });
    }
});
exports.products = products;
// Get Product By ID or SKU with Recommended Products
const getProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.query;
    try {
        // Fetch the main product by ID or SKU
        const product = yield product_1.default.findOne({
            where: {
                status: "active",
                [sequelize_1.Op.or]: [
                    { id: productId },
                    { SKU: productId }, // Replace 'SKU' with the actual SKU column name if different
                ],
            },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    attributes: ["id", "name"],
                },
                {
                    model: reviewproduct_1.default,
                    as: "reviews",
                    include: [
                        {
                            model: user_1.default,
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
        yield product.increment("views", { by: 1 });
        // Fetch vendor KYC verification status
        if (product.vendor) {
            const kyc = yield kyc_1.default.findOne({ where: { vendorId: product.vendor.id } });
            product.vendor.setDataValue("isVerified", kyc ? kyc.isVerified : false);
        }
        // ✅ Calculate Review Rating
        const reviews = Array.isArray(product.reviews) ? product.reviews : [];
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((sum, review) => sum + Number(review.rating) || 0, 0) / totalReviews).toFixed(1)
            : "0.0";
        // Attach review data to the product
        product.setDataValue("averageRating", parseFloat(averageRating));
        product.setDataValue("totalReviews", totalReviews);
        // Fetch recommended products based on the same subcategory
        const recommendedProducts = yield product_1.default.findAll({
            where: {
                categoryId: product.categoryId, // Fetch products from the same subcategory
                id: { [sequelize_1.Op.ne]: product.id }, // Exclude the currently viewed product
                status: "active",
            },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    required: true, // Ensure the user is included
                },
                {
                    model: admin_1.default,
                    as: "admin",
                },
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    attributes: ["id", "name"],
                },
            ],
            limit: 10,
            order: sequelize_1.Sequelize.literal("RAND()"), // Randomize the order
        });
        // Send the product and recommended products in the response
        res.status(200).json({ data: product, recommendedProducts });
    }
    catch (error) {
        logger_1.default.error("Error fetching product:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching the product.",
        });
    }
});
exports.getProductById = getProductById;
// Controller to get all stores with optional filters and pagination
const getAllStores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract query parameters with default values
        const { name = "", // Default to an empty string for name filter
        city = "", // Default to an empty string for city filter
        page = 1, // Default to page 1
        limit = 10 // Default to 10 items per page
         } = req.query;
        // Define search filters dynamically
        const filters = {};
        if (name) {
            filters.name = { [sequelize_1.Op.like]: `%${name}%` }; // Case-insensitive partial match for name
        }
        if (city) {
            filters["location.city"] = { [sequelize_1.Op.like]: `%${city}%` }; // Case-insensitive partial match for city
        }
        // Calculate pagination settings
        const offset = (Number(page) - 1) * Number(limit);
        // Fetch stores with filters and pagination
        const { rows: stores, count: total } = yield store_1.default.findAndCountAll({
            where: filters,
            include: [
                {
                    model: currency_1.default,
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
                total, // Total number of matching records
                page: Number(page), // Current page number
                limit: Number(limit) // Number of items per page
            }
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching stores:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching stores.",
        });
    }
});
exports.getAllStores = getAllStores;
// Controller to fetch a store's products with optional shuffle and pagination
const getStoreProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract storeId from query parameters or request params
        const storeId = req.query.storeId;
        const { productName = "", page = 1, limit = 10 } = req.query;
        if (!storeId) {
            res.status(400).json({ message: "Store ID is required" });
            return;
        }
        // Calculate pagination values
        const offset = (Number(page) - 1) * Number(limit);
        // Fetch products along with the associated currency
        const products = yield product_1.default.findAll({
            where: Object.assign({ storeId }, (productName ? { name: { [sequelize_1.Op.like]: `%${productName}%` } } : {})),
            include: [
                {
                    model: user_1.default,
                    as: "vendor"
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: store_1.default,
                    as: "store",
                    attributes: ['name'],
                    include: [
                        {
                            model: currency_1.default,
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
        const shuffledProducts = (0, helpers_1.shuffleArray)(products);
        res.status(200).json({
            message: "Store products fetched successfully",
            data: shuffledProducts,
            pagination: {
                total: products.length,
                page: Number(page),
                limit: Number(limit),
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching store products:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching store products.",
        });
    }
});
exports.getStoreProducts = getStoreProducts;
// Function to get all auction products with search functionality
const getAuctionProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, storeId, name, // Product name
    subCategoryName, // Subcategory name filter
    condition, // Product condition filter
    auctionStatus, // 'upcoming' or 'ongoing'
    startDate, // Filter by today's date
    limit = 10, // Default to 10 results if not specified
    offset = 0, // Default to 0 offset (start from the beginning)
     } = req.query;
    try {
        // Get today's date (start of the day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Build the search criteria dynamically
        const whereConditions = {};
        // Filter by auction status
        if (auctionStatus === 'upcoming') {
            whereConditions.auctionStatus = 'upcoming';
            whereConditions.startDate = { [sequelize_1.Op.gte]: new Date() }; // Ensure start date is in the future
        }
        else if (auctionStatus === 'ongoing') {
            whereConditions.auctionStatus = 'ongoing';
            whereConditions.startDate = { [sequelize_1.Op.lte]: new Date() }; // Ensure start date is in the past or today
        }
        // Filter by today's startDate if provided
        if (startDate === 'today') {
            whereConditions.startDate = {
                [sequelize_1.Op.gte]: today,
                [sequelize_1.Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Less than tomorrow
            };
        }
        // Add search filters to the where condition
        if (productId) {
            whereConditions[sequelize_1.Op.or] = [
                { id: productId },
                { sku: productId }
            ];
        }
        if (name) {
            whereConditions.name = { [sequelize_1.Op.like]: `%${name}%` }; // Search by product name
        }
        if (subCategoryName) {
            whereConditions.subCategoryName = { [sequelize_1.Op.like]: `%${subCategoryName}%` }; // Search by subcategory name
        }
        if (condition) {
            whereConditions.condition = condition; // Filter by product condition (e.g., new, used, etc.)
        }
        if (storeId) {
            whereConditions.storeId = storeId; // Filter by store ID if provided
        }
        // Fetch auction products based on conditions
        const products = yield auctionproduct_1.default.findAll({
            where: whereConditions,
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    include: [
                        {
                            model: kyc_1.default,
                            as: "kyc",
                            attributes: ["isVerified"], // Fetch isVerified from KYC
                        },
                    ],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: store_1.default,
                    as: "store",
                    attributes: ['name'],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    attributes: ["id", "name"],
                },
            ],
            limit: Number(limit),
            offset: Number(offset),
            order: [["startDate", "ASC"]], // Sort by start date (ascending)
        });
        // ✅ **Transform the response to include `isVerified`**
        const formattedProducts = products.map((product) => {
            let vendorData = product.vendor ? product.vendor.toJSON() : null;
            if (vendorData) {
                vendorData.isVerified = vendorData.kyc ? vendorData.kyc.isVerified : false;
                delete vendorData.kyc; // Remove nested kyc object if unnecessary
            }
            return Object.assign(Object.assign({}, product.toJSON()), { vendor: vendorData !== null && vendorData !== void 0 ? vendorData : null });
        });
        // Return the results as JSON response
        res.json({ data: products });
    }
    catch (error) {
        logger_1.default.error("Error fetching auction products:", error);
        res.status(500).json({ message: "Could not fetch auction products." });
    }
});
exports.getAuctionProducts = getAuctionProducts;
// Get Auction Product By ID or SKU with Recommended Products
const getAuctionProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { auctionproductId } = req.query; // Ensure userId is passed in the request
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Get the authenticated user's ID
    try {
        // Fetch the main product by ID or SKU
        const product = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [
                    { id: auctionproductId },
                    { SKU: auctionproductId }, // Replace 'SKU' with the actual SKU column name if different
                ],
            },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: store_1.default,
                    as: "store",
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ['symbol']
                        },
                    ]
                },
                {
                    model: subcategory_1.default,
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
            const kyc = yield kyc_1.default.findOne({ where: { vendorId: product.vendor.id } });
            product.vendor.setDataValue('isVerified', kyc ? kyc.isVerified : false);
        }
        // Check if the user has shown interest in this auction product
        const interest = yield showinterest_1.default.findOne({
            where: {
                userId,
                auctionProductId: product.id,
            },
        });
        // Attach interest field dynamically
        const productWithInterest = Object.assign(Object.assign({}, product.toJSON()), { interest: !!interest });
        // Send the product and recommended products in the response
        res.status(200).json({ data: productWithInterest });
    }
    catch (error) {
        logger_1.default.error("Error fetching product:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching the product.",
        });
    }
});
exports.getAuctionProductById = getAuctionProductById;
const getAdverts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, showOnHomePage } = req.query;
        // Convert pagination params
        const pageNumber = parseInt(page) || 1;
        const pageSize = parseInt(limit) || 10;
        const offset = (pageNumber - 1) * pageSize;
        // Base condition: Only approved adverts
        const searchCondition = { status: "approved" };
        // Apply search query if provided
        if (search) {
            searchCondition[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${search}%` } }, // Search in advert title
                { categoryId: { [sequelize_1.Op.like]: `%${search}%` } },
                { productId: { [sequelize_1.Op.like]: `%${search}%` } },
                { "$sub_category.name$": { [sequelize_1.Op.like]: `%${search}%` } }, // Search in category name
                { "$product.name$": { [sequelize_1.Op.like]: `%${search}%` } }, // Search in product name
            ];
        }
        // Handle boolean filtering for showOnHomePage
        if (showOnHomePage !== undefined) {
            searchCondition.showOnHomePage = showOnHomePage === "true";
        }
        const shuffle = "true";
        // Determine sorting order
        const orderClause = [[sequelize_1.Sequelize.literal("RAND()"), "ASC"]]; // Ensure valid format
        // Query adverts
        const { rows: adverts, count } = yield advert_1.default.findAndCountAll({
            where: searchCondition,
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    attributes: ["id", "name"], // Include only necessary fields
                },
                {
                    model: product_1.default,
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
    }
    catch (error) {
        logger_1.default.error("Error fetching adverts:", error);
        res.status(500).json({ message: "Failed to retrieve adverts." });
    }
});
exports.getAdverts = getAdverts;
const viewAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const advertId = req.query.advertId;
        if (!advertId) {
            res.status(400).json({ message: "Advert ID is required." });
            return;
        }
        // Find the advert by ID
        const advert = yield advert_1.default.findOne({
            where: { id: advertId },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
                {
                    model: admin_1.default,
                    as: "admin",
                    attributes: ["id", "name", "email"],
                },
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    attributes: ["id", "name"],
                },
                {
                    model: product_1.default,
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
        yield advert_1.default.update({ clicks: sequelize_1.Sequelize.literal("clicks + 1") }, { where: { id: advertId } });
        res.status(200).json({
            message: "Advert retrieved successfully.",
            data: advert,
        });
    }
    catch (error) {
        logger_1.default.error("Error viewing advert:", error);
        res.status(500).json({ message: "Failed to retrieve advert." });
    }
});
exports.viewAdvert = viewAdvert;
// Get all testimonials
const getAllTestimonials = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testimonials = yield testimonial_1.default.findAll();
        res.status(200).json({ data: testimonials });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving testimonials: ${error.message}`);
        res.status(500).json({ message: "An error occurred while retrieving testimonials. Please try again later." });
    }
});
exports.getAllTestimonials = getAllTestimonials;
// Get FAQ Categories with its FAQs
const getFaqCategoryWithFaqs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield faqcategory_1.default.findAll({
            include: [
                {
                    model: faq_1.default,
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
    }
    catch (error) {
        logger_1.default.error(`Error fetching FAQ categories with faqs: ${error.message}`);
        res.status(500).json({ message: "An error occurred while fetching the FAQ category." });
    }
});
exports.getFaqCategoryWithFaqs = getFaqCategoryWithFaqs;
const submitContactForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, phoneNumber, email, message } = req.body;
    try {
        // Create a new contact entry in the database
        const newContact = yield contact_1.default.create({
            name,
            phoneNumber,
            email,
            message,
        });
        res.status(201).json({
            message: "Thank you for reaching out! Your message has been successfully submitted. We will get back to you as soon as possible.",
            data: newContact,
        });
    }
    catch (error) {
        console.error("Error submitting contact form:", error);
        res.status(500).json({
            message: "An error occurred while submitting the contact form.",
        });
    }
});
exports.submitContactForm = submitContactForm;
const fetchJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { keyword, limit } = req.query;
        const jobLimit = limit ? parseInt(limit, 10) || 20 : 20;
        const jobs = yield (0, helpers_1.getJobsBySearch)(keyword, jobLimit);
        res.status(200).json({
            message: 'All jobs retrieved successfully.',
            data: jobs,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.fetchJobs = fetchJobs;
const viewJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const jobId = req.query.jobId;
        const job = yield job_1.default.findByPk(jobId);
        if (!job) {
            res.status(404).json({
                message: 'Not found in our database.',
            });
            return;
        }
        // Ensure `views` is not null before incrementing
        job.views = ((_a = job.views) !== null && _a !== void 0 ? _a : 0) + 1;
        yield job.save();
        res.status(200).json({
            message: 'Job retrieved successfully.',
            data: job,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: error.message });
    }
});
exports.viewJob = viewJob;
const applyJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Start transaction
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        const { jobId, name, emailAddress, phoneNumber, resumeType, resume } = req.body;
        // Validation: Ensure resumeType is required and must be "pdf"
        if (!resumeType || resumeType.toLowerCase() !== "pdf") {
            res.status(400).json({ message: "Invalid resume type. Only PDF is allowed." });
            return;
        }
        const job = yield job_1.default.findByPk(jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found in our database.' });
            return;
        }
        const existingApplication = yield applicant_1.default.findOne({ where: { emailAddress, jobId } });
        if (existingApplication) {
            res.status(400).json({ message: 'You have already applied for this job.' });
            return;
        }
        const status = job.status === 'active' ? 'applied' : 'in-progress';
        const application = yield applicant_1.default.create({
            jobId,
            name,
            emailAddress,
            phoneNumber,
            resumeType,
            resume,
            status,
        }, { transaction });
        const jobOwner = yield admin_1.default.findByPk(job.creatorId);
        if (!jobOwner) {
            throw new Error('User or job owner not found.');
        }
        // Prepare emails
        const applicantMessage = messages_1.emailTemplates.applicantNotify(job, application);
        const jobOwnerMessage = messages_1.emailTemplates.jobOwnerMailData(job, jobOwner, application);
        // Send emails
        yield (0, mail_service_1.sendMail)(emailAddress, `${process.env.APP_NAME} - Application Confirmation`, applicantMessage);
        yield (0, mail_service_1.sendMail)(jobOwner.email, `${process.env.APP_NAME} - New Job Application Received`, jobOwnerMessage);
        yield transaction.commit();
        res.status(200).json({
            message: `Your application has been successfully sent to ${process.env.APP_NAME}.`,
            data: application,
        });
    }
    catch (error) {
        yield transaction.rollback();
        logger_1.default.error('Error in applyJob:', error);
        res.status(500).json({ message: "Error in applying job." });
    }
});
exports.applyJob = applyJob;
// Get all banners
const getAllBanners = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const banners = yield banner_1.default.findAll();
        res.status(200).json({ data: banners });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving banners: ${error.message}`);
        res.status(500).json({ message: "An error occurred while retrieving banners. Please try again later." });
    }
});
exports.getAllBanners = getAllBanners;
//# sourceMappingURL=homeController.js.map