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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWithdrawalById = exports.updateWithdrawal = exports.getWithdrawals = exports.requestWithdrawal = exports.deleteBankInformation = exports.getSingleBankInformation = exports.getBankInformation = exports.updateBankInformation = exports.addBankInformation = exports.deleteAdvert = exports.viewAdvert = exports.getAdverts = exports.updateAdvert = exports.createAdvert = exports.activeProducts = exports.getOrderItemsInfo = exports.getVendorOrderItems = exports.getAllSubCategories = exports.getAllCurrencies = exports.verifyCAC = exports.subscribeDollar = exports.subscribe = exports.subscriptionPlans = exports.getAllBidsByAuctionProductId = exports.viewAuctionProduct = exports.fetchVendorAuctionProducts = exports.cancelAuctionProduct = exports.deleteAuctionProduct = exports.updateAuctionProduct = exports.createAuctionProduct = exports.changeProductStatus = exports.moveToDraft = exports.viewProduct = exports.fetchVendorProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.deleteStore = exports.updateStore = exports.createStore = exports.viewStore = exports.getStore = exports.getKYC = exports.submitOrUpdateKYC = void 0;
const user_1 = __importDefault(require("../models/user"));
const uuid_1 = require("uuid");
const sequelize_1 = require("sequelize");
const logger_1 = __importDefault(require("../middlewares/logger")); // Adjust the path to your logger.js
const kyc_1 = __importDefault(require("../models/kyc"));
const store_1 = __importDefault(require("../models/store"));
const product_1 = __importDefault(require("../models/product"));
const subcategory_1 = __importDefault(require("../models/subcategory"));
const helpers_1 = require("../utils/helpers");
const auctionproduct_1 = __importDefault(require("../models/auctionproduct"));
const bid_1 = __importDefault(require("../models/bid"));
const https_1 = __importDefault(require("https"));
const subscriptionplan_1 = __importDefault(require("../models/subscriptionplan"));
const vendorsubscription_1 = __importDefault(require("../models/vendorsubscription"));
const notification_1 = __importDefault(require("../models/notification"));
const transaction_1 = __importDefault(require("../models/transaction"));
const paymentgateway_1 = __importDefault(require("../models/paymentgateway"));
const currency_1 = __importDefault(require("../models/currency"));
const orderitem_1 = __importDefault(require("../models/orderitem"));
const order_1 = __importDefault(require("../models/order"));
const advert_1 = __importDefault(require("../models/advert"));
const bankinformation_1 = __importDefault(require("../models/bankinformation"));
const cart_1 = __importDefault(require("../models/cart"));
const sequelize_service_1 = __importDefault(require("../services/sequelize.service"));
const saveproduct_1 = __importDefault(require("../models/saveproduct"));
const reviewproduct_1 = __importDefault(require("../models/reviewproduct"));
const withdrawal_1 = __importDefault(require("../models/withdrawal"));
const admin_1 = __importDefault(require("../models/admin"));
const role_1 = __importDefault(require("../models/role"));
const submitOrUpdateKYC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const kycData = req.body;
    try {
        // Check if a KYC record already exists for this user
        const existingKYC = yield kyc_1.default.findOne({ where: { vendorId } });
        if (existingKYC === null || existingKYC === void 0 ? void 0 : existingKYC.isVerified) {
            res.status(400).json({
                message: "KYC is already verified and cannot be modified again.",
            });
            return;
        }
        if (existingKYC) {
            // Update the existing KYC record
            yield existingKYC.update(kycData);
            res
                .status(200)
                .json({ message: "KYC updated successfully", data: existingKYC });
            return;
        }
        else {
            // Create a new KYC record
            const newKYC = yield kyc_1.default.create(Object.assign(Object.assign({ vendorId }, kycData), { isVerified: true }));
            res
                .status(200)
                .json({ message: "KYC created successfully", data: newKYC });
            return;
        }
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "An error occurred while processing KYC" });
    }
});
exports.submitOrUpdateKYC = submitOrUpdateKYC;
const getKYC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Check if a KYC record already exists for this user
        const kyc = yield kyc_1.default.findOne({ where: { vendorId } });
        res.status(200).json({ data: kyc });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "An error occurred while fetching KYC" });
    }
});
exports.getKYC = getKYC;
const getStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        const stores = yield store_1.default.findAll({
            where: { vendorId },
            include: [
                {
                    model: currency_1.default,
                    as: "currency",
                },
                {
                    model: product_1.default,
                    as: "products",
                    attributes: [], // Don't include individual product details
                },
                {
                    model: auctionproduct_1.default,
                    as: "auctionproducts",
                    attributes: [], // Don't include individual product details
                },
            ],
            attributes: {
                include: [
                    // Include total product count for each store
                    [
                        sequelize_1.Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE product.storeId = Store.id
                        )`),
                        "totalProducts",
                    ],
                    // Include total auction product count for each store
                    [
                        sequelize_1.Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM auction_products AS auctionproduct
                            WHERE auctionproduct.storeId = Store.id
                        )`),
                        "totalAuctionProducts",
                    ],
                ],
            },
        });
        // Check if any stores were found
        if (stores.length === 0) {
            res.status(404).json({ message: "No stores found for this vendor.", data: [] });
            return;
        }
        res.status(200).json({ data: stores });
    }
    catch (error) {
        logger_1.default.error("Error retrieving stores:", error);
        res.status(500).json({ message: "Failed to retrieve stores", error });
    }
});
exports.getStore = getStore;
const viewStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const storeId = req.query.storeId;
    try {
        const store = yield store_1.default.findOne({
            where: { vendorId, id: storeId },
            include: [
                {
                    model: currency_1.default,
                    as: "currency",
                },
                {
                    model: product_1.default,
                    as: "products",
                    attributes: [], // Don't include individual product details
                },
                {
                    model: auctionproduct_1.default,
                    as: "auctionproducts",
                    attributes: [], // Don't include individual product details
                },
            ]
        });
        res.status(200).json({ data: store });
    }
    catch (error) {
        logger_1.default.error("Error retrieving store:", error);
        res.status(500).json({ message: "Failed to retrieve store", error });
    }
});
exports.viewStore = viewStore;
const createStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { currencyId, name, location, logo, businessHours, deliveryOptions, tipsOnFinding } = req.body;
    if (!currencyId) {
        res.status(400).json({ message: 'Currency ID is required.' });
        return;
    }
    try {
        // Check if a store with the same name exists for this vendorId
        const existingStore = yield store_1.default.findOne({
            where: { vendorId, name },
        });
        if (existingStore) {
            res.status(400).json({
                message: "A store with this name already exists for the vendor.",
            });
            return;
        }
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: 'Currency not found' });
            return;
        }
        // Create the store
        const store = yield store_1.default.create({
            vendorId,
            currencyId: currency.id,
            name,
            location,
            businessHours,
            deliveryOptions,
            logo,
            tipsOnFinding,
        });
        res
            .status(200)
            .json({ message: "Store created successfully", data: store });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to create store", error });
    }
});
exports.createStore = createStore;
const updateStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { storeId, currencyId, name, location, businessHours, deliveryOptions, tipsOnFinding, logo } = req.body;
    try {
        const store = yield store_1.default.findOne({ where: { id: storeId } });
        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: 'Currency not found' });
            return;
        }
        // Check for unique name for this vendorId if name is being updated
        if (name && store.name !== name) {
            const existingStore = yield store_1.default.findOne({
                where: { vendorId, name, id: { [sequelize_1.Op.ne]: storeId } },
            });
            if (existingStore) {
                res.status(400).json({
                    message: "A store with this name already exists for the vendor.",
                });
                return;
            }
        }
        // Update store fields
        yield store.update({
            currencyId,
            name,
            location,
            businessHours,
            deliveryOptions,
            tipsOnFinding,
            logo
        });
        res
            .status(200)
            .json({ message: "Store updated successfully", data: store });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to update store", error });
    }
});
exports.updateStore = updateStore;
const deleteStore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const storeId = req.query.storeId;
    try {
        const store = yield store_1.default.findOne({ where: { id: storeId } });
        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        const relatedTables = [
            { name: "auction_products", model: auctionproduct_1.default, field: "storeId" },
            { name: "products", model: product_1.default, field: "storeId" }
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: store.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete store because related records exist in ${table.name}` });
                return;
            }
        }
        yield store.destroy();
        res.status(200).json({ message: "Store deleted successfully" });
    }
    catch (error) {
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete store because it has associated products. Delete or reassign products before deleting this store.",
            });
        }
        else {
            logger_1.default.error(error);
            res.status(500).json({ message: "Failed to delete store", error });
        }
    }
});
exports.deleteStore = deleteStore;
// Product
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const _b = req.body, { storeId, categoryId, name } = _b, otherData = __rest(_b, ["storeId", "categoryId", "name"]);
    try {
        // Use the utility function to check the product limit
        const { status, message } = yield (0, helpers_1.checkVendorProductLimit)(vendorId);
        if (!status) {
            res.status(403).json({ message });
            return;
        }
        // Check for duplicates
        const existingProduct = yield product_1.default.findOne({
            where: { vendorId, name },
        });
        if (existingProduct) {
            res.status(400).json({
                message: "Product with this vendorId and name already exists.",
            });
            return;
        }
        // Check if vendorId, storeId, and categoryId exist
        const vendorExists = yield user_1.default.findByPk(vendorId);
        const storeExists = yield store_1.default.findByPk(storeId);
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!vendorExists) {
            res
                .status(404)
                .json({ message: "Vendor not found." });
            return;
        }
        if (!storeExists) {
            res
                .status(404)
                .json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }
        // Generate a unique SKU (could also implement a more complex logic if needed)
        let sku;
        let isUnique = false;
        while (!isUnique) {
            sku = `KDM-${(0, uuid_1.v4)()}`; // Generate a unique SKU
            const skuExists = yield product_1.default.findOne({ where: { sku } }); // Check if the SKU already exists
            isUnique = !skuExists; // Set to true if SKU is unique
        }
        // Create the product
        const product = yield product_1.default.create(Object.assign({ vendorId,
            storeId,
            categoryId,
            name,
            sku }, otherData));
        res
            .status(200)
            .json({ message: "Product created successfully", data: product });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to create product" });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const _b = req.body, { productId } = _b, updateData = __rest(_b, ["productId"]);
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Use the utility function to check the product limit
        // const { status, message } = await checkVendorProductLimit(vendorId);
        // if (!status) {
        //     res.status(403).json({ message });
        //     return;
        // }
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId,
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        yield product.update(updateData);
        res.status(200).json({
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to update product" });
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.query;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId,
            },
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        const relatedTables = [
            { name: "save_products", model: saveproduct_1.default, field: "productId" },
            { name: "review_products", model: reviewproduct_1.default, field: "productId" },
            { name: "carts", model: cart_1.default, field: "productId" }
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: product.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete product because related records exist in ${table.name}` });
                return;
            }
        }
        yield product.destroy();
        res.status(200).json({
            message: "Product deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to delete product" });
    }
});
exports.deleteProduct = deleteProduct;
const fetchVendorProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { name, sku, status, condition, categoryName } = req.query;
    try {
        const products = yield product_1.default.findAll(Object.assign({ where: { vendorId }, include: [
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
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
            ] }, ((name || sku || status || condition) && {
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })), (sku && { sku })), (status && { status })), (condition && { condition })),
        })));
        res.status(200).json({
            data: products,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
});
exports.fetchVendorProducts = fetchVendorProducts;
const viewProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get productId from route params instead of query
    const { productId } = req.query;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId,
            },
            include: [
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
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        // Respond with the found product
        res.status(200).json({
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
exports.viewProduct = viewProduct;
const moveToDraft = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId } = req.query; // Get productId from request query
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Validate productId type
        if (typeof productId !== "string") {
            res.status(400).json({ message: "Invalid productId." });
            return;
        }
        // Find the product by either ID or SKU, ensuring it belongs to the authenticated vendor
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId,
            },
        });
        // If no product is found, return a 404 response
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        // Update the product's status to 'draft'
        product.status = "draft";
        yield product.save();
        // Remove the product from all carts
        yield cart_1.default.destroy({ where: { productId } });
        // Respond with the updated product
        res.status(200).json({
            message: "Product moved to draft.",
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({ message: "Failed to move product to draft." });
    }
});
exports.moveToDraft = moveToDraft;
const changeProductStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { productId, status } = req.body; // Get productId and status from request body
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    // Validate status
    if (!["active", "inactive", "draft"].includes(status)) {
        res.status(400).json({ message: "Invalid status." });
        return;
    }
    try {
        // Find the product by ID or SKU
        const product = yield product_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: productId }, { sku: productId }],
                vendorId,
            },
        });
        // Check if the product exists
        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }
        // Update the product status
        product.status = status;
        yield product.save();
        // Respond with the updated product details
        res.status(200).json({
            message: "Product status updated successfully.",
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({ message: "Failed to update product status." });
    }
});
exports.changeProductStatus = changeProductStatus;
// Auction Product
const createAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { storeId, categoryId, name, condition, description, specification, price, bidIncrement, maxBidsPerUser, participantsInterestFee, startDate, endDate, image, additionalImages, } = req.body;
    try {
        // Use the utility function to check the product limit
        const { status, message } = yield (0, helpers_1.checkVendorAuctionProductLimit)(vendorId);
        if (!status) {
            res.status(403).json({ message });
            return;
        }
        // Check if vendorId, storeId, and categoryId exist
        const vendorExists = yield user_1.default.findByPk(vendorId);
        const storeExists = yield store_1.default.findByPk(storeId);
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!vendorExists) {
            res
                .status(404)
                .json({ message: "Vendor not found." });
            return;
        }
        if (!storeExists) {
            res
                .status(404)
                .json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }
        // Fetch the KYC relationship
        const kyc = yield vendorExists.getKyc(); // Assuming a method exists to get the related KYC record
        // Determine if the account is verified based on KYC status
        const isVerified = kyc ? kyc.isVerified : false;
        // Check if vendor is verified
        if (!isVerified) {
            res.status(400).json({
                message: "Vendor must be verified to create an auction product.",
            });
            return;
        }
        // Generate a unique SKU
        let sku;
        let isUnique = false;
        while (!isUnique) {
            sku = `KDM-${(0, uuid_1.v4)()}`; // Generate a unique SKU
            const skuExists = yield product_1.default.findOne({ where: { sku } }); // Check if the SKU already exists
            isUnique = !skuExists; // Set to true if SKU is unique
        }
        // Create the auction product
        const auctionProduct = yield auctionproduct_1.default.create({
            vendorId,
            storeId,
            categoryId,
            name,
            sku,
            condition,
            description,
            specification,
            price,
            bidIncrement,
            maxBidsPerUser,
            participantsInterestFee,
            startDate,
            endDate,
            image,
            additionalImages,
        });
        res.status(201).json({
            message: "Auction product created successfully.",
            data: auctionProduct,
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({
            message: error.message ||
                "An error occurred while creating the auction product.",
        });
    }
});
exports.createAuctionProduct = createAuctionProduct;
const updateAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { auctionProductId, storeId, categoryId, name, condition, description, specification, price, bidIncrement, maxBidsPerUser, participantsInterestFee, startDate, endDate, image, additionalImages, } = req.body;
    try {
        // Use the utility function to check the product limit
        // const { status, message } = await checkVendorAuctionProductLimit(vendorId);
        // if (!status) {
        //     res.status(403).json({ message });
        //     return;
        // }
        // Find the auction product by ID
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId,
            },
        });
        if (!auctionProduct) {
            res.status(404).json({ message: "Auction product not found." });
            return;
        }
        // Check if the auction product is "upcoming" and has no bids
        if (auctionProduct.auctionStatus !== "upcoming") {
            res.status(400).json({
                message: "Auction product status must be 'upcoming' to update.",
            });
            return;
        }
        // Check if there are any bids placed for the auction product
        const bidExists = yield bid_1.default.findOne({ where: { auctionProductId } });
        if (bidExists) {
            res.status(400).json({
                message: "Auction product already has bids and cannot be updated.",
            });
            return;
        }
        // Check if vendorId matches the auction product's vendorId
        if (auctionProduct.vendorId !== vendorId) {
            res
                .status(403)
                .json({ message: "You can only update your own auction products." });
            return;
        }
        // Check if vendor, store, and category exist
        const vendorExists = yield user_1.default.findByPk(vendorId);
        const storeExists = yield store_1.default.findByPk(storeId);
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!vendorExists || !storeExists || !categoryExists) {
            res
                .status(404)
                .json({ message: "Vendor, Store, or Category not found." });
            return;
        }
        // Update the auction product
        auctionProduct.storeId = storeId || auctionProduct.storeId;
        auctionProduct.categoryId = categoryId || auctionProduct.categoryId;
        auctionProduct.name = name || auctionProduct.name;
        auctionProduct.condition = condition || auctionProduct.condition;
        auctionProduct.description = description || auctionProduct.description;
        auctionProduct.specification =
            specification || auctionProduct.specification;
        auctionProduct.price = price || auctionProduct.price;
        auctionProduct.bidIncrement = bidIncrement || auctionProduct.bidIncrement;
        auctionProduct.maxBidsPerUser =
            maxBidsPerUser || auctionProduct.maxBidsPerUser;
        auctionProduct.participantsInterestFee =
            participantsInterestFee || auctionProduct.participantsInterestFee;
        auctionProduct.startDate = startDate || auctionProduct.startDate;
        auctionProduct.endDate = endDate || auctionProduct.endDate;
        auctionProduct.image = image || auctionProduct.image;
        auctionProduct.additionalImages =
            additionalImages || auctionProduct.additionalImages;
        // Save the updated auction product
        yield auctionProduct.save();
        res.status(200).json({
            message: "Auction product updated successfully.",
            auctionProduct,
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({
            message: error.message ||
                "An error occurred while updating the auction product.",
        });
    }
});
exports.updateAuctionProduct = updateAuctionProduct;
const deleteAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { auctionProductId } = req.query;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Find the auction product by ID
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId,
            },
        });
        if (!auctionProduct) {
            res.status(404).json({ message: "Auction product not found." });
            return;
        }
        // Check if the auctionStatus is 'upcoming' and no bids exist
        if (auctionProduct.auctionStatus !== "upcoming") {
            res
                .status(400)
                .json({ message: "Only upcoming auction products can be deleted." });
            return;
        }
        const bidCount = yield bid_1.default.count({
            where: { auctionProductId },
        });
        if (bidCount > 0) {
            res.status(400).json({
                message: "Auction product already has bids, cannot be deleted.",
            });
            return;
        }
        const relatedTables = [
            { name: "bids", model: bid_1.default, field: "auctionProductId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: auctionProduct.id }
            });
            if (count > 0) {
                res.status(400).json({ message: `Cannot delete auction product because related records exist in ${table.name}` });
                return;
            }
        }
        // Delete the auction product
        yield auctionProduct.destroy();
        res.status(200).json({ message: "Auction product deleted successfully." });
    }
    catch (error) {
        if (error instanceof sequelize_1.ForeignKeyConstraintError) {
            res.status(400).json({
                message: "Cannot delete store because it has associated products. Delete or reassign products before deleting this store.",
            });
        }
        else {
            logger_1.default.error(error);
            res.status(500).json({
                message: error.message ||
                    "An error occurred while deleting the auction product.",
            });
        }
    }
});
exports.deleteAuctionProduct = deleteAuctionProduct;
const cancelAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { auctionProductId } = req.query;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Find the auction product by ID
        const auctionProduct = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId,
            },
        });
        if (!auctionProduct) {
            res.status(404).json({ message: "Auction product not found." });
            return;
        }
        // Check if the auctionStatus is 'upcoming' and no bids exist
        if (auctionProduct.auctionStatus !== "upcoming") {
            res
                .status(400)
                .json({ message: "Only upcoming auction products can be cancelled." });
            return;
        }
        // Check if vendorId matches the auction product's vendorId
        if (auctionProduct.vendorId !== vendorId) {
            res
                .status(403)
                .json({ message: "You can only cancel your own auction products." });
            return;
        }
        // Change the auction product auctionStatus to 'cancelled'
        auctionProduct.auctionStatus = "cancelled";
        yield auctionProduct.save();
        res.status(200).json({
            message: "Auction product has been cancelled successfully.",
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({
            message: error.message ||
                "An error occurred while cancelling the auction product.",
        });
    }
});
exports.cancelAuctionProduct = cancelAuctionProduct;
const fetchVendorAuctionProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { name, sku, status, condition, categoryName } = req.query;
    try {
        // Fetch all auction products for the vendor
        const auctionProducts = yield auctionproduct_1.default.findAll(Object.assign({ where: {
                vendorId,
            }, include: [
                {
                    model: subcategory_1.default,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
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
            ] }, ((name || sku || status || condition) && {
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })), (sku && { sku })), (status && { status })), (condition && { condition })),
        })));
        if (auctionProducts.length === 0) {
            res
                .status(404)
                .json({ message: "No auction products found for this vendor.", data: [] });
            return;
        }
        res.status(200).json({
            message: "Auction products fetched successfully.",
            data: auctionProducts,
        });
    }
    catch (error) {
        logger_1.default.error(error); // Log the error for debugging
        res.status(500).json({
            message: error.message || "An error occurred while fetching auction products.",
        });
    }
});
exports.fetchVendorAuctionProducts = fetchVendorAuctionProducts;
const viewAuctionProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Get auctionProductId from route params instead of query
    const { auctionProductId } = req.query;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        const product = yield auctionproduct_1.default.findOne({
            where: {
                [sequelize_1.Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId,
            },
            include: [
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
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!product) {
            res.status(404).json({ message: "Auction Product not found." });
            return;
        }
        // Respond with the found product
        res.status(200).json({
            data: product,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
});
exports.viewAuctionProduct = viewAuctionProduct;
const getAllBidsByAuctionProductId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { auctionProductId } = req.query; // Get auctionProductId from request params
        if (!auctionProductId) {
            res.status(400).json({ message: "Auction Product ID is required." });
            return;
        }
        // Fetch all bids for the given auctionProductId
        const bids = yield bid_1.default.findAll({
            where: { auctionProductId },
            include: [
                {
                    model: user_1.default,
                    as: "user",
                },
            ],
            order: [["createdAt", "DESC"]], // Order bids from newest to oldest
        });
        res.status(200).json({
            message: "Bids retrieved successfully.",
            data: bids,
        });
    }
    catch (error) {
        logger_1.default.error("Error retrieving bids:", error);
        res.status(500).json({
            message: error.message || "An error occurred while retrieving bids.",
        });
    }
});
exports.getAllBidsByAuctionProductId = getAllBidsByAuctionProductId;
// Subscription
const subscriptionPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { currencySymbol } = req.query; // Get currency symbol from query parameters
    try {
        // Build query options with optional currency symbol filter
        const queryOptions = {
            include: [
                Object.assign({ model: currency_1.default, as: "currency", attributes: ["id", "name", "symbol"] }, (currencySymbol && {
                    where: {
                        symbol: {
                            [sequelize_1.Op.like]: `%${currencySymbol}%`, // Allow partial match
                        },
                    },
                })),
            ],
        };
        // Fetch all subscription plans
        const subscriptionPlans = yield subscriptionplan_1.default.findAll(queryOptions);
        // Fetch the active subscription for the vendor
        const activeSubscription = yield vendorsubscription_1.default.findOne({
            where: {
                vendorId: vendorId,
                isActive: true,
            },
        });
        // Mark active plan in the list
        if (activeSubscription) {
            subscriptionPlans.forEach((plan) => {
                plan.setDataValue("isActiveForVendor", plan.id === activeSubscription.subscriptionPlanId);
            });
        }
        res.status(200).json({ data: subscriptionPlans });
    }
    catch (error) {
        logger_1.default.error("Error fetching subscription plans or active subscription:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching subscription plans",
        });
    }
});
exports.subscriptionPlans = subscriptionPlans;
const subscribe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { subscriptionPlanId, isWallet, refId } = req.body;
    if (!subscriptionPlanId) {
        res.status(400).json({ message: "Subscription plan ID is required." });
        return;
    }
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        // Step 1: Fetch Active Subscription
        const activeSubscription = yield vendorsubscription_1.default.findOne({
            where: { vendorId, isActive: true },
            transaction,
            lock: true, // Prevent concurrent modifications
        });
        const startDate = new Date();
        const endDate = new Date();
        // Step 2: Fetch New Subscription Plan
        const subscriptionPlan = yield subscriptionplan_1.default.findByPk(subscriptionPlanId, { transaction });
        if (!subscriptionPlan) {
            yield transaction.rollback();
            res.status(404).json({ message: "Subscription plan not found." });
            return;
        }
        // Step 3: Function to Handle Payment (Wallet or External)
        const handleTransaction = (amount) => __awaiter(void 0, void 0, void 0, function* () {
            if (isWallet) {
                const vendor = yield user_1.default.findByPk(vendorId, { transaction, lock: true });
                if (!vendor || vendor.wallet === undefined || vendor.wallet < amount) {
                    yield transaction.rollback();
                    res.status(400).json({ message: "Insufficient wallet balance." });
                    return false;
                }
                yield vendor.update({ wallet: vendor.wallet - amount }, { transaction });
            }
            else {
                const paymentGateway = yield paymentgateway_1.default.findOne({
                    where: { isActive: true, name: "paystack" },
                    transaction,
                });
                if (!paymentGateway) {
                    yield transaction.rollback();
                    res.status(400).json({ message: "No active payment gateway found." });
                    return false;
                }
                if (!refId) {
                    yield transaction.rollback();
                    res.status(400).json({ message: "Payment reference ID (refId) is required." });
                    return false;
                }
                const isPaymentValid = yield (0, helpers_1.verifyPayment)(refId, paymentGateway.secretKey);
                if (!isPaymentValid) {
                    yield transaction.rollback();
                    res.status(400).json({ message: "Invalid or unverified payment reference." });
                    return false;
                }
            }
            yield transaction_1.default.create({
                userId: vendorId,
                amount,
                transactionType: "subscription",
                status: "success",
                refId: isWallet ? null : refId,
            }, { transaction });
            return true;
        });
        // Step 4: Process Payment
        const transactionSuccess = yield handleTransaction(subscriptionPlan.price);
        if (!transactionSuccess)
            return;
        endDate.setMonth(startDate.getMonth() + subscriptionPlan.duration);
        // Step 5: If user already has an active plan, deactivate it
        if (activeSubscription) {
            yield activeSubscription.update({ isActive: false }, { transaction });
        }
        // Step 6: Create New Subscription
        const newSubscription = yield vendorsubscription_1.default.create({
            vendorId,
            subscriptionPlanId,
            startDate,
            endDate,
            isActive: true,
        }, { transaction });
        // Step 7: Send Notification
        yield notification_1.default.create({
            userId: vendorId,
            title: "Subscription",
            message: `You have successfully switched to the ${subscriptionPlan.name} plan.`,
            type: "subscription",
            isRead: false,
        }, { transaction });
        yield transaction.commit(); // Commit all changes
        res.status(200).json({
            message: "Switched to new subscription plan successfully",
            subscription: newSubscription,
        });
    }
    catch (error) {
        yield transaction.rollback(); // Rollback changes on error
        logger_1.default.error("Error subscribing vendor:", error);
        res.status(500).json({ message: "An error occurred while processing the subscription." });
    }
});
exports.subscribe = subscribe;
const subscribeDollar = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { subscriptionPlanId, isWallet, refId } = req.body;
    if (!subscriptionPlanId) {
        res.status(400).json({ message: "Subscription plan ID is required." });
        return;
    }
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        // Step 1: Fetch Active Subscription
        const activeSubscription = yield vendorsubscription_1.default.findOne({
            where: { vendorId, isActive: true },
            transaction,
            lock: true, // Prevent concurrent modifications
        });
        const startDate = new Date();
        const endDate = new Date();
        // Step 2: Fetch New Subscription Plan
        const subscriptionPlan = yield subscriptionplan_1.default.findByPk(subscriptionPlanId, { transaction });
        if (!subscriptionPlan) {
            yield transaction.rollback();
            res.status(404).json({ message: "Subscription plan not found." });
            return;
        }
        // Step 3: Function to Handle Payment (Wallet or External)
        const handleTransaction = (amount) => __awaiter(void 0, void 0, void 0, function* () {
            if (isWallet) {
                const vendor = yield user_1.default.findByPk(vendorId, { transaction, lock: true });
                if (!vendor || vendor.dollarWallet === undefined || vendor.dollarWallet < amount) {
                    yield transaction.rollback();
                    res.status(400).json({ message: "Insufficient wallet balance." });
                    return false;
                }
                yield vendor.update({ dollarWallet: vendor.dollarWallet - amount }, { transaction });
            }
            else {
                const paymentGateway = yield paymentgateway_1.default.findOne({
                    where: { isActive: true, name: "stripe" },
                    transaction,
                });
                if (!paymentGateway) {
                    yield transaction.rollback();
                    res.status(400).json({ message: "No active payment gateway found." });
                    return false;
                }
                if (!refId) {
                    yield transaction.rollback();
                    res.status(400).json({ message: "Payment reference ID (refId) is required." });
                    return false;
                }
            }
            yield transaction_1.default.create({
                userId: vendorId,
                amount,
                transactionType: "subscription",
                status: "success",
                refId: isWallet ? null : refId,
            }, { transaction });
            return true;
        });
        // Step 4: Process Payment
        const transactionSuccess = yield handleTransaction(subscriptionPlan.price);
        if (!transactionSuccess)
            return;
        endDate.setMonth(startDate.getMonth() + subscriptionPlan.duration);
        // Step 5: If user already has an active plan, deactivate it
        if (activeSubscription) {
            yield activeSubscription.update({ isActive: false }, { transaction });
        }
        // Step 6: Create New Subscription
        const newSubscription = yield vendorsubscription_1.default.create({
            vendorId,
            subscriptionPlanId,
            startDate,
            endDate,
            isActive: true,
        }, { transaction });
        // Step 7: Send Notification
        yield notification_1.default.create({
            userId: vendorId,
            title: "Subscription",
            message: `You have successfully switched to the ${subscriptionPlan.name} plan.`,
            type: "subscription",
            isRead: false,
        }, { transaction });
        yield transaction.commit(); // Commit all changes
        res.status(200).json({
            message: "Switched to new subscription plan successfully",
            subscription: newSubscription,
        });
    }
    catch (error) {
        yield transaction.rollback(); // Rollback changes on error
        logger_1.default.error("Error subscribing vendor:", error);
        res.status(500).json({ message: "An error occurred while processing the subscription." });
    }
});
exports.subscribeDollar = subscribeDollar;
const verifyCAC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businessName = 'GREEN MOUSE TECHNOLOGIES ENTERPRISES';
    const registrationNumber = 'BN 2182096';
    const data = JSON.stringify({
        bank_code: '011',
        country_code: 'NG',
        account_number: '3060096527',
        account_name: 'Ezema Promise',
        account_type: 'personal',
        document_type: 'businessRegistrationNumber',
        document_number: registrationNumber,
    });
    const options = {
        hostname: 'api.paystack.co',
        port: 443,
        path: '/bank/validate',
        method: 'POST',
        headers: {
            Authorization: 'Bearer sk_test_fde1e5319c69aa49534344c95485a8f1cef333ac', // Replace with your Paystack secret key
            'Content-Type': 'application/json',
        },
    };
    try {
        const request = https_1.default.request(options, (response) => {
            let responseData = '';
            // Collect response data
            response.on('data', (chunk) => {
                responseData += chunk;
            });
            // Process complete response
            response.on('end', () => {
                if (!responseData) {
                    logger_1.default.error('No response data received.');
                    res.status(500).json({ message: 'No response data received from API.' });
                    return;
                }
                try {
                    const parsedData = JSON.parse(responseData);
                    if (parsedData.status === true) {
                        logger_1.default.log('Vendor verified successfully!', parsedData);
                        res.status(200).json({
                            message: 'Vendor verified successfully!',
                            data: parsedData,
                        });
                    }
                    else {
                        logger_1.default.log('Verification failed:', parsedData.message);
                        res.status(400).json({
                            message: 'Verification failed',
                            error: parsedData.message,
                        });
                    }
                }
                catch (parseError) {
                    logger_1.default.error('Error parsing response:', parseError);
                    res.status(500).json({
                        message: 'Error parsing API response',
                        error: parseError.message,
                    });
                }
            });
        });
        // Handle request errors
        request.on('error', (error) => {
            logger_1.default.error('Error verifying CAC:', error);
            res.status(500).json({ message: 'Request error', error: error.message });
        });
        // Write the data to the request body and send it
        request.write(data);
        request.end();
    }
    catch (error) {
        logger_1.default.error('Unexpected error:', error);
        res.status(500).json({ message: 'Unexpected error', error: error });
    }
});
exports.verifyCAC = verifyCAC;
const getAllCurrencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currencies = yield currency_1.default.findAll();
        res.status(200).json({ data: currencies });
    }
    catch (error) {
        logger_1.default.error('Error fetching currencies:', error);
        res.status(500).json({ message: 'Failed to fetch currencies' });
    }
});
exports.getAllCurrencies = getAllCurrencies;
const getAllSubCategories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.query;
    try {
        // Query with name filter if provided
        const whereClause = name ? { name: { [sequelize_1.Op.like]: `%${name}%` } } : {};
        const subCategories = yield subcategory_1.default.findAll({ where: whereClause });
        res.status(200).json({ data: subCategories });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Error fetching sub-categories" });
    }
});
exports.getAllSubCategories = getAllSubCategories;
const getVendorOrderItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    if (!vendorId) {
        res.status(403).json({ message: "Unauthorized. Vendor ID is required." });
        return;
    }
    try {
        // Fetch OrderItems related to the vendor
        const orderItems = yield orderitem_1.default.findAll({
            where: { vendorId },
            include: [
                {
                    model: order_1.default,
                    as: "order",
                    include: [
                        {
                            model: user_1.default,
                            as: "user",
                            attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Include user details
                        },
                    ]
                }
            ],
            order: [["createdAt", "DESC"]], // Sort by most recent
        });
        if (!orderItems || orderItems.length === 0) {
            res.status(404).json({ message: "No order items found for this vendor." });
            return;
        }
        res.status(200).json({
            message: "Order items retrieved successfully",
            data: orderItems,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Failed to retrieve order items." });
    }
});
exports.getVendorOrderItems = getVendorOrderItems;
const getOrderItemsInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const orderId = req.query.orderId;
    try {
        // Fetch Order related to the vendor
        const order = yield order_1.default.findOne({
            where: { id: orderId },
            include: [
                {
                    model: user_1.default,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email", "phoneNumber"], // Include user details
                },
            ],
            order: [["createdAt", "DESC"]], // Sort by most recent
        });
        res.status(200).json({
            message: "Order details retrieved successfully",
            data: order,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || "Failed to retrieve order details." });
    }
});
exports.getOrderItemsInfo = getOrderItemsInfo;
// Adverts
const activeProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { name } = req.query;
    try {
        const products = yield product_1.default.findAll(Object.assign({ where: { vendorId, status: "active" } }, ((name) && {
            where: Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })),
        })));
        res.status(200).json({
            data: products,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch active products" });
    }
});
exports.activeProducts = activeProducts;
const createAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { categoryId, productId, title, description, media_url, showOnHomepage, link } = req.body;
    try {
        // Use the utility function to check the product limit
        const { status, message } = yield (0, helpers_1.checkAdvertLimit)(vendorId);
        if (!status) {
            res.status(403).json({ message });
            return;
        }
        // Check if categoryId and productId exist
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }
        if (productId) {
            const productExists = yield product_1.default.findByPk(productId);
            if (!productExists) {
                res
                    .status(404)
                    .json({ message: "Product not found." });
                return;
            }
        }
        const newAdvert = yield advert_1.default.create({
            userId: vendorId,
            categoryId,
            productId,
            title,
            description,
            media_url,
            showOnHomepage,
            link
        });
        res.status(201).json({
            message: "Advert created successfully",
            data: newAdvert,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to create advert" });
    }
});
exports.createAdvert = createAdvert;
const updateAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { advertId, categoryId, productId, title, description, media_url, showOnHomepage, link } = req.body;
    try {
        // Check if categoryId and productId exist
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }
        if (productId) {
            const productExists = yield product_1.default.findByPk(productId);
            if (!productExists) {
                res
                    .status(404)
                    .json({ message: "Product not found." });
                return;
            }
        }
        const advert = yield advert_1.default.findByPk(advertId);
        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }
        advert.categoryId = categoryId || advert.categoryId;
        advert.productId = productId || advert.productId;
        advert.title = title || advert.title;
        advert.description = description || advert.description;
        advert.media_url = media_url || advert.media_url;
        advert.showOnHomepage = showOnHomepage || advert.showOnHomepage;
        advert.link = link || advert.link;
        yield advert.save();
        res.status(200).json({
            message: "Advert updated successfully",
            data: advert,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to update advert" });
    }
});
exports.updateAdvert = updateAdvert;
const getAdverts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { search, page = 1, limit = 10 } = req.query;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page, 10) || 1;
    const limitNumber = parseInt(limit, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;
    try {
        // Build the where condition for the search query (using Op.or for title and status)
        const whereConditions = { userId: vendorId };
        if (search) {
            whereConditions[sequelize_1.Op.or] = [
                { title: { [sequelize_1.Op.like]: `%${search}%` } },
                { status: { [sequelize_1.Op.like]: `%${search}%` } },
            ];
        }
        // Fetch adverts with pagination, filters, and associated data
        const { count, rows: adverts } = yield advert_1.default.findAndCountAll({
            where: whereConditions,
            include: [
                { model: product_1.default, as: "product", attributes: ['id', 'name'] },
                { model: subcategory_1.default, as: "sub_category" },
            ],
            limit: limitNumber,
            offset,
            order: [["createdAt", "DESC"]], // Order by latest adverts
        });
        // Handle case where no adverts are found
        if (!adverts || adverts.length === 0) {
            res.status(404).json({
                message: "No adverts found",
                data: [],
                pagination: {
                    total: 0,
                    page: pageNumber,
                    pages: 0,
                },
            });
            return;
        }
        // Calculate total pages
        const totalPages = Math.ceil(count / limitNumber);
        // Return paginated results
        res.status(200).json({
            message: "Adverts fetched successfully",
            data: adverts,
            pagination: {
                total: count, // Total number of adverts
                page: pageNumber,
                pages: totalPages,
                limit: limitNumber,
            },
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching adverts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getAdverts = getAdverts;
const viewAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const advertId = req.query.advertId;
    try {
        const advert = yield advert_1.default.findByPk(advertId, {
            include: [
                { model: product_1.default, as: "product" },
                { model: subcategory_1.default, as: "sub_category" },
            ],
        });
        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }
        res.status(200).json({
            message: "Advert fetched successfully",
            data: advert,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch advert" });
    }
});
exports.viewAdvert = viewAdvert;
const deleteAdvert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const advertId = req.query.advertId;
    try {
        const advert = yield advert_1.default.findByPk(advertId);
        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }
        yield advert.destroy();
        res.status(200).json({
            message: "Advert deleted successfully",
        });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to delete advert" });
    }
});
exports.deleteAdvert = deleteAdvert;
/**
 * Add a new bank account for a vendor
 */
const addBankInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { bankInfo } = req.body; // bankInfo contains bankName, accountNumber, accountName
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Ensure required fields are provided
        if (!bankInfo) {
            res.status(400).json({ message: "Field is required" });
            return;
        }
        // Check if bank details already exist for this vendor
        // const existingBank = await BankInformation.findOne({ where: { vendorId, accountNumber: bankInfo.accountNumber } });
        // if (existingBank) {
        //     res.status(400).json({ message: "Bank details already exist" });
        //     return;
        // }
        // Check if vendorId exists in the User table (Vendor)
        const vendor = yield user_1.default.findByPk(vendorId);
        if (!vendor) {
            res.status(404).json({ message: "Owner not found" });
            return;
        }
        // If it's a vendor, ensure they are verified
        if (vendor && !vendor.isVerified) {
            res.status(400).json({
                message: "Cannot add bank information. You are not verified.",
            });
            return;
        }
        // Create bank information entry
        const bankData = yield bankinformation_1.default.create({
            vendorId,
            bankInfo
        });
        res.status(200).json({ message: "Bank information added successfully", data: bankData });
    }
    catch (error) {
        logger_1.default.error("Error adding bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.addBankInformation = addBankInformation;
/**
 * Update bank account details for a vendor
 */
const updateBankInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bankId, bankInfo } = req.body;
    try {
        // Find the bank record
        const bankData = yield bankinformation_1.default.findOne({ where: { id: bankId } });
        if (!bankData) {
            res.status(404).json({ message: "Bank information not found" });
            return;
        }
        // Update bank details
        yield bankData.update({
            bankInfo
        });
        res.status(200).json({ message: "Bank information updated successfully", data: bankData });
    }
    catch (error) {
        logger_1.default.error("Error updating bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateBankInformation = updateBankInformation;
/**
 * Get bank information for a specific vendor or all vendors
 */
const getBankInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        let bankData;
        // Fetch bank details for a specific vendor
        bankData = yield bankinformation_1.default.findAll({ where: { vendorId } });
        if (!bankData.length) {
            res.status(404).json({ message: "No bank information found for this vendor" });
            return;
        }
        res.status(200).json({ message: "Bank information retrieved successfully", data: bankData });
    }
    catch (error) {
        logger_1.default.error("Error fetching bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getBankInformation = getBankInformation;
/**
 * Get a single bank information record for a specific vendor
 */
const getSingleBankInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bankId = req.query.bankId; // bankId is required
    try {
        // Fetch bank details
        const bankInfo = yield bankinformation_1.default.findOne({ where: { id: bankId } });
        if (!bankInfo) {
            res.status(404).json({ message: "Bank information not found" });
            return;
        }
        res.status(200).json({ message: "Bank information retrieved successfully", data: bankInfo });
    }
    catch (error) {
        logger_1.default.error("Error fetching bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.getSingleBankInformation = getSingleBankInformation;
/**
 * Delete bank account details for a vendor
 */
const deleteBankInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bankId = req.query.bankId; // bankId is required
    try {
        // Find the bank record
        const bankData = yield bankinformation_1.default.findOne({ where: { id: bankId } });
        if (!bankData) {
            res.status(404).json({ message: "Bank information not found" });
            return;
        }
        // Delete the bank record
        yield bankData.destroy();
        res.status(200).json({ message: "Bank information deleted successfully" });
    }
    catch (error) {
        logger_1.default.error("Error deleting bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.deleteBankInformation = deleteBankInformation;
// Request Withdrawal
const requestWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        const vendor = yield user_1.default.findByPk(vendorId, { transaction });
        if (!vendor || vendor.dollarWallet === undefined || vendor.wallet === undefined) {
            yield transaction.rollback();
            res.status(404).json({ message: "Vendor not found or wallet not initialized" });
            return;
        }
        const { bankInformationId, amount, currency } = req.body;
        const bankInformation = yield bankinformation_1.default.findOne({
            where: { id: bankInformationId, vendorId },
            transaction,
        });
        if (!bankInformation) {
            yield transaction.rollback();
            res.status(404).json({ message: "Bank information not found" });
            return;
        }
        // Validate sufficient funds
        if (currency === "USD" && ((_b = vendor.dollarWallet) !== null && _b !== void 0 ? _b : 0) < amount) {
            yield transaction.rollback();
            res.status(400).json({ message: "Insufficient USD balance" });
            return;
        }
        if (currency !== "USD" && ((_c = vendor.wallet) !== null && _c !== void 0 ? _c : 0) < amount) {
            yield transaction.rollback();
            res.status(400).json({ message: "Insufficient local currency balance" });
            return;
        }
        // Deduct balance from wallet
        if (currency === "USD") {
            vendor.dollarWallet = ((_d = vendor.dollarWallet) !== null && _d !== void 0 ? _d : 0) - amount;
        }
        else {
            vendor.wallet = ((_e = vendor.wallet) !== null && _e !== void 0 ? _e : 0) - amount;
        }
        yield vendor.save({ transaction });
        // Create withdrawal request
        const withdrawal = yield withdrawal_1.default.create({
            vendorId,
            bankInformation, // Store only the ID instead of full object
            amount,
            currency,
            status: "pending", // Set default status
        }, { transaction });
        // Vendor Notification
        yield notification_1.default.create({
            userId: vendorId,
            title: "Withdrawal Request Submitted",
            type: "withdrawal_request",
            message: `Your withdrawal request of ${currency} ${amount} is under review.`,
        }, { transaction });
        // Find superadmin users
        const adminUsers = yield admin_1.default.findAll({
            include: [
                {
                    model: role_1.default,
                    as: "role",
                    where: { name: "superadmin" },
                    attributes: [],
                },
            ],
            transaction,
        });
        // Notify Admins
        for (const admin of adminUsers) {
            yield notification_1.default.create({
                userId: admin.id,
                title: "New Withdrawal Request",
                type: "withdrawal_request",
                message: `Vendor ${vendor.firstName} ${vendor.lastName} requested a withdrawal of ${currency} ${amount}.`,
            }, { transaction });
        }
        yield transaction.commit(); // Commit transaction
        res.status(200).json({ message: "Withdrawal request submitted", withdrawal });
    }
    catch (error) {
        yield transaction.rollback(); // Rollback changes on error
        logger_1.default.error("Error processing withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.requestWithdrawal = requestWithdrawal;
const getWithdrawals = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const { status } = req.query; // Optional filter by status
        const whereClause = { vendorId };
        if (status) {
            whereClause.status = status;
        }
        const withdrawals = yield withdrawal_1.default.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]], // Latest withdrawals first
        });
        res.status(200).json({ message: "Withdrawals fetched successfully", data: withdrawals });
    }
    catch (error) {
        logger_1.default.error("Error fetching withdrawals:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWithdrawals = getWithdrawals;
const updateWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        const { withdrawalId, bankInformationId } = req.body;
        const withdrawal = yield withdrawal_1.default.findByPk(withdrawalId, { transaction });
        if (!withdrawal) {
            yield transaction.rollback();
            res.status(404).json({ message: "Withdrawal request not found" });
            return;
        }
        const bankInformation = yield bankinformation_1.default.findOne({
            where: { id: bankInformationId, vendorId },
            transaction,
        });
        if (!bankInformation) {
            yield transaction.rollback();
            res.status(404).json({ message: "Bank information not found" });
            return;
        }
        if (withdrawal.status !== "rejected") {
            yield transaction.rollback();
            res.status(400).json({ message: "Only rejected withdrawals can be updated" });
            return;
        }
        // Find vendor
        const vendor = yield user_1.default.findByPk(vendorId, { transaction });
        if (!vendor) {
            yield transaction.rollback();
            res.status(404).json({ message: "Vendor not found" });
            return;
        }
        // Deduct withdrawal amount from the vendor's wallet
        const withdrawalAmount = Number(withdrawal.amount); // Ensure it's a number
        if (withdrawal.currency === "USD") {
            if ((Number((_b = vendor.dollarWallet) !== null && _b !== void 0 ? _b : 0)) < withdrawalAmount) {
                yield transaction.rollback();
                res.status(400).json({ message: "Insufficient funds in dollar wallet." });
                return;
            }
            vendor.dollarWallet = (Number((_c = vendor.dollarWallet) !== null && _c !== void 0 ? _c : 0)) - withdrawalAmount;
        }
        else {
            if ((Number((_d = vendor.wallet) !== null && _d !== void 0 ? _d : 0)) < withdrawalAmount) {
                yield transaction.rollback();
                res.status(400).json({ message: "Insufficient funds in wallet." });
                return;
            }
            vendor.wallet = (Number((_e = vendor.wallet) !== null && _e !== void 0 ? _e : 0)) - withdrawalAmount;
        }
        yield vendor.save({ transaction });
        // Update withdrawal
        withdrawal.bankInformation = bankInformation;
        withdrawal.status = "pending"; // Reset status to pending for re-evaluation
        yield withdrawal.save({ transaction });
        // Vendor Notification
        yield notification_1.default.create({
            userId: vendorId,
            title: "Withdrawal Request Updated",
            type: "withdrawal_update",
            message: `Your withdrawal request has been updated and is under review again.`,
        }, { transaction });
        // Find superadmin users
        const adminUsers = yield admin_1.default.findAll({
            include: [
                {
                    model: role_1.default,
                    as: "role",
                    where: { name: "superadmin" },
                    attributes: [],
                },
            ],
            transaction,
        });
        // Notify Admins
        for (const admin of adminUsers) {
            yield notification_1.default.create({
                userId: admin.id,
                title: "Updated Withdrawal Request",
                type: "withdrawal_update",
                message: `Vendor ${vendorId} has updated a previously rejected withdrawal request.`,
            }, { transaction });
        }
        yield transaction.commit(); // Commit transaction
        res.status(200).json({ message: `Withdrawal successfully updated.`, data: withdrawal });
    }
    catch (error) {
        yield transaction.rollback(); // Rollback changes on error
        logger_1.default.error("Error updating withdrawal status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateWithdrawal = updateWithdrawal;
const getWithdrawalById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.query.id;
        // Find withdrawal with associated BankInformation and Vendor details
        const withdrawal = yield withdrawal_1.default.findByPk(id);
        if (!withdrawal) {
            res.status(404).json({ message: "Withdrawal not found" });
            return;
        }
        res.status(200).json({ message: "Withdrawal retrieved successfully", data: withdrawal });
    }
    catch (error) {
        logger_1.default.error("Error retrieving withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWithdrawalById = getWithdrawalById;
//# sourceMappingURL=vendorController.js.map