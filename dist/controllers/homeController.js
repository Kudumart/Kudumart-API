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
exports.getServiceReviews = exports.getServiceById = exports.getAllServices = exports.getAttributesForServiceCategory = exports.getAllServiceSubCategories = exports.getAllServiceCategories = exports.createPaymentIntent = exports.getAllBanners = exports.applyJob = exports.viewJob = exports.fetchJobs = exports.submitContactForm = exports.getFaqCategoryWithFaqs = exports.getAllTestimonials = exports.viewAdvert = exports.getAdverts = exports.getAuctionProductById = exports.getAuctionProducts = exports.getStoreProducts = exports.getAllStores = exports.getProductPriceHistory = exports.getProductById = exports.products = exports.getCategoriesWithSubcategories = exports.getCategorySubCategories = exports.getAllCategories = void 0;
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
const blockedvendor_1 = __importDefault(require("../models/blockedvendor"));
const serviceCategories_1 = __importDefault(require("../models/serviceCategories"));
const serviceSubCategories_1 = __importDefault(require("../models/serviceSubCategories"));
const serviceCategoryToAttributeMap_1 = __importDefault(require("../models/serviceCategoryToAttributeMap"));
const attributeDefinitions_1 = __importDefault(require("../models/attributeDefinitions"));
const attributeOptions_1 = __importDefault(require("../models/attributeOptions"));
const services_1 = __importDefault(require("../models/services"));
const servicereview_1 = __importDefault(require("../models/servicereview"));
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
            where: { categoryId },
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
    var _a;
    const { country, productId, storeId, minPrice, maxPrice, name, // Product name
    subCategoryName, // Subcategory name filter
    condition, // Product condition filter
    categoryId, popular, // Query parameter to sort by most viewed
    symbol, page = "1", // Default page '1' if not provided
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
        const whereClause = { status: "active" };
        // Additional filters based on query parameters
        if (productId) {
            whereClause[sequelize_1.Op.or] = [{ id: productId }, { sku: productId }];
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
                { name: { [sequelize_1.Op.like]: `%${normalizedName}%` } }, // Use LIKE query for product name search
            ];
        }
        if (condition) {
            whereClause.condition = condition; // Filter by product condition
        }
        // Blocked vendor exclusion logic
        let blockedVendorIds = [];
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId) {
            const blockedVendors = yield blockedvendor_1.default.findAll({ where: { userId } });
            blockedVendorIds = blockedVendors.map((bv) => bv.vendorId);
        }
        // Exclude products from blocked vendors
        if (blockedVendorIds.length > 0) {
            whereClause.vendorId = { [sequelize_1.Op.notIn]: blockedVendorIds };
        }
        // Construct the where clause for subCategory with conditional categoryId and subCategoryName
        const subCategoryWhereClause = {};
        if (subCategoryName) {
            subCategoryWhereClause.name = { [sequelize_1.Op.like]: `%${subCategoryName}%` };
        }
        if (categoryId) {
            subCategoryWhereClause.categoryId = categoryId; // Filter by categoryId
        }
        const countryFilter = country === null || country === void 0 ? void 0 : country.toString().toLowerCase();
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
                where: countryFilter
                    ? (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("JSON_UNQUOTE", (0, sequelize_1.fn)("JSON_EXTRACT", (0, sequelize_1.col)("store.location"), (0, sequelize_1.literal)("'$.country'")))), {
                        [sequelize_1.Op.like]: `%${countryFilter}%`,
                    })
                    : undefined,
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
            ? [
                ["views", "DESC"],
                [sequelize_1.Sequelize.literal("RAND()"), "ASC"],
            ] // Sort by views first, then randomize
            : [[sequelize_1.Sequelize.literal("RAND()"), "ASC"]]; // Default random sorting
        // Calculate the offset based on page and limit
        const offset = (currentPage - 1) * currentLimit;
        // Fetch active products with subcategory details and dynamic pagination
        const { count, rows: products } = yield product_1.default.findAndCountAll({
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
        const nextPage = currentPage < totalPages
            ? `${req.baseUrl}?page=${currentPage + 1}&limit=${currentLimit}`
            : null;
        const prevPage = currentPage > 1
            ? `${req.baseUrl}?page=${currentPage - 1}&limit=${currentLimit}`
            : null;
        // ✅ **Transform the response to include `isVerified`**
        const formattedProducts = products.map((product) => {
            let vendorData = product.vendor ? product.vendor.toJSON() : null;
            if (vendorData) {
                vendorData.isVerified = vendorData.kyc
                    ? vendorData.kyc.isVerified
                    : false;
                delete vendorData.kyc; // Remove nested kyc object if unnecessary
            }
            return Object.assign(Object.assign({}, product.toJSON()), { vendor: vendorData !== null && vendorData !== void 0 ? vendorData : null });
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
    var _a;
    const { productId } = req.query;
    try {
        // Blocked vendor exclusion logic
        let blockedVendorIds = [];
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId) {
            const blockedVendors = yield blockedvendor_1.default.findAll({ where: { userId } });
            blockedVendorIds = blockedVendors.map((bv) => bv.vendorId);
        }
        // Build where clause
        const whereClause = {
            status: "active",
            [sequelize_1.Op.or]: [
                { id: productId },
                { SKU: productId }, // Replace 'SKU' with the actual SKU column name if different
            ],
        };
        // Add blocked vendor filter if user has blocked vendors
        if (blockedVendorIds.length > 0) {
            whereClause.vendorId = { [sequelize_1.Op.notIn]: blockedVendorIds };
        }
        // Fetch the main product by ID or SKU
        const product = yield product_1.default.findOne({
            where: whereClause,
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
        yield product.increment("views", { by: 1 });
        // Fetch vendor KYC verification status
        if (product.vendor) {
            const kyc = yield kyc_1.default.findOne({ where: { vendorId: product.vendor.id } });
            product.vendor.setDataValue("isVerified", kyc ? kyc.isVerified : false);
        }
        // ✅ Calculate Review Rating
        const reviews = Array.isArray(product.reviews)
            ? product.reviews
            : [];
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? (reviews.reduce((sum, review) => sum + Number(review.rating) || 0, 0) / totalReviews).toFixed(1)
            : "0.0";
        // Attach review data to the product
        product.setDataValue("averageRating", parseFloat(averageRating));
        product.setDataValue("totalReviews", totalReviews);
        // Build where clause for recommended products
        const recommendedWhereClause = {
            categoryId: product.categoryId, // Fetch products from the same subcategory
            id: { [sequelize_1.Op.ne]: product.id }, // Exclude the currently viewed product
            status: "active",
        };
        // Add blocked vendor filter to recommended products
        if (blockedVendorIds.length > 0) {
            recommendedWhereClause.vendorId = { [sequelize_1.Op.notIn]: blockedVendorIds };
        }
        // Fetch recommended products based on the same subcategory
        const recommendedProducts = yield product_1.default.findAll({
            where: recommendedWhereClause,
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
// Get price history/market comparison for a product by name
const getProductPriceHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.query;
    if (!name) {
        res.status(400).json({ message: "Product name is required" });
        return;
    }
    try {
        const normalizedName = String(name).trim().replace(/\s+/g, " ");
        const nameFilter = { [sequelize_1.Op.like]: `%${normalizedName}%` };
        const baseWhere = { name: nameFilter, status: "active" };
        // Single query — window functions compute aggregates in the same DB scan as the data points
        const rows = yield product_1.default.findAll({
            where: baseWhere,
            attributes: [
                "price",
                "condition",
                [(0, sequelize_1.fn)("DATE", (0, sequelize_1.col)("createdAt")), "date"],
                [(0, sequelize_1.literal)("MIN(price) OVER()"), "minPrice"],
                [(0, sequelize_1.literal)("MAX(price) OVER()"), "maxPrice"],
                [(0, sequelize_1.literal)("ROUND(AVG(price) OVER(), 2)"), "avgPrice"],
                [(0, sequelize_1.literal)("COUNT(*) OVER()"), "totalListings"],
            ],
            order: [["createdAt", "ASC"]],
            raw: true,
        });
        if (rows.length === 0) {
            res.status(200).json({
                productName: normalizedName,
                dataPoints: [],
                stats: null,
            });
            return;
        }
        // Aggregates are identical on every row — read once from the first
        const first = rows[0];
        res.status(200).json({
            productName: normalizedName,
            dataPoints: rows.map((p) => ({
                date: p.date,
                price: parseFloat(p.price),
                condition: p.condition,
            })),
            stats: {
                minPrice: parseFloat(first.minPrice),
                maxPrice: parseFloat(first.maxPrice),
                avgPrice: parseFloat(first.avgPrice),
                totalListings: parseInt(first.totalListings),
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching product price history:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching price history.",
        });
    }
});
exports.getProductPriceHistory = getProductPriceHistory;
// Controller to get all stores with optional filters and pagination
const getAllStores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract query parameters with default values
        const { name = "", // Default to an empty string for name filter
        city = "", // Default to an empty string for city filter
        page = 1, // Default to page 1
        limit = 10, // Default to 10 items per page
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
    var _a;
    try {
        // Extract storeId from query parameters or request params
        const storeId = req.query.storeId;
        const { productName = "", page = 1, limit = 10 } = req.query;
        if (!storeId) {
            res.status(400).json({ message: "Store ID is required" });
            return;
        }
        // Blocked vendor exclusion logic
        let blockedVendorIds = [];
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId) {
            const blockedVendors = yield blockedvendor_1.default.findAll({ where: { userId } });
            blockedVendorIds = blockedVendors.map((bv) => bv.vendorId);
        }
        // Calculate pagination values
        const offset = (Number(page) - 1) * Number(limit);
        // Build where clause
        const whereClause = Object.assign({ storeId }, (productName ? { name: { [sequelize_1.Op.like]: `%${productName}%` } } : {}));
        // Add blocked vendor filter if user has blocked vendors
        if (blockedVendorIds.length > 0) {
            whereClause.vendorId = { [sequelize_1.Op.notIn]: blockedVendorIds };
        }
        // Fetch products along with the associated currency
        const products = yield product_1.default.findAll({
            where: whereClause,
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
                    attributes: ["name"],
                    include: [
                        {
                            model: currency_1.default,
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
    var _a;
    const { productId, storeId, name, // Product name
    subCategoryName, // Subcategory name filter
    country, condition, // Product condition filter
    auctionStatus, // 'upcoming' or 'ongoing'
    startDate, // Filter by today's date
    limit = 10, // Default to 10 results if not specified
    offset = 0, // Default to 0 offset (start from the beginning)
     } = req.query;
    try {
        // Blocked vendor exclusion logic
        let blockedVendorIds = [];
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (userId) {
            const blockedVendors = yield blockedvendor_1.default.findAll({ where: { userId } });
            blockedVendorIds = blockedVendors.map((bv) => bv.vendorId);
        }
        // Get today's date (start of the day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        // Build the search criteria dynamically
        const whereConditions = {};
        // Filter by auction status
        if (auctionStatus === "upcoming") {
            whereConditions.auctionStatus = "upcoming";
            whereConditions.startDate = { [sequelize_1.Op.gte]: new Date() }; // Ensure start date is in the future
        }
        else if (auctionStatus === "ongoing") {
            whereConditions.auctionStatus = "ongoing";
            whereConditions.startDate = { [sequelize_1.Op.lte]: new Date() }; // Ensure start date is in the past or today
        }
        // Filter by today's startDate if provided
        if (startDate === "today") {
            whereConditions.startDate = {
                [sequelize_1.Op.gte]: today,
                [sequelize_1.Op.lt]: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Less than tomorrow
            };
        }
        // Add search filters to the where condition
        if (productId) {
            whereConditions[sequelize_1.Op.or] = [{ id: productId }, { sku: productId }];
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
        // Add blocked vendor filter if user has blocked vendors
        if (blockedVendorIds.length > 0) {
            whereConditions.vendorId = { [sequelize_1.Op.notIn]: blockedVendorIds };
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
                    attributes: ["name"],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                    where: country
                        ? (0, sequelize_1.where)((0, sequelize_1.fn)("LOWER", (0, sequelize_1.fn)("JSON_UNQUOTE", (0, sequelize_1.fn)("JSON_EXTRACT", (0, sequelize_1.col)("store.location"), (0, sequelize_1.literal)("'$.country'")))), {
                            [sequelize_1.Op.like]: `%${country.toString().toLowerCase()}%`,
                        })
                        : undefined,
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
                vendorData.isVerified = vendorData.kyc
                    ? vendorData.kyc.isVerified
                    : false;
                delete vendorData.kyc; // Remove nested kyc object if unnecessary
            }
            return Object.assign(Object.assign({}, product.toJSON()), { vendor: vendorData !== null && vendorData !== void 0 ? vendorData : null });
        });
        // Return the results as JSON response
        res.json({ data: formattedProducts });
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
        // Blocked vendor exclusion logic
        let blockedVendorIds = [];
        if (userId) {
            const blockedVendors = yield blockedvendor_1.default.findAll({ where: { userId } });
            blockedVendorIds = blockedVendors.map((bv) => bv.vendorId);
        }
        // Build where clause
        const whereClause = {
            [sequelize_1.Op.or]: [
                { id: auctionproductId },
                { SKU: auctionproductId }, // Replace 'SKU' with the actual SKU column name if different
            ],
        };
        // Add blocked vendor filter if user has blocked vendors
        if (blockedVendorIds.length > 0) {
            whereClause.vendorId = { [sequelize_1.Op.notIn]: blockedVendorIds };
        }
        // Fetch the main product by ID or SKU
        const product = yield auctionproduct_1.default.findOne({
            where: whereClause,
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
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        if (product && product.vendor) {
            const kyc = yield kyc_1.default.findOne({ where: { vendorId: product.vendor.id } });
            product.vendor.setDataValue("isVerified", kyc ? kyc.isVerified : false);
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
        res.status(500).json({
            message: "An error occurred while retrieving testimonials. Please try again later.",
        });
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
        res
            .status(500)
            .json({ message: "An error occurred while fetching the FAQ category." });
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
        logger_1.default.error("Error submitting contact form:", error);
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
            message: "All jobs retrieved successfully.",
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
                message: "Not found in our database.",
            });
            return;
        }
        // Ensure `views` is not null before incrementing
        job.views = ((_a = job.views) !== null && _a !== void 0 ? _a : 0) + 1;
        yield job.save();
        res.status(200).json({
            message: "Job retrieved successfully.",
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
            res
                .status(400)
                .json({ message: "Invalid resume type. Only PDF is allowed." });
            return;
        }
        const job = yield job_1.default.findByPk(jobId);
        if (!job) {
            res.status(404).json({ message: "Job not found in our database." });
            return;
        }
        const existingApplication = yield applicant_1.default.findOne({
            where: { emailAddress, jobId },
        });
        if (existingApplication) {
            res
                .status(400)
                .json({ message: "You have already applied for this job." });
            return;
        }
        const status = job.status === "active" ? "applied" : "in-progress";
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
            throw new Error("User or job owner not found.");
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
        logger_1.default.error("Error in applyJob:", error);
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
        res.status(500).json({
            message: "An error occurred while retrieving banners. Please try again later.",
        });
    }
});
exports.getAllBanners = getAllBanners;
const createPaymentIntent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { amount, currency } = req.body;
        // Ensure amount and currency are provided
        if (!amount || !currency) {
            res.status(400).json({ message: "Amount and currency are required" });
            return;
        }
        const stripe = yield (0, helpers_1.initStripe)(); // Await the function to get the Stripe instance
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: amount * 100, // Convert amount to cents
            currency: currency || "usd",
        });
        res.status(200).json({ data: paymentIntent.client_secret });
    }
    catch (error) {
        logger_1.default.error("Stripe Error:", error);
        res.status(500).json({ error: error.message });
    }
});
exports.createPaymentIntent = createPaymentIntent;
const getAllServiceCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page, limit } = req.query;
    try {
        const offset = (Number(page) - 1) * (Number(limit) || 10);
        const categories = yield serviceCategories_1.default.findAll({
            limit: Number(limit) || 10,
            offset: offset || 0,
        });
        if (!categories) {
            res.status(404).json({ message: "Service categories not found" });
            return;
        }
        res.status(200).json({ data: categories });
    }
    catch (error) {
        logger_1.default.error(`Error fetching service categories: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while fetching service categories.",
        });
    }
});
exports.getAllServiceCategories = getAllServiceCategories;
const getAllServiceSubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: serviceCategoryId } = req.params;
    const { page, limit } = req.query;
    try {
        const offset = (Number(page) - 1) * (Number(limit) || 10);
        const subCategories = yield serviceSubCategories_1.default.findAll({
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
    }
    catch (error) {
        logger_1.default.error(`Error fetching service subcategories: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while fetching service subcategories.",
        });
    }
});
exports.getAllServiceSubCategories = getAllServiceSubCategories;
const getAttributesForServiceCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoryId: serviceCategoryId } = req.params;
    const { page, limit } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    try {
        if (!serviceCategoryId) {
            res.status(400).json({ message: "Service category ID is required." });
            return;
        }
        const serviceCategory = yield serviceCategories_1.default.findByPk(serviceCategoryId);
        if (!serviceCategory) {
            res.status(404).json({ message: "Service category not found." });
            return;
        }
        const attributeMappings = yield serviceCategoryToAttributeMap_1.default.findAll({
            where: { service_category_id: serviceCategoryId },
            limit: Number(limit) || 10,
            offset: offset || 0,
            include: [
                {
                    model: attributeDefinitions_1.default,
                    as: "attribute",
                    include: [
                        {
                            model: attributeOptions_1.default,
                            as: "options",
                            attributes: ["id", "option_value"],
                        },
                    ],
                },
            ],
        });
        const attributes = attributeMappings.map((mapping) => mapping.attribute);
        res.status(200).json({ data: attributes });
    }
    catch (error) {
        logger_1.default.error(`Error retrieving attributes for service category: ${error.message}`);
        res.status(500).json({
            message: "An error occurred while retrieving attributes for the service category. Please try again later.",
        });
    }
});
exports.getAttributesForServiceCategory = getAttributesForServiceCategory;
const getAllServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { page = "1", limit = "10", categoryId, subCategoryId, search, } = req.query;
    try {
        // Calculate pagination values
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
        const offset = (currentPage - 1) * currentLimit;
        // Build where clause
        const whereClause = {};
        if (categoryId) {
            whereClause.service_category_id = categoryId;
        }
        if (subCategoryId) {
            whereClause.service_subcategory_id = subCategoryId;
        }
        // Add search filter for service name or description
        if (search) {
            const normalizedSearch = String(search).trim().replace(/\s+/g, " ");
            whereClause[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${normalizedSearch}%` } },
                { description: { [sequelize_1.Op.like]: `%${normalizedSearch}%` } },
            ];
        }
        whereClause.status = "active"; // Only fetch active services
        // Fetch services with pagination
        const { count, rows: services } = yield services_1.default.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: user_1.default,
                    as: "provider",
                    include: [
                        {
                            model: kyc_1.default,
                            as: "kyc",
                            attributes: ["isVerified"], // Fetch isVerified from KYC
                        },
                    ],
                },
                {
                    model: serviceCategories_1.default,
                    as: "category",
                    attributes: ["id", "name"],
                },
                {
                    model: serviceSubCategories_1.default,
                    as: "subCategory",
                    attributes: ["id", "name"],
                },
            ],
            limit: currentLimit,
            offset,
            order: [["createdAt", "DESC"]],
        });
        // Transform the response to include isVerified
        const formattedServices = services.map((service) => {
            let providerData = service.provider ? service.provider.toJSON() : null;
            if (providerData) {
                providerData.isVerified = providerData.kyc
                    ? providerData.kyc.isVerified
                    : false;
                delete providerData.kyc; // Remove nested kyc object if unnecessary
            }
            return Object.assign(Object.assign({}, service.toJSON()), { provider: providerData !== null && providerData !== void 0 ? providerData : null });
        });
        // Calculate total pages
        const totalPages = Math.ceil(count / currentLimit);
        // Build query string preserving existing parameters
        const buildPageUrl = (pageNum) => {
            const params = new URLSearchParams();
            params.set("page", String(pageNum));
            params.set("limit", String(currentLimit));
            if (categoryId)
                params.set("categoryId", String(categoryId));
            if (subCategoryId)
                params.set("subCategoryId", String(subCategoryId));
            if (search)
                params.set("search", String(search));
            return `${req.baseUrl}?${params.toString()}`;
        };
        // Generate next and previous page links
        const nextPage = currentPage < totalPages ? buildPageUrl(currentPage + 1) : null;
        const prevPage = currentPage > 1 ? buildPageUrl(currentPage - 1) : null;
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
    }
    catch (error) {
        logger_1.default.error("Error fetching services:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching services.",
        });
    }
});
exports.getAllServices = getAllServices;
const getServiceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.params;
    try {
        if (!serviceId) {
            res.status(400).json({ message: "Service ID is required" });
            return;
        }
        // Fetch the service by ID
        const service = yield services_1.default.findOne({
            where: { id: serviceId, status: "active" },
            include: [
                {
                    model: user_1.default,
                    as: "provider",
                    include: [
                        {
                            model: kyc_1.default,
                            as: "kyc",
                            attributes: ["isVerified"], // Fetch isVerified from KYC
                        },
                    ],
                },
                {
                    model: serviceCategories_1.default,
                    as: "category",
                    attributes: ["id", "name"],
                },
                {
                    model: serviceSubCategories_1.default,
                    as: "subCategory",
                    attributes: ["id", "name"],
                },
            ],
        });
        if (!service) {
            res.status(404).json({ message: "Service not found" });
            return;
        }
        if (service && service.provider) {
            const kyc = yield kyc_1.default.findOne({
                where: { vendorId: service.provider.id },
            });
            service.provider.setDataValue("isVerified", kyc ? kyc.isVerified : false);
        }
        // Send the service in the response
        res.status(200).json({ data: service });
    }
    catch (error) {
        logger_1.default.error("Error fetching service:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching the service.",
        });
    }
});
exports.getServiceById = getServiceById;
const getServiceReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const { count, rows: reviews } = yield servicereview_1.default.findAndCountAll({
            where: { serviceId },
            include: [
                {
                    model: user_1.default,
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
        const nextPage = currentPage < totalPages
            ? `${req.baseUrl}?page=${currentPage + 1}&limit=${currentLimit}`
            : null;
        const prevPage = currentPage > 1
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
    }
    catch (error) {
        logger_1.default.error("Error fetching service reviews:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching service reviews.",
        });
    }
});
exports.getServiceReviews = getServiceReviews;
//# sourceMappingURL=homeController.js.map