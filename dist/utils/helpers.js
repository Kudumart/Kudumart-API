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
exports.initStripe = exports.getJobsBySearch = exports.generateUniquePhoneNumber = exports.hasPurchasedProduct = exports.shuffleArray = exports.verifyPayment = exports.checkAdvertLimit = exports.checkVendorAuctionProductLimit = exports.checkVendorProductLimit = exports.fetchAdminWithPermissions = exports.sendSMS = exports.capitalizeFirstLetter = exports.generateOTP = exports.getStripeSecretKey = void 0;
// utils/helpers.ts
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const querystring_1 = __importDefault(require("querystring"));
const admin_1 = __importDefault(require("../models/admin"));
const role_1 = __importDefault(require("../models/role"));
const permission_1 = __importDefault(require("../models/permission"));
const vendorsubscription_1 = __importDefault(require("../models/vendorsubscription"));
const subscriptionplan_1 = __importDefault(require("../models/subscriptionplan"));
const product_1 = __importDefault(require("../models/product"));
const logger_1 = __importDefault(require("../middlewares/logger"));
const sequelize_1 = require("sequelize");
const auctionproduct_1 = __importDefault(require("../models/auctionproduct"));
const advert_1 = __importDefault(require("../models/advert"));
const orderitem_1 = __importDefault(require("../models/orderitem"));
const user_1 = __importDefault(require("../models/user"));
const job_1 = __importDefault(require("../models/job"));
const stripe_1 = __importDefault(require("stripe"));
const paymentgateway_1 = __importDefault(require("../models/paymentgateway"));
// Function to generate a 6-digit OTP
const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    return otp;
};
exports.generateOTP = generateOTP;
// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;
const sendSMS = (mobile, messageContent) => __awaiter(void 0, void 0, void 0, function* () {
    const apiUrl = 'portal.nigeriabulksms.com';
    const data = querystring_1.default.stringify({
        username: process.env.SMS_USERNAME,
        password: process.env.SMS_PASSWORD,
        sender: process.env.APP_NAME,
        message: messageContent,
        mobiles: mobile,
    });
    const options = {
        hostname: apiUrl,
        path: '/api/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length,
        },
    };
    return new Promise((resolve, reject) => {
        const req = http_1.default.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(responseData);
                    if (result.status && result.status.toUpperCase() === 'OK') {
                        logger_1.default.info('SMS sent successfully');
                        resolve();
                    }
                    else {
                        reject(new Error(`SMS failed with error: ${result.error}`));
                    }
                }
                catch (error) {
                    reject(new Error('Failed to parse SMS response'));
                }
            });
        });
        req.on('error', (error) => {
            reject(new Error(`Failed to send SMS: ${error.message}`));
        });
        // Send the request with the post data
        req.write(data);
        req.end();
    });
});
exports.sendSMS = sendSMS;
const fetchAdminWithPermissions = (adminId) => __awaiter(void 0, void 0, void 0, function* () {
    return yield admin_1.default.findByPk(adminId, {
        include: [
            {
                model: role_1.default,
                include: [permission_1.default], // Assuming you have a Role and Permission model with proper associations
            },
        ],
    });
});
exports.fetchAdminWithPermissions = fetchAdminWithPermissions;
/**
 * Checks if a vendor has reached their product limit based on their active subscription plan.
 * @param vendorId - The ID of the vendor to check.
 * @returns A promise that resolves to an object indicating the status and a message.
 */
const checkVendorProductLimit = (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the active subscription for the vendor
        const activeSubscription = yield vendorsubscription_1.default.findOne({
            where: {
                vendorId,
                isActive: true,
            },
        });
        if (!activeSubscription) {
            return { status: false, message: 'Vendor does not have an active subscription.' };
        }
        // Fetch the subscription plan details
        const subscriptionPlan = yield subscriptionplan_1.default.findByPk(activeSubscription.subscriptionPlanId);
        if (!subscriptionPlan) {
            return { status: false, message: 'Subscription plan not found.' };
        }
        const { productLimit } = subscriptionPlan;
        // Count the number of products already created by the vendor
        const productCount = yield product_1.default.count({
            where: { vendorId },
        });
        if (productCount >= productLimit) {
            return { status: false, message: 'You have reached the maximum number of products allowed for your current subscription plan. Please upgrade your plan to add more products.' };
        }
        return { status: true, message: 'Vendor can create more products.' };
    }
    catch (error) {
        // Error type should be handled more gracefully if you have custom error types
        throw new Error(error.message || 'An error occurred while checking the product limit.');
    }
});
exports.checkVendorProductLimit = checkVendorProductLimit;
const checkVendorAuctionProductLimit = (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the active subscription for the vendor
        const activeSubscription = yield vendorsubscription_1.default.findOne({
            where: {
                vendorId,
                isActive: true,
            },
        });
        if (!activeSubscription) {
            return { status: false, message: 'Vendor does not have an active subscription.' };
        }
        // Fetch the subscription plan details
        const subscriptionPlan = yield subscriptionplan_1.default.findByPk(activeSubscription.subscriptionPlanId);
        if (!subscriptionPlan) {
            return { status: false, message: 'Subscription plan not found.' };
        }
        const auctionProductLimit = subscriptionPlan.auctionProductLimit;
        const allowAuctionProduct = subscriptionPlan.allowsAuction;
        // Handle the case where allowAuctionProduct is false
        if (!allowAuctionProduct) {
            return { status: false, message: 'Your subscription plan does not allow auctions.' };
        }
        // Handle the case where auctionProductLimit is null
        if (auctionProductLimit === null) {
            return { status: false, message: 'Your subscription plan does not define a limit for auction products.' };
        }
        // Count the number of products already created by the vendor
        const auctionProductCount = yield auctionproduct_1.default.count({
            where: { vendorId },
        });
        if (auctionProductCount >= auctionProductLimit) {
            return { status: false, message: 'You have reached the maximum number of auction products allowed for your current subscription plan. Please upgrade your plan to add more auction products.' };
        }
        return { status: true, message: 'Vendor can create more auction products.' };
    }
    catch (error) {
        // Error type should be handled more gracefully if you have custom error types
        throw new Error(error.message || 'An error occurred while checking the auction product limit.');
    }
});
exports.checkVendorAuctionProductLimit = checkVendorAuctionProductLimit;
const checkAdvertLimit = (vendorId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find the active subscription for the vendor
        const activeSubscription = yield vendorsubscription_1.default.findOne({
            where: {
                vendorId,
                isActive: true,
            },
        });
        if (!activeSubscription) {
            return { status: false, message: 'Vendor does not have an active subscription.' };
        }
        // Fetch the subscription plan details
        const subscriptionPlan = yield subscriptionplan_1.default.findByPk(activeSubscription.subscriptionPlanId);
        if (!subscriptionPlan) {
            return { status: false, message: 'Subscription plan not found.' };
        }
        const maxAds = subscriptionPlan.maxAds;
        // Handle the case where maxAds is null
        if (maxAds === null) {
            return { status: false, message: 'Your subscription plan does not define a limit for adverts.' };
        }
        // Count the number of adverts already created by the vendor
        const maxAdsCount = yield advert_1.default.count({
            where: { userId: vendorId },
        });
        if (maxAdsCount >= maxAds) {
            return { status: false, message: 'You have reached the maximum number of adverts allowed for your current subscription plan. Please upgrade your plan to add more adverts.' };
        }
        return { status: true, message: 'Vendor can create more adverts.' };
    }
    catch (error) {
        // Error type should be handled more gracefully if you have custom error types
        throw new Error(error.message || 'An error occurred while checking the advert limit.');
    }
});
exports.checkAdvertLimit = checkAdvertLimit;
const verifyPayment = (refId, paystackSecretKey) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: "api.paystack.co",
            path: `/transaction/verify/${refId}`,
            method: "GET",
            headers: {
                Authorization: `Bearer ${paystackSecretKey}`, // Use dynamic key
            },
        };
        const req = https_1.default.request(options, (res) => {
            let data = "";
            res.on("data", (chunk) => {
                data += chunk;
            });
            res.on("end", () => {
                try {
                    const response = JSON.parse(data);
                    if (response.status) {
                        resolve(response.data);
                    }
                    else {
                        reject(new Error(`Paystack Error: ${response.message}`));
                    }
                }
                catch (err) {
                    reject(new Error("Invalid response from Paystack"));
                }
            });
        });
        req.on("error", (e) => {
            reject(new Error(`Error validating payment: ${e.message}`));
        });
        req.end();
    });
};
exports.verifyPayment = verifyPayment;
// Utility function to shuffle an array
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};
exports.shuffleArray = shuffleArray;
const hasPurchasedProduct = (orderId, productId) => __awaiter(void 0, void 0, void 0, function* () {
    const orderItem = yield orderitem_1.default.findOne({
        where: {
            orderId,
            status: "delivered",
            [sequelize_1.Op.and]: sequelize_1.Sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(product, '$.id')) = '${productId}'`)
        }
    });
    return !!orderItem; // Returns true if found, false otherwise
});
exports.hasPurchasedProduct = hasPurchasedProduct;
const generateUniquePhoneNumber = () => __awaiter(void 0, void 0, void 0, function* () {
    let phoneNumber;
    let isUnique = false;
    while (!isUnique) {
        // Generate a random 10-digit number (US-style format)
        phoneNumber = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        // Check if this phone number already exists in the database
        const existingUser = yield user_1.default.findOne({ where: { phoneNumber } });
        if (!existingUser) {
            isUnique = true;
        }
    }
    return phoneNumber;
});
exports.generateUniquePhoneNumber = generateUniquePhoneNumber;
const getJobsBySearch = (searchTerm, number) => __awaiter(void 0, void 0, void 0, function* () {
    const where = { status: 'active' };
    if (searchTerm) {
        const searchRegex = { [sequelize_1.Op.iLike]: `%${searchTerm}%` }; // Use Sequelize's Op.iLike for case-insensitive search.
        where[sequelize_1.Op.or] = [
            { title: searchRegex },
            { workplace_type: searchRegex },
            { job_type: searchRegex },
            { location: searchRegex },
        ];
    }
    return yield job_1.default.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: number, // Limit the number of results.
    });
});
exports.getJobsBySearch = getJobsBySearch;
const getStripeSecretKey = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const paymentGateway = yield paymentgateway_1.default.findOne({
            where: {
                isActive: true,
                name: "stripe", // Assuming 'name' is the field storing the gateway name
            },
        });
        if (!paymentGateway) {
            logger_1.default.error("No active Stripe gateway found.");
            return null;
        }
        return paymentGateway.secretKey; // Ensure your model has this field
    }
    catch (error) {
        logger_1.default.error("Error fetching Stripe secret key:", error);
        return null;
    }
});
exports.getStripeSecretKey = getStripeSecretKey;
const initStripe = () => __awaiter(void 0, void 0, void 0, function* () {
    const secretKey = yield (0, exports.getStripeSecretKey)();
    if (!secretKey) {
        throw new Error("Stripe secret key not found.");
    }
    return new stripe_1.default(secretKey, {
        apiVersion: "2025-02-24.acacia", // Force TypeScript to accept it
    });
});
exports.initStripe = initStripe;
//# sourceMappingURL=helpers.js.map