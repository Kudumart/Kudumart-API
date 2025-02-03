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
exports.getAdverts = exports.getAuctionProductById = exports.getUpcomingAuctionProducts = exports.getStoreProducts = exports.getAllStores = exports.getProductById = exports.products = exports.getCategoriesWithSubcategories = exports.getCategorySubCategories = exports.getAllCategories = void 0;
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
    const { country, storeId, minPrice, maxPrice, name, // Product name
    subCategoryName, // Subcategory name filter
    condition, // Product condition filter
     } = req.query;
    try {
        // Define the base where clause with the active status
        const whereClause = { status: "active" };
        // Additional filters based on query parameters
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
            whereClause.name = { [sequelize_1.Op.like]: `%${name}%` }; // Case-insensitive search for product name
        }
        if (condition) {
            whereClause.condition = condition; // Filter by product condition
        }
        // Construct the where clause for subCategory with conditional categoryId and subCategoryName
        const subCategoryWhereClause = {};
        if (subCategoryName) {
            subCategoryWhereClause.name = { [sequelize_1.Op.like]: `%${subCategoryName}%` };
        }
        // Include the subCategory relation with name and id filtering
        const includeClause = [
            {
                model: subcategory_1.default,
                as: "sub_category",
                where: Object.keys(subCategoryWhereClause).length > 0
                    ? subCategoryWhereClause
                    : undefined,
                attributes: ["id", "name"],
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
            }
        ];
        // Fetch active products with subcategory details
        const products = yield product_1.default.findAll({
            where: whereClause,
            include: includeClause,
        });
        res.status(200).json({ data: products });
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
        console.log(product);
        if (!product) {
            res.status(404).json({ message: "Product not found" });
            return;
        }
        if (product && product.vendor) { // This should now return the associated User (vendor)
            const kyc = yield kyc_1.default.findOne({ where: { vendorId: product.vendor.id } });
            product.vendor.setDataValue('isVerified', kyc ? kyc.isVerified : false);
        }
        // Fetch recommended products based on the same category
        const recommendedProducts = yield product_1.default.findAll({
            where: {
                categoryId: product.categoryId,
                id: { [sequelize_1.Op.ne]: product.id }, // Exclude the currently viewed product
                status: "active",
            },
            include: [
                {
                    model: user_1.default,
                    as: "vendor",
                    required: true, // Make sure the user is included in the result
                },
                {
                    model: admin_1.default,
                    as: "admin"
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
            limit: 10,
            order: sequelize_1.Sequelize.fn('RAND'), // Randomize the order
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
// Function to get all upcoming auction products with search functionality
const getUpcomingAuctionProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { storeId, name, // Product name
    subCategoryName, // Subcategory name filter
    condition, // Product condition filter
    limit = 10, // Default to 10 results if not specified
    offset = 0, // Default to 0 offset (start from the beginning)
     } = req.query;
    try {
        // Build the search criteria dynamically
        const whereConditions = {
            auctionStatus: 'upcoming',
            startDate: { [sequelize_1.Op.gte]: new Date() }, // Ensure start date is in the future
        };
        // Add search filters to the where condition
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
        // Fetch upcoming auction products based on conditions
        const products = yield auctionproduct_1.default.findAll({
            where: whereConditions,
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
        // Return the results as JSON response
        res.json({ data: products });
    }
    catch (error) {
        logger_1.default.error("Error fetching upcoming auction products:", error);
        res.status(500).json({ message: "Could not fetch upcoming auction products." });
    }
});
exports.getUpcomingAuctionProducts = getUpcomingAuctionProducts;
// Get Auction Product By ID or SKU with Recommended Products
const getAuctionProductById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { auctionproductId } = req.query;
    try {
        // Fetch the main product by ID or SKU
        const product = yield auctionproduct_1.default.findOne({
            where: {
                auctionStatus: "upcoming",
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
        if (product && product.vendor) { // This should now return the associated User (vendor)
            const kyc = yield kyc_1.default.findOne({ where: { vendorId: product.vendor.id } });
            product.vendor.setDataValue('isVerified', kyc ? kyc.isVerified : false);
        }
        // Send the product and recommended products in the response
        res.status(200).json({ data: product });
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
            order: [["createdAt", "DESC"]],
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
//# sourceMappingURL=homeController.js.map