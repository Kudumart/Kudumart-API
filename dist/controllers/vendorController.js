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
exports.cancelSubscription = exports.getWithdrawalById = exports.updateWithdrawal = exports.getWithdrawals = exports.requestWithdrawal = exports.getVendorTransactions = exports.getVendorWalletStats = exports.deleteBankInformation = exports.getSingleBankInformation = exports.getBankInformation = exports.updateBankInformationV2 = exports.updateBankInformation = exports.addBankInformationV2 = exports.addBankInformation = exports.deleteAdvert = exports.viewAdvert = exports.getAdverts = exports.updateAdvert = exports.createAdvert = exports.activeProducts = exports.getOrderItemsInfo = exports.getVendorOrderItems = exports.getAllSubCategories = exports.getAllCurrencies = exports.verifyCAC = exports.subscribeDollar = exports.subscribe = exports.subscriptionPlans = exports.getAllBidsByAuctionProductId = exports.viewAuctionProduct = exports.fetchVendorAuctionProducts = exports.cancelAuctionProduct = exports.deleteAuctionProduct = exports.updateAuctionProduct = exports.createAuctionProduct = exports.changeProductStatus = exports.moveToDraft = exports.generateAIProduct = exports.viewProduct = exports.fetchVendorProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.deleteStore = exports.updateStore = exports.createStore = exports.viewStore = exports.getStore = exports.getKYC = exports.submitOrUpdateKYC = void 0;
exports.respondToVendorOffer = exports.getVendorOffers = exports.markServiceBookingAsCancelled = exports.markServiceBookingAsConfirmed = exports.getServiceBookings = exports.unpublishService = exports.publishService = exports.deleteService = exports.getVendorServices = exports.getService = exports.updateService = exports.createService = void 0;
// src/controllers/vendorController.ts
const decimal_js_1 = __importDefault(require("decimal.js"));
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
const blockedvendor_1 = __importDefault(require("../models/blockedvendor"));
const serviceCategories_1 = __importDefault(require("../models/serviceCategories"));
const serviceSubCategories_1 = __importDefault(require("../models/serviceSubCategories"));
const attributeDefinitions_1 = __importDefault(require("../models/attributeDefinitions"));
const services_1 = __importDefault(require("../models/services"));
const sequelize_2 = __importDefault(require("../config/sequelize"));
const serviceAttributeOptionValues_1 = __importDefault(require("../models/serviceAttributeOptionValues"));
const serviceAttributeTextValues_1 = __importDefault(require("../models/serviceAttributeTextValues"));
const serviceAttributeNumberValues_1 = __importDefault(require("../models/serviceAttributeNumberValues"));
const serviceAttributeBoolValues_1 = __importDefault(require("../models/serviceAttributeBoolValues"));
const attributeOptions_1 = __importDefault(require("../models/attributeOptions"));
const servicebookings_1 = __importDefault(require("../models/servicebookings"));
const productoffer_1 = __importDefault(require("../models/productoffer"));
const pushNotification_1 = require("../firebase/pushNotification");
const index_1 = require("../types/index");
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
            // Admin notification removed to prevent crashes
            res
                .status(200)
                .json({ message: "KYC updated successfully", data: existingKYC });
            return;
        }
        else {
            // Create a new KYC record
            const newKYC = yield kyc_1.default.create(Object.assign(Object.assign({ vendorId }, kycData), { isVerified: true }));
            // Admin notification removed to prevent crashes
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
    var _a, _b;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const requestedVendorId = req.query.vendorId || vendorId;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    // Block check: if user is not the vendor, check if user has blocked this vendor
    if (userId && requestedVendorId && userId !== requestedVendorId) {
        const blocked = yield blockedvendor_1.default.findOne({
            where: { userId, vendorId: requestedVendorId },
        });
        if (blocked) {
            res.status(403).json({ message: "You have blocked this vendor." });
            return;
        }
    }
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
            res
                .status(404)
                .json({ message: "No stores found for this vendor.", data: [] });
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
    var _a, _b;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const storeId = req.query.storeId;
    const userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
    // Find the store to get the vendorId
    const store = yield store_1.default.findOne({ where: { id: storeId } });
    if (store && userId && store.vendorId && userId !== store.vendorId) {
        const blocked = yield blockedvendor_1.default.findOne({
            where: { userId, vendorId: store.vendorId },
        });
        if (blocked) {
            res.status(403).json({ message: "You have blocked this vendor." });
            return;
        }
    }
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
            ],
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
    const { currencyId, name, location, logo, businessHours, deliveryOptions, tipsOnFinding, } = req.body;
    if (!currencyId) {
        res.status(400).json({ message: "Currency ID is required." });
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
            res.status(404).json({ message: "Currency not found" });
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
    const { storeId, currencyId, name, location, businessHours, deliveryOptions, tipsOnFinding, logo, } = req.body;
    try {
        const store = yield store_1.default.findOne({ where: { id: storeId } });
        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }
        // Find the currency by ID
        const currency = yield currency_1.default.findByPk(currencyId);
        if (!currency) {
            res.status(404).json({ message: "Currency not found" });
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
            logo,
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
            { name: "products", model: product_1.default, field: "storeId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: store.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete store because related records exist in ${table.name}`,
                });
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
            res.status(404).json({ message: "Vendor not found." });
            return;
        }
        if (!storeExists) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res.status(404).json({ message: "Category not found." });
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
            { name: "carts", model: cart_1.default, field: "productId" },
        ];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: product.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete product because related records exist in ${table.name}`,
                });
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
                    attributes: ["name"],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
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
                            attributes: ["symbol"],
                        },
                    ],
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
const generateAIProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { imageBase64, mimeType } = req.body;
    if (!imageBase64) {
        res.status(400).json({ message: "Image data is required." });
        return;
    }
    const prompt = `You are a product listing expert. Analyze this product image and extract all relevant details to create a complete product listing.

Return ONLY a valid JSON object (no markdown, no explanation) with these exact fields:
{
  "name": "product name (clear, specific, 5-10 words)",
  "description": "detailed product description (2-3 paragraphs, mention key features, uses, benefits)",
  "specification": "technical specifications (materials, dimensions, colors, weight, etc.)",
  "condition": "brand_new OR fairly_used OR refurbished",
  "price": "suggested price in numbers only (e.g. 15000)",
  "discount_price": "0",
  "quantity": "1",
  "warranty": "warranty information (e.g. 1 year manufacturer warranty)",
  "return_policy": "return policy (e.g. 7 days return policy)",
  "category_suggestion": "suggested product category (Electronics, Clothing, Furniture, Vehicles, Real Estate, etc.)",
  "sku": "suggested SKU code (e.g. PRD-001)"
}`;
    try {
        const response = yield fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType || "image/jpeg"};base64,${imageBase64}`,
                                    detail: "high",
                                },
                            },
                            { type: "text", text: prompt },
                        ],
                    },
                ],
                max_tokens: 1000,
                temperature: 0.3,
            }),
        });
        if (!response.ok) {
            const err = yield response.json();
            throw new Error(((_b = err.error) === null || _b === void 0 ? void 0 : _b.message) || "OpenAI API error");
        }
        const result = yield response.json();
        const content = (_e = (_d = (_c = result.choices) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content;
        // Parse JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch)
            throw new Error("Could not parse AI response");
        const parsed = JSON.parse(jsonMatch[0]);
        res.status(200).json({ data: parsed });
    }
    catch (error) {
        logger_1.default.error("Error generating AI product:", error);
        res.status(500).json({ message: error.message || "Failed to analyze image." });
    }
});
exports.generateAIProduct = generateAIProduct;
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
    const { storeId, categoryId, name, condition, description, specification, price, bidIncrement, maxBidsPerUser, participantsInterestFee, startDate, endDate, image, video, additionalImages, } = req.body;
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
            res.status(404).json({ message: "Vendor not found." });
            return;
        }
        if (!storeExists) {
            res.status(404).json({ message: "Store not found." });
            return;
        }
        if (!categoryExists) {
            res.status(404).json({ message: "Category not found." });
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
            video,
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
    const { auctionProductId, storeId, categoryId, name, condition, description, specification, price, bidIncrement, maxBidsPerUser, participantsInterestFee, startDate, endDate, image, video, additionalImages, } = req.body;
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
        auctionProduct.video = video || auctionProduct.video;
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
        const relatedTables = [{ name: "bids", model: bid_1.default, field: "auctionProductId" }];
        // Check each related table
        for (const table of relatedTables) {
            const count = yield table.model.count({
                where: { [table.field]: auctionProduct.id },
            });
            if (count > 0) {
                res.status(400).json({
                    message: `Cannot delete auction product because related records exist in ${table.name}`,
                });
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
                    attributes: ["name"],
                    include: [
                        {
                            model: currency_1.default,
                            as: "currency",
                            attributes: ["symbol"],
                        },
                    ],
                },
            ] }, ((name || sku || status || condition) && {
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (name && { name: { [sequelize_1.Op.like]: `%${name}%` } })), (sku && { sku })), (status && { status })), (condition && { condition })),
        })));
        if (auctionProducts.length === 0) {
            res.status(200).json({
                message: "No auction products found for this vendor.",
                data: [],
            });
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
                            attributes: ["symbol"],
                        },
                    ],
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
                const vendor = yield user_1.default.findByPk(vendorId, {
                    transaction,
                    lock: true,
                });
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
                    res
                        .status(400)
                        .json({ message: "Payment reference ID (refId) is required." });
                    return false;
                }
                const isPaymentValid = yield (0, helpers_1.verifyPayment)(refId, paymentGateway.secretKey);
                if (!isPaymentValid) {
                    yield transaction.rollback();
                    res
                        .status(400)
                        .json({ message: "Invalid or unverified payment reference." });
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
        res.status(500).json({
            message: "An error occurred while processing the subscription.",
        });
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
                const vendor = yield user_1.default.findByPk(vendorId, {
                    transaction,
                    lock: true,
                });
                if (!vendor ||
                    vendor.dollarWallet === undefined ||
                    vendor.dollarWallet < amount) {
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
                    res
                        .status(400)
                        .json({ message: "Payment reference ID (refId) is required." });
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
        res.status(500).json({
            message: "An error occurred while processing the subscription.",
        });
    }
});
exports.subscribeDollar = subscribeDollar;
const verifyCAC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const businessName = "GREEN MOUSE TECHNOLOGIES ENTERPRISES";
    const registrationNumber = "BN 2182096";
    const data = JSON.stringify({
        bank_code: "011",
        country_code: "NG",
        account_number: "3060096527",
        account_name: "Ezema Promise",
        account_type: "personal",
        document_type: "businessRegistrationNumber",
        document_number: registrationNumber,
    });
    const options = {
        hostname: "api.paystack.co",
        port: 443,
        path: "/bank/validate",
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Use Paystack secret key from environment
            "Content-Type": "application/json",
        },
    };
    try {
        const request = https_1.default.request(options, (response) => {
            let responseData = "";
            // Collect response data
            response.on("data", (chunk) => {
                responseData += chunk;
            });
            // Process complete response
            response.on("end", () => {
                if (!responseData) {
                    logger_1.default.error("No response data received.");
                    res
                        .status(500)
                        .json({ message: "No response data received from API." });
                    return;
                }
                try {
                    const parsedData = JSON.parse(responseData);
                    if (parsedData.status === true) {
                        logger_1.default.log("Vendor verified successfully!", parsedData);
                        res.status(200).json({
                            message: "Vendor verified successfully!",
                            data: parsedData,
                        });
                    }
                    else {
                        logger_1.default.log("Verification failed:", parsedData.message);
                        res.status(400).json({
                            message: "Verification failed",
                            error: parsedData.message,
                        });
                    }
                }
                catch (parseError) {
                    logger_1.default.error("Error parsing response:", parseError);
                    res.status(500).json({
                        message: "Error parsing API response",
                        error: parseError.message,
                    });
                }
            });
        });
        // Handle request errors
        request.on("error", (error) => {
            logger_1.default.error("Error verifying CAC:", error);
            res.status(500).json({ message: "Request error", error: error.message });
        });
        // Write the data to the request body and send it
        request.write(data);
        request.end();
    }
    catch (error) {
        logger_1.default.error("Unexpected error:", error);
        res.status(500).json({ message: "Unexpected error", error: error });
    }
});
exports.verifyCAC = verifyCAC;
const getAllCurrencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currencies = yield currency_1.default.findAll();
        res.status(200).json({ data: currencies });
    }
    catch (error) {
        logger_1.default.error("Error fetching currencies:", error);
        res.status(500).json({ message: "Failed to fetch currencies" });
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
                            attributes: [
                                "id",
                                "firstName",
                                "lastName",
                                "email",
                                "phoneNumber",
                            ], // Include user details
                        },
                    ],
                },
            ],
            order: [["createdAt", "DESC"]], // Sort by most recent
        });
        if (!orderItems || orderItems.length === 0) {
            res
                .status(404)
                .json({ message: "No order items found for this vendor." });
            return;
        }
        res.status(200).json({
            message: "Order items retrieved successfully",
            data: orderItems,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ message: error.message || "Failed to retrieve order items." });
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
        res
            .status(500)
            .json({ message: error.message || "Failed to retrieve order details." });
    }
});
exports.getOrderItemsInfo = getOrderItemsInfo;
// Adverts
const activeProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { name } = req.query;
    try {
        const products = yield product_1.default.findAll(Object.assign({ where: { vendorId, status: "active" } }, (name && {
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
    const { categoryId, productId, title, description, media_url, showOnHomepage, link, } = req.body;
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
            res.status(404).json({ message: "Category not found." });
            return;
        }
        if (productId) {
            const productExists = yield product_1.default.findByPk(productId);
            if (!productExists) {
                res.status(404).json({ message: "Product not found." });
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
            link,
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
    const { advertId, categoryId, productId, title, description, media_url, showOnHomepage, link, } = req.body;
    try {
        // Check if categoryId and productId exist
        const categoryExists = yield subcategory_1.default.findByPk(categoryId);
        if (!categoryExists) {
            res.status(404).json({ message: "Category not found." });
            return;
        }
        if (productId) {
            const productExists = yield product_1.default.findByPk(productId);
            if (!productExists) {
                res.status(404).json({ message: "Product not found." });
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
                { model: product_1.default, as: "product", attributes: ["id", "name"] },
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
            bankInfo,
        });
        res
            .status(200)
            .json({ message: "Bank information added successfully", data: bankData });
    }
    catch (error) {
        logger_1.default.error("Error adding bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.addBankInformation = addBankInformation;
const addBankInformationV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { bankName, accountNumber, accountHolderName, swiftCode, routingNumber, bankAddress, } = req.body; // bankInfo contains bankName, accountNumber, accountName
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    try {
        // Ensure required fields are provided
        if (!bankName || !accountNumber || !accountHolderName) {
            res.status(400).json({ message: "All bank details are required" });
            return;
        }
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
        const bankData = yield bankinformation_1.default.create(Object.assign(Object.assign(Object.assign({ vendorId,
            bankName,
            accountNumber,
            accountHolderName }, (swiftCode && { swiftCode })), (routingNumber && { routingNumber })), (bankAddress && { bankAddress })));
        res
            .status(200)
            .json({ message: "Bank information added successfully", data: bankData });
    }
    catch (error) {
        logger_1.default.error("Error adding bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.addBankInformationV2 = addBankInformationV2;
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
            bankInfo,
        });
        res.status(200).json({
            message: "Bank information updated successfully",
            data: bankData,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateBankInformation = updateBankInformation;
const updateBankInformationV2 = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bankId, bankName, accountNumber, accountHolderName, swiftCode, routingNumber, bankAddress, } = req.body;
    if (!bankId) {
        res.status(400).json({ message: "bankId field is required" });
        return;
    }
    try {
        // Find the bank record
        const bankData = yield bankinformation_1.default.findOne({ where: { id: bankId } });
        if (!bankData) {
            res.status(404).json({ message: "Bank information not found" });
            return;
        }
        // Update bank details
        yield bankData.update({
            bankName: bankName || bankData.bankName,
            accountNumber: accountNumber || bankData.accountNumber,
            accountHolderName: accountHolderName || bankData.accountHolderName,
            swiftCode: swiftCode || bankData.swiftCode,
            routingNumber: routingNumber || bankData.routingNumber,
            bankAddress: bankAddress || bankData.bankAddress,
        });
        res.status(200).json({
            message: "Bank information updated successfully",
            data: bankData,
        });
    }
    catch (error) {
        logger_1.default.error("Error updating bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
});
exports.updateBankInformationV2 = updateBankInformationV2;
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
            res
                .status(404)
                .json({ message: "No bank information found for this vendor" });
            return;
        }
        res.status(200).json({
            message: "Bank information retrieved successfully",
            data: bankData,
        });
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
        res.status(200).json({
            message: "Bank information retrieved successfully",
            data: bankInfo,
        });
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
const getVendorWalletStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const vendor = yield user_1.default.findByPk(vendorId, {
            attributes: ['wallet', 'pendingWallet', 'dollarWallet', 'pendingDollarWallet']
        });
        if (!vendor) {
            res.status(404).json({ message: "Vendor not found" });
            return;
        }
        // Calculate total earnings (simplified for now as sum of all completed sales transactions)
        const transactions = yield transaction_1.default.findAll({
            where: { userId: vendorId, status: 'completed' },
        });
        const stats = {
            balance: {
                NGN: vendor.wallet || 0,
                USD: vendor.dollarWallet || 0,
            },
            pending: {
                NGN: vendor.pendingWallet || 0,
                USD: vendor.pendingDollarWallet || 0,
            },
            availableNGN: vendor.wallet || 0,
            availableUSD: vendor.dollarWallet || 0,
            pendingNGN: vendor.pendingWallet || 0,
            pendingUSD: vendor.pendingDollarWallet || 0,
            totalEarnings: transactions.reduce((acc, t) => {
                acc[t.currency] = new decimal_js_1.default(acc[t.currency] || 0)
                    .plus(t.amount)
                    .toNumber();
                return acc;
            }, { NGN: 0, USD: 0 }),
        };
        res.status(200).json({ data: stats });
    }
    catch (error) {
        logger_1.default.error("Error fetching wallet stats:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getVendorWalletStats = getVendorWalletStats;
const getVendorTransactions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { page = 1, limit = 10 } = req.query;
    try {
        const offset = (Number(page) - 1) * Number(limit);
        const { rows, count } = yield transaction_1.default.findAndCountAll({
            where: { userId: vendorId },
            limit: Number(limit),
            offset,
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({
            data: rows,
            pagination: {
                total: count,
                page: Number(page),
                limit: Number(limit)
            }
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching transactions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getVendorTransactions = getVendorTransactions;
const requestWithdrawal = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        const vendor = yield user_1.default.findByPk(vendorId, { transaction });
        if (!vendor ||
            vendor.dollarWallet === undefined ||
            vendor.wallet === undefined) {
            yield transaction.rollback();
            res
                .status(404)
                .json({ message: "Vendor not found or wallet not initialized" });
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
        // Log Transaction
        yield transaction_1.default.create({
            userId: vendorId,
            amount: amount,
            currency: currency,
            transactionType: "withdrawal",
            refId: withdrawal.id,
            status: "pending",
            note: `Withdrawal request to ${bankInformation.bankName}`
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
        res
            .status(200)
            .json({ message: "Withdrawal request submitted", withdrawal });
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
        res
            .status(200)
            .json({ message: "Withdrawals fetched successfully", data: withdrawals });
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
            res
                .status(400)
                .json({ message: "Only rejected withdrawals can be updated" });
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
            if (Number((_b = vendor.dollarWallet) !== null && _b !== void 0 ? _b : 0) < withdrawalAmount) {
                yield transaction.rollback();
                res
                    .status(400)
                    .json({ message: "Insufficient funds in dollar wallet." });
                return;
            }
            vendor.dollarWallet = Number((_c = vendor.dollarWallet) !== null && _c !== void 0 ? _c : 0) - withdrawalAmount;
        }
        else {
            if (Number((_d = vendor.wallet) !== null && _d !== void 0 ? _d : 0) < withdrawalAmount) {
                yield transaction.rollback();
                res.status(400).json({ message: "Insufficient funds in wallet." });
                return;
            }
            vendor.wallet = Number((_e = vendor.wallet) !== null && _e !== void 0 ? _e : 0) - withdrawalAmount;
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
        res
            .status(200)
            .json({ message: `Withdrawal successfully updated.`, data: withdrawal });
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
        res
            .status(200)
            .json({ message: "Withdrawal retrieved successfully", data: withdrawal });
    }
    catch (error) {
        logger_1.default.error("Error retrieving withdrawal:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getWithdrawalById = getWithdrawalById;
const cancelSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!vendorId) {
        res.status(403).json({ message: "Unauthorized. Vendor ID is required." });
        return;
    }
    const transaction = yield sequelize_service_1.default.connection.transaction();
    try {
        // Step 1: Find the active subscription for the vendor
        const activeSubscription = yield vendorsubscription_1.default.findOne({
            where: { vendorId, isActive: true },
            include: [
                {
                    model: subscriptionplan_1.default,
                    as: "subscriptionPlans",
                    attributes: ["id", "name", "price"],
                },
            ],
            transaction,
            lock: true, // Prevent concurrent modifications
        });
        if (!activeSubscription) {
            yield transaction.rollback();
            res
                .status(404)
                .json({ message: "No active subscription found for this vendor." });
            return;
        }
        // Step 2: Check if it's already a Free Plan
        if (((_b = activeSubscription.subscriptionPlans) === null || _b === void 0 ? void 0 : _b.name) === "Free Plan") {
            yield transaction.rollback();
            res
                .status(400)
                .json({ message: "Cannot cancel Free Plan subscription." });
            return;
        }
        // Step 3: Find the Free Plan
        const freePlan = yield subscriptionplan_1.default.findOne({
            where: { name: "Free Plan" },
            transaction,
        });
        if (!freePlan) {
            yield transaction.rollback();
            res
                .status(500)
                .json({ message: "Free Plan not found. Please contact support." });
            return;
        }
        // Step 4: Deactivate current subscription
        yield activeSubscription.update({ isActive: false }, { transaction });
        // Step 5: Create new Free Plan subscription
        const startDate = new Date();
        const endDate = new Date();
        endDate.setFullYear(startDate.getFullYear() + 10); // Long validity for Free Plan
        const newFreeSubscription = yield vendorsubscription_1.default.create({
            vendorId,
            subscriptionPlanId: freePlan.id,
            startDate,
            endDate,
            isActive: true,
        }, { transaction });
        // Step 6: Send notification
        yield notification_1.default.create({
            userId: vendorId,
            title: "Subscription Cancelled",
            message: `Your ${(_c = activeSubscription.subscriptionPlans) === null || _c === void 0 ? void 0 : _c.name} subscription has been cancelled. You have been moved to the Free Plan.`,
            type: "subscription",
            isRead: false,
        }, { transaction });
        yield transaction.commit(); // Commit all changes
        res.status(200).json({
            message: "Subscription cancelled successfully. You have been moved to the Free Plan.",
            cancelledSubscription: {
                id: activeSubscription.id,
                planName: (_d = activeSubscription.subscriptionPlans) === null || _d === void 0 ? void 0 : _d.name,
                cancelledAt: new Date(),
            },
            newSubscription: {
                id: newFreeSubscription.id,
                planName: "Free Plan",
                startDate: newFreeSubscription.startDate,
                endDate: newFreeSubscription.endDate,
            },
        });
    }
    catch (error) {
        yield transaction.rollback(); // Rollback changes on error
        logger_1.default.error("Error cancelling subscription:", error);
        res.status(500).json({
            message: "An error occurred while cancelling the subscription.",
        });
    }
});
exports.cancelSubscription = cancelSubscription;
const createService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const { title, description, image_url, video_url, service_category_id, service_subcategory_id, location_city, location_state, location_country, is_negotiable, work_experience_years, additional_images, price, discount_price, attributes, } = req.body;
    try {
        // Check if categoryId exists
        const serviceCategory = yield serviceCategories_1.default.findByPk(service_category_id);
        if (!serviceCategory) {
            res.status(404).json({ message: "Service category not found." });
            return;
        }
        // Check if subcategoryId exist
        const serviceSubCategory = yield serviceSubCategories_1.default.findByPk(service_subcategory_id);
        if (!serviceSubCategory) {
            res.status(404).json({ message: "Service subcategory not found." });
            return;
        }
        if (discount_price && Number(discount_price) >= Number(price)) {
            res.status(400).json({
                message: "Discount price must be less than the regular price.",
            });
            return;
        }
        const attributeIds = attributes
            ? [...new Set(attributes.map((attr) => attr.attributeId))]
            : [];
        // Validate that all attribute IDs exist
        const existingAttributes = yield attributeDefinitions_1.default.findAll({
            where: { id: attributeIds },
        });
        if (existingAttributes.length !== attributeIds.length) {
            res.status(400).json({
                message: "One or more attributes does not exist for this category.",
            });
            return;
        }
        let createdService = null;
        yield sequelize_2.default.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const newService = yield services_1.default.create({
                vendorId,
                service_category_id,
                service_subcategory_id,
                description,
                price,
                discount_price,
                title,
                image_url,
                video_url,
                location_city,
                location_state,
                location_country,
                is_negotiable,
                work_experience_years,
                additional_images,
                status: "inactive",
            }, {
                transaction: t,
            });
            const optionAttributes = [];
            const textAttributes = [];
            const numberAttributes = [];
            const booleanAttributes = [];
            for (const attr of existingAttributes) {
                if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.MULTI_SELECT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && Array.isArray(attribute.value)) {
                        for (const val of attribute.value) {
                            if (typeof val !== "number") {
                                res.status(400).json({
                                    message: `Invalid value in array for attribute ID ${attr.id}. Expected all values to be option id numbers.`,
                                });
                                return;
                            }
                            optionAttributes.push({
                                attribute_id: attr.id,
                                service_id: newService.id,
                                option_value_id: val,
                            });
                        }
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected an array.`,
                        });
                        return;
                    }
                }
                else if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.SINGLE_SELECT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && typeof attribute.value === "number") {
                        optionAttributes.push({
                            attribute_id: attr.id,
                            service_id: newService.id,
                            option_value_id: attribute.value,
                        });
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected an option id number.`,
                        });
                        return;
                    }
                }
                else if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.STR_INPUT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && typeof attribute.value === "string") {
                        textAttributes.push({
                            attribute_id: attr.id,
                            service_id: newService.id,
                            text_value: attribute.value,
                        });
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected a string.`,
                        });
                        return;
                    }
                }
                else if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.INT_INPUT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && typeof attribute.value === "number") {
                        numberAttributes.push({
                            attribute_id: attr.id,
                            service_id: newService.id,
                            value: attribute.value,
                        });
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected a number.`,
                        });
                        return;
                    }
                }
                else if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.BOOL_INPUT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && typeof attribute.value === "boolean") {
                        booleanAttributes.push({
                            attribute_id: attr.id,
                            service_id: newService.id,
                            value: attribute.value,
                        });
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected a boolean`,
                        });
                        return;
                    }
                }
            }
            const groupedOptions = new Map();
            const serviceAttributes = [];
            // Bulk create attributes
            if (optionAttributes.length > 0) {
                yield serviceAttributeOptionValues_1.default.bulkCreate(optionAttributes, {
                    transaction: t,
                });
                const serviceOptionAttributes = yield serviceAttributeOptionValues_1.default.findAll({
                    where: { service_id: newService.id },
                    include: [
                        {
                            model: attributeDefinitions_1.default,
                            as: "attribute",
                        },
                        {
                            model: attributeOptions_1.default,
                            as: "optionValue",
                        },
                    ],
                    transaction: t,
                });
                for (const { attribute, optionValue } of serviceOptionAttributes) {
                    const key = attribute.name;
                    const val = optionValue.option_value;
                    const options = groupedOptions.get(key);
                    if (options)
                        options.push(val);
                    else
                        groupedOptions.set(key, [val]);
                }
                const optionsArray = Array.from(groupedOptions, ([name, values]) => ({
                    name,
                    values,
                }));
                serviceAttributes.push(...optionsArray);
            }
            if (textAttributes.length > 0) {
                yield serviceAttributeTextValues_1.default.bulkCreate(textAttributes, {
                    transaction: t,
                });
                const serviceTextAttributes = yield serviceAttributeTextValues_1.default.findAll({
                    where: { service_id: newService.id },
                    include: [
                        {
                            model: attributeDefinitions_1.default,
                            as: "attribute",
                        },
                    ],
                    transaction: t,
                });
                for (const { attribute, text_value } of serviceTextAttributes) {
                    serviceAttributes.push({ name: attribute.name, value: text_value });
                }
            }
            if (numberAttributes.length > 0) {
                yield serviceAttributeNumberValues_1.default.bulkCreate(numberAttributes, {
                    transaction: t,
                });
                const serviceNumberAttributes = yield serviceAttributeNumberValues_1.default.findAll({
                    where: { service_id: newService.id },
                    include: [
                        {
                            model: attributeDefinitions_1.default,
                            as: "attribute",
                        },
                    ],
                    transaction: t,
                });
                for (const { attribute, value } of serviceNumberAttributes) {
                    serviceAttributes.push({ name: attribute.name, value });
                }
            }
            if (booleanAttributes.length > 0) {
                yield serviceAttributeBoolValues_1.default.bulkCreate(booleanAttributes, {
                    transaction: t,
                });
                const serviceBooleanAttributes = yield serviceAttributeBoolValues_1.default.findAll({
                    where: { service_id: newService.id },
                    include: [
                        {
                            model: attributeDefinitions_1.default,
                            as: "attribute",
                        },
                    ],
                    transaction: t,
                });
                for (const { attribute, value } of serviceBooleanAttributes) {
                    serviceAttributes.push({ name: attribute.name, value });
                }
            }
            // Update service with attributes
            newService.attributes = serviceAttributes;
            const updatedService = yield newService.save({ transaction: t });
            createdService = updatedService || newService;
        }));
        res.status(201).json({
            message: "Service created successfully",
            data: createdService,
        });
        return;
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to create service" });
        return;
    }
});
exports.createService = createService;
const updateService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id; // Authenticated user ID from middleware
    const serviceId = req.params.serviceId;
    const { title, description, image_url, video_url, service_category_id, service_subcategory_id, location_city, location_state, location_country, work_experience_years, additional_images, price, discount_price, is_negotiable, attributes, } = req.body;
    try {
        // Check if categoryId exists
        const serviceCategory = yield serviceCategories_1.default.findByPk(service_category_id);
        if (!serviceCategory) {
            res.status(404).json({ message: "Service category not found." });
            return;
        }
        // Check if subcategoryId exist
        const serviceSubCategory = yield serviceSubCategories_1.default.findByPk(service_subcategory_id);
        if (!serviceSubCategory) {
            res.status(404).json({ message: "Service subcategory not found." });
            return;
        }
        if (discount_price && Number(discount_price) >= Number(price)) {
            res.status(400).json({
                message: "Discount price must be less than the regular price.",
            });
            return;
        }
        const attributeIds = attributes
            ? attributes.map((attr) => attr.attributeId)
            : [];
        // Validate that all attribute IDs exist
        const existingAttributes = yield attributeDefinitions_1.default.findAll({
            where: { id: attributeIds },
        });
        if (existingAttributes.length !== attributeIds.length) {
            res.status(400).json({ message: "One or more attributes are invalid." });
            return;
        }
        let updatedService = null;
        yield sequelize_2.default.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
            const service = yield services_1.default.findOne({
                where: { id: serviceId, vendorId },
                transaction: t,
                lock: true, // Prevent concurrent modifications
            });
            if (!service) {
                res.status(404).json({ message: "Service not found." });
                return;
            }
            if (service.status === "active") {
                res.status(400).json({
                    message: "Cannot update an active service. Please deactivate it first.",
                });
                return;
            }
            yield service.update({
                service_category_id,
                service_subcategory_id,
                description,
                price,
                discount_price,
                title,
                image_url,
                video_url,
                location_city,
                location_state,
                location_country,
                work_experience_years,
                is_negotiable,
                additional_images,
                status: "inactive",
            }, {
                transaction: t,
            });
            const optionAttributes = [];
            const textAttributes = [];
            const numberAttributes = [];
            const booleanAttributes = [];
            for (const attr of existingAttributes) {
                if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.MULTI_SELECT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && Array.isArray(attribute.value)) {
                        for (const val of attribute.value) {
                            if (typeof val !== "number") {
                                res.status(400).json({
                                    message: `Invalid value in array for attribute ID ${attr.id}. Expected all values to be option id numbers.`,
                                });
                                return;
                            }
                            optionAttributes.push({
                                attribute_id: attr.id,
                                service_id: service.id,
                                option_value_id: val,
                            });
                        }
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected an array.`,
                        });
                        return;
                    }
                }
                else if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.SINGLE_SELECT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && typeof attribute.value === "number") {
                        optionAttributes.push({
                            attribute_id: attr.id,
                            service_id: service.id,
                            option_value_id: attribute.value,
                        });
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected an option id string.`,
                        });
                        return;
                    }
                }
                else if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.STR_INPUT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && typeof attribute.value === "string") {
                        textAttributes.push({
                            attribute_id: attr.id,
                            service_id: service.id,
                            text_value: attribute.value,
                        });
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected a string.`,
                        });
                        return;
                    }
                }
                else if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.INT_INPUT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && typeof attribute.value === "string") {
                        numberAttributes.push({
                            attribute_id: attr.id,
                            service_id: service.id,
                            value: attribute.value,
                        });
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected a number string.`,
                        });
                        return;
                    }
                }
                else if (attr.input_type === helpers_1.ALLOWED_SERVICE_ATTRIBUTE_INPUT_OBJ.BOOL_INPUT) {
                    const attribute = attributes.find((a) => a.attributeId === attr.id);
                    if (attribute && typeof attribute.value === "boolean") {
                        booleanAttributes.push({
                            attribute_id: attr.id,
                            service_id: service.id,
                            value: attribute.value,
                        });
                    }
                    else {
                        res.status(400).json({
                            message: `Invalid value for attribute ID ${attr.id}. Expected a boolean.`,
                        });
                        return;
                    }
                }
            }
            const groupedOptions = new Map();
            const serviceAttributes = [];
            // Bulk create attribute
            if (optionAttributes.length > 0) {
                // First, delete existing option attributes for the service
                yield serviceAttributeOptionValues_1.default.destroy({
                    where: { service_id: service.id },
                    transaction: t,
                });
                yield serviceAttributeOptionValues_1.default.bulkCreate(optionAttributes, {
                    transaction: t,
                    returning: true,
                });
                const serviceOptionAttributes = yield serviceAttributeOptionValues_1.default.findAll({
                    where: { service_id: service.id },
                    include: [
                        {
                            model: attributeDefinitions_1.default,
                            as: "attribute",
                        },
                        {
                            model: attributeOptions_1.default,
                            as: "optionValue",
                        },
                    ],
                    transaction: t,
                });
                for (const { attribute, optionValue } of serviceOptionAttributes) {
                    const key = attribute.name;
                    const val = optionValue.option_value;
                    const options = groupedOptions.get(key);
                    if (options)
                        options.push(val);
                    else
                        groupedOptions.set(key, [val]);
                }
                const optionsArray = Array.from(groupedOptions, ([name, values]) => ({
                    name,
                    values,
                }));
                serviceAttributes.push(...optionsArray);
            }
            if (textAttributes.length > 0) {
                // First, delete existing text attributes for the service
                yield serviceAttributeTextValues_1.default.destroy({
                    where: { service_id: service.id },
                    transaction: t,
                });
                yield serviceAttributeTextValues_1.default.bulkCreate(textAttributes, {
                    transaction: t,
                });
                const serviceTextAttributes = yield serviceAttributeTextValues_1.default.findAll({
                    where: { service_id: service.id },
                    include: [
                        {
                            model: attributeDefinitions_1.default,
                            as: "attribute",
                        },
                    ],
                    transaction: t,
                });
                for (const { attribute, text_value } of serviceTextAttributes) {
                    serviceAttributes.push({ name: attribute.name, value: text_value });
                }
            }
            if (numberAttributes.length > 0) {
                // First, delete existing number attributes for the service
                yield serviceAttributeNumberValues_1.default.destroy({
                    where: { service_id: service.id },
                    transaction: t,
                });
                yield serviceAttributeNumberValues_1.default.bulkCreate(numberAttributes, {
                    transaction: t,
                    returning: true,
                });
                const serviceNumberAttributes = yield serviceAttributeNumberValues_1.default.findAll({
                    where: { service_id: service.id },
                    include: [
                        {
                            model: attributeDefinitions_1.default,
                            as: "attribute",
                        },
                    ],
                    transaction: t,
                });
                for (const { attribute, value } of serviceNumberAttributes) {
                    serviceAttributes.push({ name: attribute.name, value });
                }
            }
            if (booleanAttributes.length > 0) {
                // First, delete existing boolean attributes for the service
                yield serviceAttributeBoolValues_1.default.destroy({
                    where: { service_id: service.id },
                    transaction: t,
                });
                yield serviceAttributeBoolValues_1.default.bulkCreate(booleanAttributes, {
                    transaction: t,
                    returning: true,
                });
                const serviceBooleanAttributes = yield serviceAttributeBoolValues_1.default.findAll({
                    where: { service_id: service.id },
                    include: [
                        {
                            model: attributeDefinitions_1.default,
                            as: "attribute",
                        },
                    ],
                    transaction: t,
                });
                for (const { attribute, value } of serviceBooleanAttributes) {
                    serviceAttributes.push({ name: attribute.name, value });
                }
            }
            // Update service with attributes
            service.attributes = serviceAttributes;
            const serviceAfterUpdate = yield service.save({ transaction: t });
            updatedService = serviceAfterUpdate;
        }));
        res.status(200).json({
            message: "Service updated successfully",
            data: updatedService,
        });
    }
    catch (error) {
        logger_1.default.error(error);
        console.error(error);
        res.status(500).json({ message: "Failed to update service" });
        return;
    }
});
exports.updateService = updateService;
const getService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const serviceId = req.params.serviceId;
    if (!serviceId) {
        res.status(400).json({ message: "Service ID is required." });
        return;
    }
    try {
        const services = yield services_1.default.findAll({
            where: { id: serviceId },
            include: [
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
            order: [["createdAt", "DESC"]],
        });
        res
            .status(200)
            .json({ message: "Services fetched successfully", data: services });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch services" });
    }
});
exports.getService = getService;
const getVendorServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { page, limit } = req.query;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;
    try {
        const services = yield services_1.default.findAll({
            where: { vendorId },
            limit: limit ? Number(limit) : 10,
            offset: offset ? offset : 0,
            include: [
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
            order: [["createdAt", "DESC"]],
        });
        res
            .status(200)
            .json({ message: "Services fetched successfully", data: services });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to fetch services" });
    }
});
exports.getVendorServices = getVendorServices;
const deleteService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const serviceId = req.params.serviceId;
    try {
        const service = yield services_1.default.findOne({
            where: { id: serviceId, vendorId },
        });
        if (!service) {
            res.status(404).json({ message: "Service not found." });
            return;
        }
        if (service.status === "active") {
            res.status(400).json({
                message: "Cannot delete an active service. Deactivate it first.",
            });
            return;
        }
        yield service.destroy();
        res.status(200).json({ message: "Service deleted successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to delete service." });
    }
});
exports.deleteService = deleteService;
const publishService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const serviceId = req.params.serviceId;
    try {
        const vendorSubscription = yield vendorsubscription_1.default.findOne({
            where: { vendorId, isActive: true },
            include: [
                {
                    model: subscriptionplan_1.default,
                    as: "subscriptionPlans",
                    attributes: ["id", "name", "allowsServiceAds", "serviceAdsLimit"],
                },
            ],
        });
        if (!vendorSubscription) {
            res.status(403).json({
                message: "No active subscription found. Please subscribe to a plan to publish services.",
            });
            return;
        }
        if (!((_b = vendorSubscription.subscriptionPlans) === null || _b === void 0 ? void 0 : _b.allowsServiceAds)) {
            res.status(403).json({
                message: "Your current subscription plan does not allow publishing services. Please upgrade your plan.",
            });
            return;
        }
        if (vendorSubscription.subscriptionPlans.serviceAdsLimit !== null) {
            const publishedServiceCount = yield services_1.default.count({
                where: { vendorId, status: "active" },
            });
            if (publishedServiceCount >=
                vendorSubscription.subscriptionPlans.serviceAdsLimit) {
                res.status(403).json({
                    message: `You have reached your service publication limit of ${vendorSubscription.subscriptionPlans.serviceAdsLimit}. Please upgrade your plan to publish more services.`,
                });
                return;
            }
        }
        const service = yield services_1.default.findOne({
            where: { id: serviceId, vendorId },
        });
        if (!service) {
            res.status(404).json({ message: "Service not found." });
            return;
        }
        if (service.status === "active") {
            res.status(400).json({ message: "Service is already active." });
            return;
        }
        if (service.status === "suspended") {
            res.status(400).json({
                message: "Suspended services cannot be published. Please contact support.",
            });
            return;
        }
        yield service.update({ status: "active" });
        res.status(200).json({ message: "Service published successfully." });
        return;
    }
    catch (error) {
        logger_1.default.error(error);
        console.error(error);
        res.status(500).json({ message: "Failed to publish service." });
        return;
    }
});
exports.publishService = publishService;
const unpublishService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const serviceId = req.params.serviceId;
    try {
        const service = yield services_1.default.findOne({
            where: { id: serviceId, vendorId },
        });
        if (!service) {
            res.status(404).json({ message: "Service not found." });
            return;
        }
        if (service.status === "inactive") {
            res.status(400).json({ message: "Service is already inactive." });
            return;
        }
        yield service.update({ status: "inactive" });
        res.status(200).json({ message: "Service unpublished successfully." });
    }
    catch (error) {
        logger_1.default.error(error);
        res.status(500).json({ message: "Failed to unpublish service." });
    }
});
exports.unpublishService = unpublishService;
const getServiceBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!vendorId) {
        res.status(403).json({ message: "Unauthorized. Vendor ID is required." });
        return;
    }
    const { page, limit, status } = req.query;
    const offset = page && limit ? (Number(page) - 1) * Number(limit) : 0;
    const whereClause = {};
    if (status) {
        whereClause.status = status;
    }
    whereClause.vendorId = vendorId;
    try {
        const { rows: bookings, count: total } = yield servicebookings_1.default.findAndCountAll({
            where: whereClause,
            limit: limit ? Number(limit) : 10,
            offset: offset ? offset : 0,
            include: [
                {
                    model: services_1.default,
                    as: "service",
                },
                {
                    model: user_1.default,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email", "photo"],
                },
            ],
            order: [["createdAt", "DESC"]],
        });
        res.status(200).json({
            message: "Bookings fetched successfully",
            data: bookings,
            total,
        });
    }
    catch (error) {
        logger_1.default.error("Error fetching service bookings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.getServiceBookings = getServiceBookings;
const markServiceBookingAsConfirmed = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!vendorId) {
        res.status(403).json({ message: "Unauthorized. Vendor ID is required." });
        return;
    }
    const bookingId = req.params.bookingId;
    try {
        const booking = yield servicebookings_1.default.findOne({
            where: { id: bookingId, vendorId },
            include: [
                {
                    model: services_1.default,
                    as: "service",
                },
                {
                    model: user_1.default,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email", "photo"],
                },
            ],
        });
        if (!booking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }
        if (booking.status !== "pending") {
            res.status(400).json({
                message: `Only pending bookings can be confirmed. Current status: ${booking.status}`,
            });
            return;
        }
        booking.status = "confirmed";
        yield booking.save();
        // Notify User
        yield notification_1.default.create({
            userId: booking.userId,
            title: "Service Booking Confirmed",
            type: "service_booking",
            message: `Your booking for the service "${(_b = booking.service) === null || _b === void 0 ? void 0 : _b.title}" has been confirmed by the vendor.`,
            isRead: false,
        });
        res
            .status(200)
            .json({ message: "Booking marked as confirmed.", data: booking });
    }
    catch (error) {
        logger_1.default.error("Error confirming service booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.markServiceBookingAsConfirmed = markServiceBookingAsConfirmed;
const markServiceBookingAsCancelled = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!vendorId) {
        res.status(403).json({ message: "Unauthorized. Vendor ID is required." });
        return;
    }
    const bookingId = req.params.bookingId;
    try {
        const booking = yield servicebookings_1.default.findOne({
            where: { id: bookingId, vendorId },
            include: [
                {
                    model: services_1.default,
                    as: "service",
                },
                {
                    model: user_1.default,
                    as: "user",
                    attributes: ["id", "firstName", "lastName", "email", "photo"],
                },
            ],
        });
        if (!booking) {
            res.status(404).json({ message: "Booking not found." });
            return;
        }
        if (booking.status !== "pending") {
            res.status(400).json({
                message: `Only pending bookings can be cancelled. Current status: ${booking.status}`,
            });
            return;
        }
        booking.status = "cancelled";
        yield booking.save();
        // Notify User
        yield notification_1.default.create({
            userId: booking.userId,
            title: "Service Booking Cancelled",
            type: "service_booking",
            message: `Your booking for the service "${(_b = booking.service) === null || _b === void 0 ? void 0 : _b.title}" has been cancelled by the vendor.`,
            isRead: false,
        });
        res
            .status(200)
            .json({ message: "Booking marked as cancelled.", data: booking });
    }
    catch (error) {
        logger_1.default.error("Error cancelling service booking:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.markServiceBookingAsCancelled = markServiceBookingAsCancelled;
const getVendorOffers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { page, limit, status, productId } = req.query;
    const offset = (Number(page) - 1) * Number(limit) || 0;
    const where = {};
    if (status)
        where.status = String(status);
    if (productId)
        where.productId = String(productId);
    try {
        const { count, rows: offers } = yield productoffer_1.default.findAndCountAll({
            where,
            subQuery: false,
            include: [
                {
                    model: product_1.default,
                    as: "product",
                    attributes: ["id", "name", "price", "image_url"],
                    where: { vendorId },
                    required: true,
                },
                {
                    model: user_1.default,
                    as: "buyer",
                    attributes: ["id", "firstName", "lastName", "email"],
                },
            ],
            order: [["createdAt", "DESC"]],
            limit: Number(limit) || 10,
            offset,
        });
        res.status(200).json({ data: offers, total: count });
    }
    catch (error) {
        logger_1.default.error(`Error fetching vendor offers: ${error.message}`);
        res.status(500).json({ message: "An error occurred while fetching offers." });
    }
});
exports.getVendorOffers = getVendorOffers;
const respondToVendorOffer = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const vendorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { offerId } = req.params;
    const { status, counterPrice } = req.body;
    const allowedStatuses = ["accepted", "rejected", "countered"];
    if (!status || !allowedStatuses.includes(status)) {
        res.status(400).json({ message: "Status must be one of: accepted, rejected, countered." });
        return;
    }
    if (status === "countered" && (!counterPrice || isNaN(Number(counterPrice)) || Number(counterPrice) <= 0)) {
        res.status(400).json({ message: "A valid counter price is required when countering an offer." });
        return;
    }
    try {
        const offer = yield productoffer_1.default.findByPk(offerId, {
            include: [
                { model: product_1.default, as: "product", attributes: ["id", "name", "vendorId"] },
                { model: user_1.default, as: "buyer", attributes: ["id", "firstName", "fcmToken"] },
            ],
        });
        if (!offer) {
            res.status(404).json({ message: "Offer not found." });
            return;
        }
        const product = offer.product;
        if (product.vendorId !== vendorId) {
            res.status(403).json({ message: "You are not authorized to respond to this offer." });
            return;
        }
        if (offer.status !== "pending") {
            res.status(400).json({ message: "This offer has already been responded to." });
            return;
        }
        yield offer.update({
            status,
            counterPrice: status === "countered" ? Number(counterPrice) : null,
        });
        const buyer = offer.buyer;
        const notificationMessages = {
            accepted: `Your offer on "${product.name}" has been accepted!`,
            rejected: `Your offer on "${product.name}" has been declined.`,
            countered: `The vendor has made a counter offer of ${counterPrice} on "${product.name}".`,
        };
        yield notification_1.default.create({
            userId: buyer.id,
            title: status === "accepted" ? "Offer Accepted" : status === "rejected" ? "Offer Declined" : "Counter Offer Received",
            message: notificationMessages[status],
            type: `OFFER_${status.toUpperCase()}`,
            isRead: false,
        });
        if (buyer.fcmToken) {
            try {
                yield (0, pushNotification_1.sendPushNotificationSingle)({
                    token: buyer.fcmToken,
                    notification: {
                        title: status === "accepted" ? "Offer Accepted" : status === "rejected" ? "Offer Declined" : "Counter Offer",
                        body: notificationMessages[status],
                    },
                    data: {
                        offerId: offer.id,
                        type: index_1.PushNotificationTypes.ORDER_STATUS_UPDATE,
                    },
                });
            }
            catch (pushError) {
                logger_1.default.error("Error sending push notification:", pushError);
            }
        }
        res.status(200).json({ message: "Offer response sent successfully.", data: offer });
    }
    catch (error) {
        logger_1.default.error(`Error responding to vendor offer: ${error.message}`);
        res.status(500).json({ message: "An error occurred while responding to the offer." });
    }
});
exports.respondToVendorOffer = respondToVendorOffer;
//# sourceMappingURL=vendorController.js.map