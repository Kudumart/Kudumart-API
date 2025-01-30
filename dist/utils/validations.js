"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = exports.updateAdvertValidation = exports.createAdvertValidation = exports.validateShowInterest = exports.validateUpdateCartItem = exports.validateAddItemToCart = exports.validatePlaceBid = exports.validateSendMessage = exports.validatePaymentGateway = exports.updateAuctionProductValidation = exports.auctionProductValidation = exports.updateProductValidation = exports.addProductValidation = exports.updateStoreValidation = exports.createStoreValidation = exports.validateKYCNotification = exports.kycValidationRules = exports.updateSubscriptionPlanValidationRules = exports.createSubscriptionPlanValidationRules = exports.updateSubAdminValidationRules = exports.createSubAdminValidationRules = exports.adminUpdateProfileValidationRules = exports.confirmProfilePhoneNumberValidationRules = exports.updateProfilePhoneNumberValidationRules = exports.confirmProfileEmailValidationRules = exports.updateProfileEmailValidationRules = exports.updatePasswordValidationRules = exports.resetPasswordValidationRules = exports.forgotPasswordValidationRules = exports.resendVerificationValidationRules = exports.loginValidationRules = exports.verificationValidationRules = exports.registrationValidationRules = void 0;
const express_validator_1 = require("express-validator");
// Validation rules for different functionalities
// Registration validation rules
const registrationValidationRules = () => {
    return [
        (0, express_validator_1.check)("email").isEmail().withMessage("Please provide a valid email"),
        (0, express_validator_1.check)("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
        (0, express_validator_1.check)("firstName").not().isEmpty().withMessage("First name is required"),
        (0, express_validator_1.check)("lastName").not().isEmpty().withMessage("Last name is required"),
        (0, express_validator_1.check)("phoneNumber")
            .isMobilePhone("any")
            .withMessage("Invalid phone number")
            .custom((value) => {
            if (value && !value.startsWith("+")) {
                throw new Error("Phone number must start with '+'");
            }
            return true;
        }),
    ];
};
exports.registrationValidationRules = registrationValidationRules;
// Verification validation rules
const verificationValidationRules = () => {
    return [
        (0, express_validator_1.check)("email").isEmail().withMessage("Please provide a valid email"),
        (0, express_validator_1.check)("otpCode")
            .isLength({ min: 6, max: 6 })
            .withMessage("OTP code must be exactly 6 digits")
            .isNumeric()
            .withMessage("OTP code must be numeric"),
    ];
};
exports.verificationValidationRules = verificationValidationRules;
// Login validation rules
const loginValidationRules = () => {
    return [
        (0, express_validator_1.check)("email").isEmail().withMessage("Please provide a valid email"),
        (0, express_validator_1.check)("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
    ];
};
exports.loginValidationRules = loginValidationRules;
// Login validation rules
const resendVerificationValidationRules = () => {
    return [(0, express_validator_1.check)("email").isEmail().withMessage("Please provide a valid email")];
};
exports.resendVerificationValidationRules = resendVerificationValidationRules;
// Forgot password validation rules
const forgotPasswordValidationRules = () => {
    return [(0, express_validator_1.check)("email").isEmail().withMessage("Please provide a valid email")];
};
exports.forgotPasswordValidationRules = forgotPasswordValidationRules;
// Reset password validation rules
const resetPasswordValidationRules = () => {
    return [
        (0, express_validator_1.check)("otpCode").not().isEmpty().withMessage("Reset code is required"),
        (0, express_validator_1.check)("newPassword")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters"),
        (0, express_validator_1.check)("confirmPassword").custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match");
            }
            return true;
        }),
    ];
};
exports.resetPasswordValidationRules = resetPasswordValidationRules;
// Password update validation rules
const updatePasswordValidationRules = () => {
    return [
        (0, express_validator_1.check)("oldPassword").notEmpty().withMessage("Old password is required."), // Check for old password
        (0, express_validator_1.check)("newPassword")
            .notEmpty()
            .withMessage("New password is required.") // Check for new password
            .isLength({ min: 6 })
            .withMessage("New password must be at least 6 characters long."), // Ensure minimum length
        (0, express_validator_1.check)("confirmNewPassword")
            .notEmpty()
            .withMessage("Confirmation password is required.") // Check for confirmation password
            .custom((value, { req }) => {
            if (value !== req.body.newPassword) {
                throw new Error("Passwords must match"); // Check for matching passwords
            }
            return true;
        }),
    ];
};
exports.updatePasswordValidationRules = updatePasswordValidationRules;
const updateProfileEmailValidationRules = () => {
    return [
        (0, express_validator_1.check)("newEmail").isEmail().withMessage("Please provide a valid email"),
    ];
};
exports.updateProfileEmailValidationRules = updateProfileEmailValidationRules;
const confirmProfileEmailValidationRules = () => {
    return [
        (0, express_validator_1.check)("newEmail").isEmail().withMessage("Please provide a valid email"),
        (0, express_validator_1.check)("otpCode")
            .isLength({ min: 6, max: 6 })
            .withMessage("OTP code must be exactly 6 digits")
            .isNumeric()
            .withMessage("OTP code must be numeric"),
    ];
};
exports.confirmProfileEmailValidationRules = confirmProfileEmailValidationRules;
const updateProfilePhoneNumberValidationRules = () => {
    return [
        (0, express_validator_1.check)("newPhoneNumber")
            .optional()
            .isMobilePhone("any")
            .withMessage("Invalid phone number")
            .custom((value) => {
            if (value && !value.startsWith("+")) {
                throw new Error("Phone number must start with '+'");
            }
            return true;
        }),
    ];
};
exports.updateProfilePhoneNumberValidationRules = updateProfilePhoneNumberValidationRules;
const confirmProfilePhoneNumberValidationRules = () => {
    return [
        (0, express_validator_1.check)("newPhoneNumber")
            .optional()
            .isMobilePhone("any")
            .withMessage("Invalid phone number")
            .custom((value) => {
            if (value && !value.startsWith("+")) {
                throw new Error("New phone number must start with '+'");
            }
            return true;
        }),
        (0, express_validator_1.check)("otpCode")
            .isLength({ min: 6, max: 6 })
            .withMessage("OTP code must be exactly 6 digits")
            .isNumeric()
            .withMessage("OTP code must be numeric"),
    ];
};
exports.confirmProfilePhoneNumberValidationRules = confirmProfilePhoneNumberValidationRules;
// Admin
// Update Email validation rules
const adminUpdateProfileValidationRules = () => {
    return [(0, express_validator_1.check)("email").isEmail().withMessage("Please provide a valid email")];
};
exports.adminUpdateProfileValidationRules = adminUpdateProfileValidationRules;
const createSubAdminValidationRules = () => {
    return [
        (0, express_validator_1.check)("name")
            .not()
            .isEmpty()
            .withMessage("Name is required")
            .isLength({ min: 2 })
            .withMessage("Name must be at least 2 characters"),
        (0, express_validator_1.check)("email").isEmail().withMessage("Please provide a valid email"),
        (0, express_validator_1.check)("roleId")
            .not()
            .isEmpty()
            .withMessage("Role ID is required and must be a valid UUID"),
    ];
};
exports.createSubAdminValidationRules = createSubAdminValidationRules;
// Validation rules for updating sub-admin
const updateSubAdminValidationRules = () => {
    return [
        (0, express_validator_1.check)("subAdminId")
            .not()
            .isEmpty()
            .withMessage("Sub-admin ID is required")
            .isUUID()
            .withMessage("Sub-admin ID must be a valid UUID"),
        (0, express_validator_1.check)("name")
            .not()
            .isEmpty()
            .withMessage("Name is required")
            .isLength({ min: 2, max: 50 })
            .withMessage("Name must be between 2 and 50 characters"),
        (0, express_validator_1.check)("email").isEmail().withMessage("Please provide a valid email"),
        (0, express_validator_1.check)("roleId")
            .not()
            .isEmpty()
            .withMessage("Role ID is required")
            .isUUID()
            .withMessage("Role ID must be a valid UUID"),
    ];
};
exports.updateSubAdminValidationRules = updateSubAdminValidationRules;
// Validation rules for creating a subscription plan
const createSubscriptionPlanValidationRules = () => {
    return [
        (0, express_validator_1.check)("name")
            .not()
            .isEmpty()
            .withMessage("Plan name is required")
            .isLength({ min: 2, max: 50 })
            .withMessage("Plan name must be between 2 and 50 characters"),
        (0, express_validator_1.check)("duration")
            .not()
            .isEmpty()
            .withMessage("Duration is required")
            .isInt({ min: 1 })
            .withMessage("Duration must be a positive integer representing months"),
        (0, express_validator_1.check)("price")
            .not()
            .isEmpty()
            .withMessage("Price is required")
            .isFloat({ min: 0 })
            .withMessage("Price must be a non-negative number"),
        (0, express_validator_1.check)("productLimit")
            .not()
            .isEmpty()
            .withMessage("Product limit is required")
            .isInt({ min: 0 })
            .withMessage("Product limit must be a non-negative integer"),
        (0, express_validator_1.check)("allowsAuction")
            .isBoolean()
            .withMessage("Allows auction must be a boolean value"),
        (0, express_validator_1.check)("auctionProductLimit")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Auction product limit must be a non-negative integer"),
    ];
};
exports.createSubscriptionPlanValidationRules = createSubscriptionPlanValidationRules;
// Validation rules for updating a subscription plan
const updateSubscriptionPlanValidationRules = () => {
    return [
        (0, express_validator_1.check)("planId")
            .not()
            .isEmpty()
            .withMessage("Plan ID is required")
            .isUUID()
            .withMessage("Plan ID must be a valid UUID"),
        (0, express_validator_1.check)("name")
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage("Plan name must be between 2 and 50 characters"),
        (0, express_validator_1.check)("duration")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Duration must be a positive integer representing months"),
        (0, express_validator_1.check)("price")
            .optional()
            .isFloat({ min: 0 })
            .withMessage("Price must be a non-negative number"),
        (0, express_validator_1.check)("productLimit")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Product limit must be a non-negative integer"),
        (0, express_validator_1.check)("allowsAuction")
            .optional()
            .isBoolean()
            .withMessage("Allows auction must be a boolean value"),
        (0, express_validator_1.check)("auctionProductLimit")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Auction product limit must be a non-negative integer"),
    ];
};
exports.updateSubscriptionPlanValidationRules = updateSubscriptionPlanValidationRules;
const kycValidationRules = () => {
    return [
        (0, express_validator_1.check)("businessName")
            .not()
            .isEmpty()
            .withMessage("Business name is required")
            .isLength({ min: 2, max: 100 })
            .withMessage("Business name must be between 2 and 100 characters"),
        (0, express_validator_1.check)("contactEmail")
            .not()
            .isEmpty()
            .withMessage("Contact email is required")
            .isEmail()
            .withMessage("Contact email must be a valid email"),
        (0, express_validator_1.check)("contactPhoneNumber")
            .not()
            .isEmpty()
            .withMessage("Contact phone number is required")
            .isLength({ min: 10, max: 15 })
            .withMessage("Contact phone number must be between 10 and 15 digits"),
        (0, express_validator_1.check)("businessDescription")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Business description must be less than 500 characters"),
        (0, express_validator_1.check)("businessLink")
            .optional()
            .isURL()
            .withMessage("Business link must be a valid URL"),
        (0, express_validator_1.check)("businessRegistrationNumber")
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage("Business registration number must be between 2 and 50 characters"),
        (0, express_validator_1.check)("taxIdentificationNumber")
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage("Tax identification number must be between 2 and 50 characters"),
        (0, express_validator_1.check)("idVerification.name")
            .optional()
            .isLength({ min: 2, max: 50 })
            .withMessage("ID verification name must be between 2 and 50 characters"),
        (0, express_validator_1.check)("idVerification.photoFront")
            .optional()
            .isURL()
            .withMessage("Front of ID verification must be a valid URL"),
        (0, express_validator_1.check)("idVerification.photoBack")
            .optional()
            .isURL()
            .withMessage("Back of ID verification must be a valid URL"),
        (0, express_validator_1.check)("certificateOfIncorporation")
            .optional()
            .isURL()
            .withMessage("Certificate of Incorporation must be a valid URL"),
    ];
};
exports.kycValidationRules = kycValidationRules;
const validateKYCNotification = () => {
    return [
        (0, express_validator_1.check)("isVerified")
            .isBoolean()
            .withMessage("Approval status is required and must be a boolean"),
        (0, express_validator_1.check)("adminNote")
            .optional()
            .isLength({ max: 500 })
            .withMessage("Admin note must not exceed 500 characters"),
    ];
};
exports.validateKYCNotification = validateKYCNotification;
const createStoreValidation = () => {
    return [
        (0, express_validator_1.check)("name")
            .isString()
            .isLength({ min: 1 })
            .withMessage("Store name is required."),
        (0, express_validator_1.check)("location")
            .optional()
            .isObject()
            .withMessage("Location must be a valid object."),
        (0, express_validator_1.check)("businessHours")
            .optional()
            .isObject()
            .withMessage("Business hours must be a valid object."),
        (0, express_validator_1.check)("deliveryOptions")
            .optional()
            .isArray()
            .withMessage("Delivery options must be an array.")
            .custom((value) => {
            for (const option of value) {
                if (typeof option !== "object" || option === null) {
                    throw new Error("Each delivery option must be a valid object.");
                }
                if (!option.city || typeof option.city !== "string") {
                    throw new Error("City must be a string.");
                }
                if (option.price === undefined || typeof option.price !== "number") {
                    throw new Error("Price must be a number.");
                }
                if (!option.arrival_day || typeof option.arrival_day !== "string") {
                    throw new Error("Arrival day must be a string.");
                }
            }
            return true; // if all checks pass
        }),
        (0, express_validator_1.check)("logo")
            .optional()
            .isString()
            .withMessage("Logo must be a valid string."),
        (0, express_validator_1.check)("tipsOnFinding")
            .optional()
            .isString()
            .withMessage("Tips on finding the store must be a string."),
    ];
};
exports.createStoreValidation = createStoreValidation;
const updateStoreValidation = () => {
    return [
        (0, express_validator_1.check)("storeId").isUUID().withMessage("Store ID must be a valid UUID."),
        (0, express_validator_1.check)("name")
            .optional()
            .isString()
            .isLength({ min: 1 })
            .withMessage("Store name must be a non-empty string."),
        (0, express_validator_1.check)("location")
            .optional()
            .isObject()
            .withMessage("Location must be a valid object."),
        (0, express_validator_1.check)("businessHours")
            .optional()
            .isObject()
            .withMessage("Business hours must be a valid object."),
        (0, express_validator_1.check)("deliveryOptions")
            .optional()
            .isArray()
            .withMessage("Delivery options must be an array.")
            .custom((value) => {
            for (const option of value) {
                if (typeof option !== "object" || option === null) {
                    throw new Error("Each delivery option must be a valid object.");
                }
                if (!option.city || typeof option.city !== "string") {
                    throw new Error("City must be a string.");
                }
                if (option.price === undefined || typeof option.price !== "number") {
                    throw new Error("Price must be a number.");
                }
                if (!option.arrival_day || typeof option.arrival_day !== "string") {
                    throw new Error("Arrival day must be a string.");
                }
            }
            return true; // if all checks pass
        }),
        (0, express_validator_1.check)("tipsOnFinding")
            .optional()
            .isString()
            .withMessage("Tips on finding the store must be a string."),
    ];
};
exports.updateStoreValidation = updateStoreValidation;
// Validation for adding a product
const addProductValidation = () => {
    return [
        (0, express_validator_1.check)("storeId").isUUID().withMessage("Store ID must be a valid UUID."),
        (0, express_validator_1.check)("categoryId")
            .isUUID()
            .withMessage("Category ID must be a valid UUID."),
        (0, express_validator_1.check)("name")
            .isString()
            .isLength({ min: 1 })
            .withMessage("Product name is required and must be a non-empty string."),
        (0, express_validator_1.check)("condition")
            .isIn(["brand_new", "fairly_used", "fairly_foreign", "refurbished"])
            .withMessage("Condition must be one of the specified values."),
        (0, express_validator_1.check)("description")
            .optional()
            .isString()
            .withMessage("Description must be a string."),
        (0, express_validator_1.check)("specification")
            .optional()
            .isString()
            .withMessage("Specification must be a string."),
        (0, express_validator_1.check)("price")
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Price must be a valid decimal number with up to two decimal places."),
        (0, express_validator_1.check)("discount_price")
            .optional()
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Discount price must be a valid decimal number with up to two decimal places if provided."),
        (0, express_validator_1.check)("image_url")
            .optional()
            .isString()
            .withMessage("Image URL must be a valid string."),
        (0, express_validator_1.check)("additional_images")
            .optional()
            .isArray({ min: 1 })
            .withMessage("Additional images must be an array of URLs.")
            .custom((array) => {
            // Ensure each item in the array is a valid URL
            array.forEach((url) => {
                if (typeof url !== "string" ||
                    !url.match(/^(http|https):\/\/[^ "]+$/)) {
                    throw new Error("Each item in additional images must be a valid URL.");
                }
            });
            return true;
        }),
        (0, express_validator_1.check)("warranty")
            .optional()
            .isString()
            .withMessage("Warranty must be a valid string."),
        (0, express_validator_1.check)("return_policy")
            .optional()
            .isString()
            .withMessage("Return policy must be a valid string."),
        (0, express_validator_1.check)("seo_title")
            .optional()
            .isString()
            .withMessage("SEO title must be a valid string."),
        (0, express_validator_1.check)("meta_description")
            .optional()
            .isString()
            .withMessage("Meta description must be a valid string."),
        (0, express_validator_1.check)("keywords")
            .optional()
            .isString()
            .withMessage("Keywords must be a valid string."),
        (0, express_validator_1.check)("status")
            .optional()
            .isIn(["active", "inactive", "draft"])
            .withMessage("Status must be one of the specified values."),
    ];
};
exports.addProductValidation = addProductValidation;
// Validation for updating a product
const updateProductValidation = () => {
    return [
        (0, express_validator_1.check)("productId")
            .isString()
            .withMessage("Product ID must be a valid UUID or SKU."),
        (0, express_validator_1.check)("name")
            .optional()
            .isString()
            .isLength({ min: 1 })
            .withMessage("Product name must be a non-empty string."),
        (0, express_validator_1.check)("condition")
            .optional()
            .isIn(["brand_new", "fairly_used", "fairly_foreign", "refurbished"])
            .withMessage("Condition must be one of the specified values."),
        (0, express_validator_1.check)("description")
            .optional()
            .isString()
            .withMessage("Description must be a string."),
        (0, express_validator_1.check)("specification")
            .optional()
            .isString()
            .withMessage("Specification must be a string."),
        (0, express_validator_1.check)("price")
            .optional()
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Price must be a valid decimal number with up to two decimal places."),
        (0, express_validator_1.check)("discount_price")
            .optional()
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Discount price must be a valid decimal number with up to two decimal places if provided."),
        (0, express_validator_1.check)("image_url")
            .optional()
            .isString()
            .withMessage("Image URL must be a valid string."),
        (0, express_validator_1.check)("additional_images")
            .optional()
            .isArray({ min: 1 })
            .withMessage("Additional images must be an array of URLs.")
            .custom((array) => {
            // Ensure each item in the array is a valid URL
            array.forEach((url) => {
                if (typeof url !== "string" ||
                    !url.match(/^(http|https):\/\/[^ "]+$/)) {
                    throw new Error("Each item in additional images must be a valid URL.");
                }
            });
            return true;
        }),
        (0, express_validator_1.check)("warranty")
            .optional()
            .isString()
            .withMessage("Warranty must be a valid string."),
        (0, express_validator_1.check)("return_policy")
            .optional()
            .isString()
            .withMessage("Return policy must be a valid string."),
        (0, express_validator_1.check)("seo_title")
            .optional()
            .isString()
            .withMessage("SEO title must be a valid string."),
        (0, express_validator_1.check)("meta_description")
            .optional()
            .isString()
            .withMessage("Meta description must be a valid string."),
        (0, express_validator_1.check)("keywords")
            .optional()
            .isString()
            .withMessage("Keywords must be a valid string."),
        (0, express_validator_1.check)("status")
            .optional()
            .isIn(["active", "inactive", "draft"])
            .withMessage("Status must be one of the specified values."),
    ];
};
exports.updateProductValidation = updateProductValidation;
const auctionProductValidation = () => {
    return [
        (0, express_validator_1.check)("storeId").isUUID().withMessage("Store ID must be a valid UUID."),
        (0, express_validator_1.check)("categoryId")
            .isUUID()
            .withMessage("Category ID must be a valid UUID."),
        (0, express_validator_1.check)("name")
            .isString()
            .isLength({ min: 1 })
            .withMessage("Product name is required and must be a non-empty string."),
        (0, express_validator_1.check)("condition")
            .isIn(["brand_new", "fairly_used", "fairly_foreign", "refurbished"])
            .withMessage("Condition must be one of the specified values."),
        (0, express_validator_1.check)("description")
            .isString()
            .withMessage("Description must be a valid string."),
        (0, express_validator_1.check)("specification")
            .isString()
            .withMessage("Specification must be a valid string."),
        (0, express_validator_1.check)("price")
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Price must be a valid decimal number with up to two decimal places."),
        (0, express_validator_1.check)("bidIncrement")
            .optional()
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Bid increment must be a valid decimal number with up to two decimal places."),
        (0, express_validator_1.check)("maxBidsPerUser")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Max bids per user must be a valid integer greater than or equal to 1."),
        (0, express_validator_1.check)("participantsInterestFee")
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Participants interest fee must be a valid decimal number with up to two decimal places."),
        (0, express_validator_1.check)("startDate")
            .isISO8601()
            .withMessage("Start date must be a valid date in ISO 8601 format."),
        (0, express_validator_1.check)("endDate")
            .isISO8601()
            .withMessage("End date must be a valid date in ISO 8601 format."),
        (0, express_validator_1.check)("image")
            .optional()
            .isString()
            .withMessage("Image must be a valid url."),
        (0, express_validator_1.check)("additionalImages")
            .optional()
            .isArray({ min: 1 })
            .withMessage("Additional images must be an array of URLs.")
            .custom((array) => {
            // Ensure each item in the array is a valid URL
            array.forEach((url) => {
                if (typeof url !== "string" ||
                    !url.match(/^(http|https):\/\/[^ "]+$/)) {
                    throw new Error("Each item in additional images must be a valid URL.");
                }
            });
            return true;
        }),
    ];
};
exports.auctionProductValidation = auctionProductValidation;
const updateAuctionProductValidation = () => {
    return [
        (0, express_validator_1.check)("auctionProductId")
            .isString()
            .withMessage("Auction Product ID must be a valid UUID or SKU."),
        (0, express_validator_1.check)("storeId").isUUID().withMessage("Store ID must be a valid UUID."),
        (0, express_validator_1.check)("categoryId")
            .isUUID()
            .withMessage("Category ID must be a valid UUID."),
        (0, express_validator_1.check)("name")
            .isString()
            .isLength({ min: 1 })
            .withMessage("Product name is required and must be a non-empty string."),
        (0, express_validator_1.check)("condition")
            .isIn(["brand_new", "fairly_used", "fairly_foreign", "refurbished"])
            .withMessage("Condition must be one of the specified values."),
        (0, express_validator_1.check)("description")
            .isString()
            .withMessage("Description must be a valid string."),
        (0, express_validator_1.check)("specification")
            .isString()
            .withMessage("Specification must be a valid string."),
        (0, express_validator_1.check)("price")
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Price must be a valid decimal number with up to two decimal places."),
        (0, express_validator_1.check)("bidIncrement")
            .optional()
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Bid increment must be a valid decimal number with up to two decimal places."),
        (0, express_validator_1.check)("maxBidsPerUser")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Max bids per user must be a valid integer greater than or equal to 1."),
        (0, express_validator_1.check)("participantsInterestFee")
            .isDecimal({ decimal_digits: "0,2" })
            .withMessage("Participants interest fee must be a valid decimal number with up to two decimal places."),
        (0, express_validator_1.check)("startDate")
            .isISO8601()
            .withMessage("Start date must be a valid date in ISO 8601 format."),
        (0, express_validator_1.check)("endDate")
            .isISO8601()
            .withMessage("End date must be a valid date in ISO 8601 format."),
        (0, express_validator_1.check)("image")
            .optional()
            .isString()
            .withMessage("Image must be a valid url."),
        (0, express_validator_1.check)("additionalImages")
            .optional()
            .isArray({ min: 1 })
            .withMessage("Additional images must be an array of URLs.")
            .custom((array) => {
            // Ensure each item in the array is a valid URL
            array.forEach((url) => {
                if (typeof url !== "string" ||
                    !url.match(/^(http|https):\/\/[^ "]+$/)) {
                    throw new Error("Each item in additional images must be a valid URL.");
                }
            });
            return true;
        }),
    ];
};
exports.updateAuctionProductValidation = updateAuctionProductValidation;
const validatePaymentGateway = () => {
    return [
        (0, express_validator_1.check)("name")
            .isString()
            .withMessage("Name is required and must be a string")
            .isLength({ max: 100 })
            .withMessage("Name should not exceed 100 characters"),
        (0, express_validator_1.check)("publicKey")
            .isString()
            .withMessage("Public key is required and must be a string"),
        (0, express_validator_1.check)("secretKey")
            .isString()
            .withMessage("Secret key is required and must be a string"),
    ];
};
exports.validatePaymentGateway = validatePaymentGateway;
const validateSendMessage = () => {
    return [
        // Validate productId
        (0, express_validator_1.check)("productId")
            .isString()
            .withMessage("Product ID is required and must be a string")
            .isUUID()
            .withMessage("Product ID must be a valid UUID"),
        // Validate receiverId
        (0, express_validator_1.check)("receiverId")
            .isString()
            .withMessage("Receiver ID is required and must be a string")
            .isUUID()
            .withMessage("Receiver ID must be a valid UUID"),
        // Validate content
        (0, express_validator_1.check)("content")
            .isString()
            .withMessage("Content is required and must be a string")
            .isLength({ min: 10 })
            .withMessage("Content cannot be empty")
            .isLength({ max: 1000 })
            .withMessage("Content should not exceed 1000 characters"),
        // Validate fileUrl (Optional)
        (0, express_validator_1.check)("fileUrl")
            .optional()
            .isURL()
            .withMessage("File URL must be a valid URL"),
        // Custom validation to ensure at least one of content or fileUrl is provided
        (0, express_validator_1.check)("content")
            .custom((value, { req }) => {
            const fileUrl = req.body.fileUrl;
            if (!value && !fileUrl) {
                throw new Error("Either content or fileUrl must be provided");
            }
            return true; // Everything is fine
        })
            .withMessage("Content or fileUrl is required"),
    ];
};
exports.validateSendMessage = validateSendMessage;
const validatePlaceBid = () => {
    return [
        // Validate auctionProductId
        (0, express_validator_1.check)("auctionProductId")
            .isString()
            .withMessage("Auction product ID is required and must be a string")
            .isUUID()
            .withMessage("Auction product ID must be a valid UUID"),
        // Validate bidAmount
        (0, express_validator_1.check)("bidAmount")
            .isNumeric()
            .withMessage("BidAmount is required and must be a numerical value")
    ];
};
exports.validatePlaceBid = validatePlaceBid;
const validateAddItemToCart = () => {
    return [
        // Validate productId
        (0, express_validator_1.check)("productId")
            .isString()
            .withMessage("Product ID is required and must be a string")
            .isUUID()
            .withMessage("Product ID is required and must be a valid UUID"),
        // Validate quantity
        (0, express_validator_1.check)("quantity")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Quantity must be a positive integer"),
    ];
};
exports.validateAddItemToCart = validateAddItemToCart;
const validateUpdateCartItem = () => {
    return [
        // Validate cartId
        (0, express_validator_1.check)("cartId")
            .isString()
            .withMessage("Cart ID is required and must be a string")
            .isUUID()
            .withMessage("Cart ID is required and must be a valid UUID"),
        // Validate quantity
        (0, express_validator_1.check)("quantity")
            .isInt({ min: 1 })
            .withMessage("Quantity must be a positive integer"),
    ];
};
exports.validateUpdateCartItem = validateUpdateCartItem;
const validateShowInterest = () => {
    return [
        (0, express_validator_1.check)("auctionProductId")
            .isString()
            .withMessage("Auction product ID is required and must be a string")
            .isUUID()
            .withMessage("Auction product ID must be a valid UUID"),
        (0, express_validator_1.check)("amountPaid")
            .isNumeric()
            .withMessage("Amount paid is required and must be a numeric value"),
    ];
};
exports.validateShowInterest = validateShowInterest;
const createAdvertValidation = () => {
    return [
        (0, express_validator_1.check)("categoryId")
            .isUUID()
            .withMessage("Category ID must be a valid UUID."),
        (0, express_validator_1.check)("title")
            .isString()
            .isLength({ min: 1 })
            .withMessage("Advert title is required."),
        (0, express_validator_1.check)("description")
            .isString()
            .isLength({ min: 1 })
            .withMessage("Advert description is required."),
        (0, express_validator_1.check)("media_url")
            .optional()
            .isString()
            .withMessage("Media URL must be a valid string."),
        (0, express_validator_1.check)("status")
            .optional()
            .isIn(['pending', 'approved', 'rejected'])
            .withMessage("Status must be one of 'pending', 'approved', or 'rejected'."),
        (0, express_validator_1.check)("productId")
            .optional()
            .isUUID()
            .withMessage("Product ID must be a valid UUID."),
    ];
};
exports.createAdvertValidation = createAdvertValidation;
const updateAdvertValidation = () => {
    return [
        (0, express_validator_1.check)("title")
            .optional()
            .isString()
            .withMessage("Advert title must be a valid string."),
        (0, express_validator_1.check)("description")
            .optional()
            .isString()
            .withMessage("Advert description must be a valid string."),
        (0, express_validator_1.check)("media_url")
            .optional()
            .isString()
            .withMessage("Media URL must be a valid string."),
        (0, express_validator_1.check)("status")
            .optional()
            .isIn(['pending', 'approved', 'rejected'])
            .withMessage("Status must be one of 'pending', 'approved', or 'rejected'."),
        (0, express_validator_1.check)("productId")
            .optional()
            .isUUID()
            .withMessage("Product ID must be a valid UUID."),
    ];
};
exports.updateAdvertValidation = updateAdvertValidation;
// Middleware to handle validation errors, sending only the first error
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        // Return only the first error
        const firstError = errors.array()[0];
        res.status(400).json({ message: firstError.msg });
        return;
    }
    next();
};
exports.validate = validate;
//# sourceMappingURL=validations.js.map