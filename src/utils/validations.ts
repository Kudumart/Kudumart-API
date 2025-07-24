import { check, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Validation rules for different functionalities

// Registration validation rules
export const registrationValidationRules = () => {
	return [
		check("email").isEmail().withMessage("Please provide a valid email"),
		check("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters"),
		check("firstName").not().isEmpty().withMessage("First name is required"),
		check("lastName").not().isEmpty().withMessage("Last name is required"),
		check("platform")
			.optional()
			.isString()
			.withMessage("Platform must be a string")
			.isIn(["mobile", "web"])
			.withMessage('Platform must be either "mobile" or "web"'),
		check("phoneNumber")
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

// Verification validation rules
export const verificationValidationRules = () => {
	return [
		check("email").isEmail().withMessage("Please provide a valid email"),
		check("otpCode")
			.isLength({ min: 6, max: 6 })
			.withMessage("OTP code must be exactly 6 digits")
			.isNumeric()
			.withMessage("OTP code must be numeric"),
	];
};

export const verificationTokenValidationRules = () => {
	return [
		check("email").isEmail().withMessage("Please provide a valid email"),
		check("token").notEmpty().withMessage("Please provide a token"),
	];
};

// Login validation rules
export const loginValidationRules = () => {
	return [
		check("email").isEmail().withMessage("Please provide a valid email"),
		check("password")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters"),
	];
};

// Login validation rules
export const resendVerificationValidationRules = () => {
	return [
		check("email").isEmail().withMessage("Please provide a valid email"),
		check("platform")
			.optional()
			.isString()
			.withMessage("Platform must be a string")
			.isIn(["mobile", "web"])
			.withMessage('Platform must be either "mobile" or "web"'),
	];
};

// Forgot password validation rules
export const forgotPasswordValidationRules = () => {
	return [check("email").isEmail().withMessage("Please provide a valid email")];
};

// Reset password validation rules
export const resetPasswordValidationRules = () => {
	return [
		check("otpCode").not().isEmpty().withMessage("Reset code is required"),
		check("newPassword")
			.isLength({ min: 6 })
			.withMessage("Password must be at least 6 characters"),
		check("confirmPassword").custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error("Passwords do not match");
			}
			return true;
		}),
	];
};

// Password update validation rules
export const updatePasswordValidationRules = () => {
	return [
		check("oldPassword")
			.notEmpty()
			.withMessage("Old password is required."), // Check for old password

		check("newPassword")
			.notEmpty()
			.withMessage("New password is required.") // Check for new password
			.isLength({ min: 6 })
			.withMessage("New password must be at least 6 characters long."), // Ensure minimum length

		check("confirmNewPassword")
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

export const updateProfileEmailValidationRules = () => {
	return [
		check("newEmail").isEmail().withMessage("Please provide a valid email"),
	];
};

export const confirmProfileEmailValidationRules = () => {
	return [
		check("newEmail").isEmail().withMessage("Please provide a valid email"),
		check("otpCode")
			.isLength({ min: 6, max: 6 })
			.withMessage("OTP code must be exactly 6 digits")
			.isNumeric()
			.withMessage("OTP code must be numeric"),
	];
};

export const updateProfilePhoneNumberValidationRules = () => {
	return [
		check("newPhoneNumber")
			.optional({ checkFalsy: true })
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

export const confirmProfilePhoneNumberValidationRules = () => {
	return [
		check("newPhoneNumber")
			.optional({ checkFalsy: true })
			.isMobilePhone("any")
			.withMessage("Invalid phone number")
			.custom((value) => {
				if (value && !value.startsWith("+")) {
					throw new Error("New phone number must start with '+'");
				}
				return true;
			}),
		check("otpCode")
			.isLength({ min: 6, max: 6 })
			.withMessage("OTP code must be exactly 6 digits")
			.isNumeric()
			.withMessage("OTP code must be numeric"),
	];
};

// Admin
// Update Email validation rules
export const adminUpdateProfileValidationRules = () => {
	return [check("email").isEmail().withMessage("Please provide a valid email")];
};

export const createSubAdminValidationRules = () => {
	return [
		check("name")
			.not()
			.isEmpty()
			.withMessage("Name is required")
			.isLength({ min: 2 })
			.withMessage("Name must be at least 2 characters"),

		check("email").isEmail().withMessage("Please provide a valid email"),

		check("roleId")
			.not()
			.isEmpty()
			.withMessage("Role ID is required and must be a valid UUID"),
	];
};

// Validation rules for updating sub-admin
export const updateSubAdminValidationRules = () => {
	return [
		check("subAdminId")
			.not()
			.isEmpty()
			.withMessage("Sub-admin ID is required")
			.isUUID()
			.withMessage("Sub-admin ID must be a valid UUID"),

		check("name")
			.not()
			.isEmpty()
			.withMessage("Name is required")
			.isLength({ min: 2, max: 50 })
			.withMessage("Name must be between 2 and 50 characters"),

		check("email").isEmail().withMessage("Please provide a valid email"),

		check("roleId")
			.not()
			.isEmpty()
			.withMessage("Role ID is required")
			.isUUID()
			.withMessage("Role ID must be a valid UUID"),
	];
};

// Validation rules for creating a subscription plan
export const createSubscriptionPlanValidationRules = () => {
	return [
		check("currencyId")
			.not()
			.isEmpty()
			.withMessage("Currency ID is required")
			.isUUID()
			.withMessage("Currency ID must be a valid UUID"),

		check("name")
			.not()
			.isEmpty()
			.withMessage("Plan name is required")
			.isLength({ min: 2, max: 50 })
			.withMessage("Plan name must be between 2 and 50 characters"),

		check("duration")
			.not()
			.isEmpty()
			.withMessage("Duration is required")
			.isInt({ min: 1 })
			.withMessage("Duration must be a positive integer representing months"),

		check("price")
			.not()
			.isEmpty()
			.withMessage("Price is required")
			.isFloat({ min: 0 })
			.withMessage("Price must be a non-negative number"),

		check("productLimit")
			.not()
			.isEmpty()
			.withMessage("Product limit is required")
			.isInt({ min: 0 })
			.withMessage("Product limit must be a non-negative integer"),

		check("allowsAuction")
			.isBoolean()
			.withMessage("Allows auction must be a boolean value"),

		check("auctionProductLimit")
			.optional({ checkFalsy: true })
			.isInt({ min: 0 })
			.withMessage("Auction product limit must be a non-negative integer"),
	];
};

// Validation rules for updating a subscription plan
export const updateSubscriptionPlanValidationRules = () => {
	return [
		check("planId")
			.not()
			.isEmpty()
			.withMessage("Plan ID is required")
			.isUUID()
			.withMessage("Plan ID must be a valid UUID"),

		check("name")
			.optional({ checkFalsy: true })
			.isLength({ min: 2, max: 50 })
			.withMessage("Plan name must be between 2 and 50 characters"),

		check("duration")
			.optional({ checkFalsy: true })
			.isInt({ min: 1 })
			.withMessage("Duration must be a positive integer representing months"),

		check("price")
			.optional({ checkFalsy: true })
			.isFloat({ min: 0 })
			.withMessage("Price must be a non-negative number"),

		check("productLimit")
			.optional({ checkFalsy: true })
			.isInt({ min: 0 })
			.withMessage("Product limit must be a non-negative integer"),

		check("allowsAuction")
			.optional({ checkFalsy: true })
			.isBoolean()
			.withMessage("Allows auction must be a boolean value"),

		check("auctionProductLimit")
			.optional({ checkFalsy: true })
			.isInt({ min: 0 })
			.withMessage("Auction product limit must be a non-negative integer"),
	];
};

export const kycValidationRules = () => {
	return [
		check("businessName")
			.not()
			.isEmpty()
			.withMessage("Business name is required")
			.isLength({ min: 2, max: 100 })
			.withMessage("Business name must be between 2 and 100 characters"),

		check("contactEmail")
			.not()
			.isEmpty()
			.withMessage("Contact email is required")
			.isEmail()
			.withMessage("Contact email must be a valid email"),

		check("contactPhoneNumber")
			.not()
			.isEmpty()
			.withMessage("Contact phone number is required")
			.isLength({ min: 10, max: 15 })
			.withMessage("Contact phone number must be between 10 and 15 digits"),

		check("businessDescription")
			.optional({ checkFalsy: true })
			.isLength({ max: 500 })
			.withMessage("Business description must be less than 500 characters"),

		check("businessLink")
			.optional({ checkFalsy: true })
			.isURL()
			.withMessage("Business link must be a valid URL"),

		check("businessRegistrationNumber")
			.optional({ checkFalsy: true })
			.isLength({ min: 2, max: 50 })
			.withMessage(
				"Business registration number must be between 2 and 50 characters",
			),

		check("taxIdentificationNumber")
			.optional({ checkFalsy: true })
			.isLength({ min: 2, max: 50 })
			.withMessage(
				"Tax identification number must be between 2 and 50 characters",
			),

		check("idVerification.name")
			.optional({ checkFalsy: true })
			.isLength({ min: 2, max: 50 })
			.withMessage("ID verification name must be between 2 and 50 characters"),

		check("idVerification.photoFront")
			.optional({ checkFalsy: true })
			.isURL()
			.withMessage("Front of ID verification must be a valid URL"),

		check("idVerification.photoBack")
			.optional({ checkFalsy: true })
			.isURL()
			.withMessage("Back of ID verification must be a valid URL"),

		check("certificateOfIncorporation")
			.optional({ checkFalsy: true })
			.isURL()
			.withMessage("Certificate of Incorporation must be a valid URL"),
	];
};

export const validateKYCNotification = () => {
	return [
		check("isVerified")
			.isBoolean()
			.withMessage("Approval status is required and must be a boolean"),

		check("adminNote")
			.optional({ checkFalsy: true })
			.isLength({ max: 500 })
			.withMessage("Admin note must not exceed 500 characters"),
	];
};

export const createStoreValidation = () => {
	return [
		check("name")
			.isString()
			.isLength({ min: 1 })
			.withMessage("Store name is required."),
		check("location")
			.optional({ checkFalsy: true })
			.isObject()
			.withMessage("Location must be a valid object."),
		check("businessHours")
			.optional({ checkFalsy: true })
			.isObject()
			.withMessage("Business hours must be a valid object."),
		check("deliveryOptions")
			.optional({ checkFalsy: true })
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
		check("logo")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Logo must be a valid string."),
		check("tipsOnFinding")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Tips on finding the store must be a string."),
	];
};

export const updateStoreValidation = () => {
	return [
		check("storeId").isUUID().withMessage("Store ID must be a valid UUID."),
		check("name")
			.optional({ checkFalsy: true })
			.isString()
			.isLength({ min: 1 })
			.withMessage("Store name must be a non-empty string."),
		check("location")
			.optional({ checkFalsy: true })
			.isObject()
			.withMessage("Location must be a valid object."),
		check("businessHours")
			.optional({ checkFalsy: true })
			.isObject()
			.withMessage("Business hours must be a valid object."),
		check("deliveryOptions")
			.optional({ checkFalsy: true })
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
		check("tipsOnFinding")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Tips on finding the store must be a string."),
	];
};

// Validation for adding a product
export const addProductValidation = () => {
	return [
		check("storeId").isUUID().withMessage("Store ID must be a valid UUID."),
		check("categoryId")
			.isUUID()
			.withMessage("Category ID must be a valid UUID."),
		check("name")
			.isString()
			.isLength({ min: 1 })
			.withMessage("Product name is required and must be a non-empty string."),
		check("condition")
			.isIn(["brand_new", "fairly_used", "fairly_foreign", "refurbished"])
			.withMessage("Condition must be one of the specified values."),
		check("description")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Description must be a string."),
		check("specification")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Specification must be a string."),
		check("price")
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Price must be a valid decimal number with up to two decimal places.",
			),
		check("discount_price")
			.optional({ checkFalsy: true })
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Discount price must be a valid decimal number with up to two decimal places if provided.",
			),
		check("image_url")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Image URL must be a valid string."),
		check("additional_images")
			.optional({ checkFalsy: true })
			.isArray({ min: 1 })
			.withMessage("Additional images must be an array of URLs.")
			.custom((array) => {
				// Ensure each item in the array is a valid URL
				array.forEach((url: string) => {
					if (typeof url !== "string" || !url.match(/^(https):\/\/[^ "]+$/)) {
						throw new Error(
							"Each item in additional images must be a valid URL.",
						);
					}
				});
				return true;
			}),
		check("warranty")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Warranty must be a valid string."),
		check("return_policy")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Return policy must be a valid string."),
		check("seo_title")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("SEO title must be a valid string."),
		check("meta_description")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Meta description must be a valid string."),
		check("keywords")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Keywords must be a valid string."),
		check("status")
			.optional({ checkFalsy: true })
			.isIn(["active", "inactive", "draft"])
			.withMessage("Status must be one of the specified values."),
	];
};

// Validation for updating a product
export const updateProductValidation = () => {
	return [
		check("productId")
			.isString()
			.withMessage("Product ID must be a valid UUID or SKU."),
		check("name")
			.optional({ checkFalsy: true })
			.isString()
			.isLength({ min: 1 })
			.withMessage("Product name must be a non-empty string."),
		check("condition")
			.optional({ checkFalsy: true })
			.isIn(["brand_new", "fairly_used", "fairly_foreign", "refurbished"])
			.withMessage("Condition must be one of the specified values."),
		check("description")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Description must be a string."),
		check("specification")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Specification must be a string."),
		check("price")
			.optional({ checkFalsy: true })
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Price must be a valid decimal number with up to two decimal places.",
			),
		check("discount_price")
			.optional({ checkFalsy: true })
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Discount price must be a valid decimal number with up to two decimal places if provided.",
			),
		check("image_url")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Image URL must be a valid string."),
		check("additional_images")
			.optional({ checkFalsy: true })
			.isArray({ min: 1 })
			.withMessage("Additional images must be an array of URLs.")
			.custom((array) => {
				// Ensure each item in the array is a valid URL
				array.forEach((url: string) => {
					if (typeof url !== "string" || !url.match(/^(https):\/\/[^ "]+$/)) {
						throw new Error(
							"Each item in additional images must be a valid URL.",
						);
					}
				});
				return true;
			}),
		check("warranty")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Warranty must be a valid string."),
		check("return_policy")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Return policy must be a valid string."),
		check("seo_title")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("SEO title must be a valid string."),
		check("meta_description")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Meta description must be a valid string."),
		check("keywords")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Keywords must be a valid string."),
		check("status")
			.optional({ checkFalsy: true })
			.isIn(["active", "inactive", "draft"])
			.withMessage("Status must be one of the specified values."),
	];
};

export const auctionProductValidation = () => {
	return [
		check("storeId").isUUID().withMessage("Store ID must be a valid UUID."),
		check("categoryId")
			.isUUID()
			.withMessage("Category ID must be a valid UUID."),
		check("name")
			.isString()
			.isLength({ min: 1 })
			.withMessage("Product name is required and must be a non-empty string."),
		check("condition")
			.isIn(["brand_new", "fairly_used", "fairly_foreign", "refurbished"])
			.withMessage("Condition must be one of the specified values."),
		check("description")
			.isString()
			.withMessage("Description must be a valid string."),
		check("specification")
			.isString()
			.withMessage("Specification must be a valid string."),
		check("price")
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Price must be a valid decimal number with up to two decimal places.",
			),
		check("bidIncrement")
			.optional({ checkFalsy: true })
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Bid increment must be a valid decimal number with up to two decimal places.",
			),
		check("maxBidsPerUser")
			.optional({ checkFalsy: true })
			.isInt({ min: 1 })
			.withMessage(
				"Max bids per user must be a valid integer greater than or equal to 1.",
			),
		check("participantsInterestFee")
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Participants interest fee must be a valid decimal number with up to two decimal places.",
			),
		check("startDate")
			.isISO8601()
			.withMessage("Start date must be a valid date in ISO 8601 format."),
		check("endDate")
			.isISO8601()
			.withMessage("End date must be a valid date in ISO 8601 format."),
		check("image")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Image must be a valid url."),
		check("additionalImages")
			.optional({ checkFalsy: true })
			.isArray({ min: 1 })
			.withMessage("Additional images must be an array of URLs.")
			.custom((array) => {
				// Ensure each item in the array is a valid URL
				array.forEach((url: string) => {
					if (typeof url !== "string" || !url.match(/^(https):\/\/[^ "]+$/)) {
						throw new Error(
							"Each item in additional images must be a valid URL.",
						);
					}
				});
				return true;
			}),
	];
};

export const updateAuctionProductValidation = () => {
	return [
		check("auctionProductId")
			.isString()
			.withMessage("Auction Product ID must be a valid UUID or SKU."),
		check("storeId").isUUID().withMessage("Store ID must be a valid UUID."),
		check("categoryId")
			.isUUID()
			.withMessage("Category ID must be a valid UUID."),
		check("name")
			.isString()
			.isLength({ min: 1 })
			.withMessage("Product name is required and must be a non-empty string."),
		check("condition")
			.isIn(["brand_new", "fairly_used", "fairly_foreign", "refurbished"])
			.withMessage("Condition must be one of the specified values."),
		check("description")
			.isString()
			.withMessage("Description must be a valid string."),
		check("specification")
			.isString()
			.withMessage("Specification must be a valid string."),
		check("price")
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Price must be a valid decimal number with up to two decimal places.",
			),
		check("bidIncrement")
			.optional({ checkFalsy: true })
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Bid increment must be a valid decimal number with up to two decimal places.",
			),
		check("maxBidsPerUser")
			.optional({ checkFalsy: true })
			.isInt({ min: 1 })
			.withMessage(
				"Max bids per user must be a valid integer greater than or equal to 1.",
			),
		check("participantsInterestFee")
			.isDecimal({ decimal_digits: "0,2" })
			.withMessage(
				"Participants interest fee must be a valid decimal number with up to two decimal places.",
			),
		check("startDate")
			.isISO8601()
			.withMessage("Start date must be a valid date in ISO 8601 format."),
		check("endDate")
			.isISO8601()
			.withMessage("End date must be a valid date in ISO 8601 format."),
		check("image")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Image must be a valid url."),
		check("additionalImages")
			.optional({ checkFalsy: true })
			.isArray({ min: 1 })
			.withMessage("Additional images must be an array of URLs.")
			.custom((array) => {
				// Ensure each item in the array is a valid URL
				array.forEach((url: string) => {
					if (typeof url !== "string" || !url.match(/^(https):\/\/[^ "]+$/)) {
						throw new Error(
							"Each item in additional images must be a valid URL.",
						);
					}
				});
				return true;
			}),
	];
};

export const validatePaymentGateway = () => {
	return [
		check("name")
			.isString()
			.withMessage("Name is required and must be a string")
			.isLength({ max: 100 })
			.withMessage("Name should not exceed 100 characters"),

		check("publicKey")
			.isString()
			.withMessage("Public key is required and must be a string"),

		check("secretKey")
			.isString()
			.withMessage("Secret key is required and must be a string"),
	];
};

export const validateSendMessage = () => {
	return [
		// Validate productId
		check("productId")
			.isString()
			.withMessage("Product ID is required and must be a string")
			.isUUID()
			.withMessage("Product ID must be a valid UUID"),

		// Validate receiverId
		check("receiverId")
			.isString()
			.withMessage("Receiver ID is required and must be a string")
			.isUUID()
			.withMessage("Receiver ID must be a valid UUID"),

		// Validate content
		check("content")
			.isString()
			.withMessage("Content is required and must be a string")
			.isLength({ min: 1 })
			.withMessage("Content cannot be empty")
			.isLength({ max: 10000 })
			.withMessage("Content should not exceed 1000 characters"),

		// Validate fileUrl (Optional)
		check("fileUrl")
			.optional({ checkFalsy: true })
			.isURL()
			.withMessage("File URL must be a valid URL"),

		// Custom validation to ensure at least one of content or fileUrl is provided
		check("content")
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

export const validatePlaceBid = () => {
	return [
		// Validate auctionProductId
		check("auctionProductId")
			.isString()
			.withMessage("Auction product ID is required and must be a string")
			.isUUID()
			.withMessage("Auction product ID must be a valid UUID"),

		// Validate bidAmount
		check("bidAmount")
			.isNumeric()
			.withMessage("BidAmount is required and must be a numerical value"),
	];
};

export const validateAddItemToCart = () => {
	return [
		// Validate productId
		check("productId")
			.isString()
			.withMessage("Product ID is required and must be a string")
			.isUUID()
			.withMessage("Product ID is required and must be a valid UUID"),

		// Validate quantity
		check("quantity")
			.optional({ checkFalsy: true })
			.isInt({ min: 1 })
			.withMessage("Quantity must be a positive integer"),
	];
};

export const validateUpdateCartItem = () => {
	return [
		// Validate cartId
		check("cartId")
			.isString()
			.withMessage("Cart ID is required and must be a string")
			.isUUID()
			.withMessage("Cart ID is required and must be a valid UUID"),

		// Validate quantity
		check("quantity")
			.isInt({ min: 1 })
			.withMessage("Quantity must be a positive integer"),
	];
};

export const validateShowInterest = () => {
	return [
		check("auctionProductId")
			.isString()
			.withMessage("Auction product ID is required and must be a string")
			.isUUID()
			.withMessage("Auction product ID must be a valid UUID"),

		check("amountPaid")
			.isNumeric()
			.withMessage("Amount paid is required and must be a numeric value"),
	];
};

export const createAdvertValidation = () => {
	return [
		check("categoryId")
			.isUUID()
			.withMessage("Category ID must be a valid UUID."),
		check("title")
			.isString()
			.isLength({ min: 1 })
			.withMessage("Advert title is required."),
		check("description")
			.isString()
			.isLength({ min: 1 })
			.withMessage("Advert description is required."),
		check("media_url")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Media URL must be a valid string."),
		check("status")
			.optional({ checkFalsy: true })
			.isIn(["pending", "approved", "rejected"])
			.withMessage(
				"Status must be one of 'pending', 'approved', or 'rejected'.",
			),
		check("productId")
			.optional({ checkFalsy: true })
			.isUUID()
			.withMessage("Product ID must be a valid UUID."),
		check("showOnHomepage")
			.optional({ checkFalsy: true })
			.isBoolean()
			.withMessage("show on home page must be a boolean value"),
	];
};

export const updateAdvertValidation = () => {
	return [
		check("title")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Advert title must be a valid string."),
		check("description")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Advert description must be a valid string."),
		check("media_url")
			.optional({ checkFalsy: true })
			.isString()
			.withMessage("Media URL must be a valid string."),
		check("status")
			.optional({ checkFalsy: true })
			.isIn(["pending", "approved", "rejected"])
			.withMessage(
				"Status must be one of 'pending', 'approved', or 'rejected'.",
			),
		check("productId")
			.optional({ checkFalsy: true })
			.isUUID()
			.withMessage("Product ID must be a valid UUID."),
		check("showOnHomepage")
			.optional({ checkFalsy: true })
			.isBoolean()
			.withMessage("show on home page must be a boolean value"),
	];
};

export const postJobValidationRules = () => {
	return [
		check("title")
			.not()
			.isEmpty()
			.withMessage("Title is required")
			.isString()
			.withMessage("Title must be a valid string"),

		// check("company")
		//   .not()
		//   .isEmpty()
		//   .withMessage("Company name is required")
		//   .isString()
		//   .withMessage("Company name must be a valid string"),

		// check("logo")
		//   .not()
		//   .isEmpty()
		//   .withMessage("Logo is required")
		//   .isURL()
		//   .withMessage("Logo must be a valid URL"),

		check("workplaceType")
			.not()
			.isEmpty()
			.withMessage("Workplace type is required")
			.isIn(["remote", "on-site", "hybrid"])
			.withMessage("Workplace type must be one of: Remote, On-site, Hybrid"),

		check("location")
			.not()
			.isEmpty()
			.withMessage("Location is required")
			.isString()
			.withMessage("Location must be a valid string"),

		check("jobType")
			.not()
			.isEmpty()
			.withMessage("Job type is required")
			.isString()
			.withMessage("Job type must be a valid string"),

		check("description")
			.not()
			.isEmpty()
			.withMessage("Description is required")
			.isString()
			.withMessage("Description must be a valid string")
			.isLength({ min: 10 })
			.withMessage("Description must contain at least 10 characters"),
	];
};

// Middleware to handle validation errors, sending only the first error
export const validate = (
	req: Request,
	res: Response,
	next: NextFunction,
): void | Promise<void> => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		// Return only the first error
		const firstError = errors.array()[0];
		res.status(400).json({ message: firstError.msg });
		return;
	}
	next();
};
