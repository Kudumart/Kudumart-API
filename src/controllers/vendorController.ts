// src/controllers/vendorController.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { v4 as uuidv4 } from "uuid";
import { Op, ForeignKeyConstraintError } from "sequelize";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import logger from "../middlewares/logger"; // Adjust the path to your logger.js
import { AuthenticatedRequest } from "../types/index";
import KYC from "../models/kyc";
import Store from "../models/store";
import Product from "../models/product";
import SubCategory from "../models/subcategory";
import { checkVendorAuctionProductLimit, checkVendorProductLimit } from "../utils/helpers";
import AuctionProduct from "../models/auctionproduct";
import Bid from "../models/bid";
import https from 'https';
import SubscriptionPlan from "../models/subscriptionplan";
import VendorSubscription from "../models/vendorsubscription";
import Notification from "../models/notification";
import Transaction from "../models/transaction";
import PaymentGateway from "../models/paymentgateway";
import { verifyPayment } from "../utils/helpers";
import Currency from "../models/currency";

export const submitOrUpdateKYC = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
    const kycData = req.body;
    try {
        // Check if a KYC record already exists for this user
        const existingKYC = await KYC.findOne({ where: { vendorId } });

        if (existingKYC?.isVerified) {
            res.status(400).json({
                message: "KYC is already verified and cannot be modified again.",
            });
            return;
        }

        if (existingKYC) {
            // Update the existing KYC record
            await existingKYC.update(kycData);
            res
                .status(200)
                .json({ message: "KYC updated successfully", data: existingKYC });
            return;
        } else {
            // Create a new KYC record
            const newKYC = await KYC.create({ vendorId, ...kycData, isVerified: true });
            res
                .status(200)
                .json({ message: "KYC created successfully", data: newKYC });
            return;
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "An error occurred while processing KYC" });
    }
};

export const getKYC = async (req: Request, res: Response): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
    try {
        // Check if a KYC record already exists for this user
        const kyc = await KYC.findOne({ where: { vendorId } });

        res.status(200).json({ data: kyc });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "An error occurred while fetching KYC" });
    }
};

export const getStore = async (req: Request, res: Response): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    try {
        const stores = await Store.findAll({ 
            where: { vendorId },
            include: [
                {
                    model: Currency,
                    as: "currency"
                },
            ], 
        });

        // Check if any stores were found
        if (stores.length === 0) {
            res.status(404).json({ message: "No stores found for this vendor.", data: [] });
            return;
        }

        res.status(200).json({ data: stores });
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve stores", error });
    }
};

export const createStore = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    const { currencyId, name, location, logo, businessHours, deliveryOptions, tipsOnFinding } =
        req.body;
        
    if (!currencyId) {
        res.status(400).json({ message: 'Currency ID is required.' });
        return;
    }

    try {
        // Check if a store with the same name exists for this vendorId
        const existingStore = await Store.findOne({
            where: { vendorId, name },
        });

        if (existingStore) {
            res.status(400).json({
                message: "A store with this name already exists for the vendor.",
            });
            return;
        }

        // Find the currency by ID
        const currency = await Currency.findByPk(currencyId);

        if (!currency) {
            res.status(404).json({ message: 'Currency not found' });
            return;
        }

        // Create the store
        const store = await Store.create({
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to create store", error });
    }
};

export const updateStore = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
    const {
        storeId,
        currencyId,
        name,
        location,
        businessHours,
        deliveryOptions,
        tipsOnFinding,
        logo
    } = req.body;

    try {
        const store = await Store.findOne({ where: { id: storeId } });

        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }

        // Find the currency by ID
        const currency = await Currency.findByPk(currencyId);

        if (!currency) {
            res.status(404).json({ message: 'Currency not found' });
            return;
        }

        // Check for unique name for this vendorId if name is being updated
        if (name && store.name !== name) {
            const existingStore = await Store.findOne({
                where: { vendorId, name, id: { [Op.ne]: storeId } },
            });
            if (existingStore) {
                res.status(400).json({
                    message: "A store with this name already exists for the vendor.",
                });
                return;
            }
        }

        // Update store fields
        await store.update({
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to update store", error });
    }
};

export const deleteStore = async (
    req: Request,
    res: Response
): Promise<void> => {
    const storeId = req.query.storeId as String;

    try {
        const store = await Store.findOne({ where: { id: storeId } });

        if (!store) {
            res.status(404).json({ message: "Store not found" });
            return;
        }

        await store.destroy();
        res.status(200).json({ message: "Store deleted successfully" });
    } catch (error) {
        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete store because it has associated products. Delete or reassign products before deleting this store.",
            });
        } else {
            logger.error(error);
            res.status(500).json({ message: "Failed to delete store", error });
        }
    }
};

// Product
export const createProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    const { storeId, categoryId, name, ...otherData } = req.body;

    try {
        // Use the utility function to check the product limit
        const { status, message } = await checkVendorProductLimit(vendorId);

        if (!status) {
            res.status(403).json({ message });
            return;
        }

        // Check for duplicates
        const existingProduct = await Product.findOne({
            where: { vendorId, name },
        });

        if (existingProduct) {
            res.status(400).json({
                message: "Product with this vendorId and name already exists.",
            });
            return;
        }

        // Check if vendorId, storeId, and categoryId exist
        const vendorExists = await User.findByPk(vendorId);
        const storeExists = await Store.findByPk(storeId);
        const categoryExists = await SubCategory.findByPk(categoryId);

        if (!vendorExists || !storeExists || !categoryExists) {
            res
                .status(404)
                .json({ message: "Vendor, Store, or Category not found." });
            return;
        }

        // Generate a unique SKU (could also implement a more complex logic if needed)
        let sku;
        let isUnique = false;

        while (!isUnique) {
            sku = `KDM-${uuidv4()}`; // Generate a unique SKU
            const skuExists = await Product.findOne({ where: { sku } }); // Check if the SKU already exists
            isUnique = !skuExists; // Set to true if SKU is unique
        }

        // Create the product
        const product = await Product.create({
            vendorId,
            storeId,
            categoryId,
            name,
            sku, // Use the generated SKU
            ...otherData,
        });

        res
            .status(200)
            .json({ message: "Product created successfully", data: product });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to create product" });
    }
};

export const updateProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { productId, ...updateData } = req.body;
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    try {
        // Use the utility function to check the product limit
        const { status, message } = await checkVendorProductLimit(vendorId);

        if (!status) {
            res.status(403).json({ message });
            return;
        }

        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
                vendorId,
            },
        });

        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }

        await product.update(updateData);

        res.status(200).json({
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to update product" });
    }
};

export const deleteProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { productId } = req.query;
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    try {
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
                vendorId,
            },
        });

        if (!product) {
            res.status(404).json({ message: "Product not found." });
            return;
        }

        await product.destroy();
        res.status(200).json({
            message: "Product deleted successfully",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to delete product" });
    }
};

export const fetchVendorProducts = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
    const { name, sku, status, condition, categoryName } = req.query;

    try {
        const products = await Product.findAll({
            where: { vendorId },
            include: [
                {
                    model: SubCategory,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
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
            ...((name || sku || status || condition) && {
                where: {
                    ...(name && { name: { [Op.like]: `%${name}%` } }),
                    ...(sku && { sku }),
                    ...(status && { status }),
                    ...(condition && { condition }),
                },
            }),
        });

        res.status(200).json({
            data: products,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch products" });
    }
};

export const viewProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    // Get productId from route params instead of query
    const { productId } = req.query;
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    try {
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
                vendorId,
            },
            include: [
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
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

export const moveToDraft = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { productId } = req.query; // Get productId from request query
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    try {
        // Validate productId type
        if (typeof productId !== "string") {
            res.status(400).json({ message: "Invalid productId." });
            return;
        }

        // Find the product by either ID or SKU, ensuring it belongs to the authenticated vendor
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
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
        await product.save();

        // Respond with the updated product
        res.status(200).json({
            message: "Product moved to draft.",
            data: product,
        });
    } catch (error) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({ message: "Failed to move product to draft." });
    }
};

export const changeProductStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { productId, status } = req.body; // Get productId and status from request body
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    // Validate status
    if (!["active", "inactive", "draft"].includes(status)) {
        res.status(400).json({ message: "Invalid status." });
        return;
    }

    try {
        // Find the product by ID or SKU
        const product = await Product.findOne({
            where: {
                [Op.or]: [{ id: productId }, { sku: productId }],
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
        await product.save();

        // Respond with the updated product details
        res.status(200).json({
            message: "Product status updated successfully.",
        });
    } catch (error) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({ message: "Failed to update product status." });
    }
};

// Auction Product
export const createAuctionProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    const {
        storeId,
        categoryId,
        name,
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
    } = req.body;

    try {
        // Use the utility function to check the product limit
        const { status, message } = await checkVendorAuctionProductLimit(vendorId);

        if (!status) {
            res.status(403).json({ message });
            return;
        }

        // Check if vendorId, storeId, and categoryId exist
        const vendorExists = await User.findByPk(vendorId);
        const storeExists = await Store.findByPk(storeId);
        const categoryExists = await SubCategory.findByPk(categoryId);

        if (!vendorExists || !storeExists || !categoryExists) {
            res
                .status(404)
                .json({ message: "Vendor, Store, or Category not found." });
            return;
        }

        // Fetch the KYC relationship
        const kyc = await vendorExists.getKyc(); // Assuming a method exists to get the related KYC record

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
            sku = `KDM-${uuidv4()}`; // Generate a unique SKU
            const skuExists = await Product.findOne({ where: { sku } }); // Check if the SKU already exists
            isUnique = !skuExists; // Set to true if SKU is unique
        }

        // Create the auction product
        const auctionProduct = await AuctionProduct.create({
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
    } catch (error: any) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while creating the auction product.",
        });
    }
};

export const updateAuctionProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    const {
        auctionProductId,
        storeId,
        categoryId,
        name,
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
    } = req.body;

    try {
        // Use the utility function to check the product limit
        const { status, message } = await checkVendorAuctionProductLimit(vendorId);

        if (!status) {
            res.status(403).json({ message });
            return;
        }

        // Find the auction product by ID
        const auctionProduct = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
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
        const bidExists = await Bid.findOne({ where: { auctionProductId } });
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
        const vendorExists = await User.findByPk(vendorId);
        const storeExists = await Store.findByPk(storeId);
        const categoryExists = await SubCategory.findByPk(categoryId);

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
        await auctionProduct.save();

        res.status(200).json({
            message: "Auction product updated successfully.",
            auctionProduct,
        });
    } catch (error: any) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while updating the auction product.",
        });
    }
};

export const deleteAuctionProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { auctionProductId } = req.query;
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    try {
        // Find the auction product by ID
        const auctionProduct = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
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

        const bidCount = await Bid.count({
            where: { auctionProductId },
        });

        if (bidCount > 0) {
            res.status(400).json({
                message: "Auction product already has bids, cannot be deleted.",
            });
            return;
        }

        // Delete the auction product
        await auctionProduct.destroy();

        res.status(200).json({ message: "Auction product deleted successfully." });
    } catch (error: any) {
        if (error instanceof ForeignKeyConstraintError) {
            res.status(400).json({
                message:
                    "Cannot delete store because it has associated products. Delete or reassign products before deleting this store.",
            });
        } else {
            logger.error(error);
            res.status(500).json({
                message:
                    error.message ||
                    "An error occurred while deleting the auction product.",
            });
        }
    }
};

export const cancelAuctionProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { auctionProductId } = req.query;
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    try {
        // Find the auction product by ID
        const auctionProduct = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
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
        await auctionProduct.save();

        res.status(200).json({
            message: "Auction product has been cancelled successfully.",
        });
    } catch (error: any) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({
            message:
                error.message ||
                "An error occurred while cancelling the auction product.",
        });
    }
};

export const fetchVendorAuctionProducts = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware
    const { name, sku, status, condition, categoryName } = req.query;

    try {
        // Fetch all auction products for the vendor
        const auctionProducts = await AuctionProduct.findAll({
            where: {
                vendorId,
            },
            include: [
                {
                    model: SubCategory,
                    as: "sub_category",
                    where: categoryName ? { name: categoryName } : undefined,
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
            ...((name || sku || status || condition) && {
                where: {
                    ...(name && { name: { [Op.like]: `%${name}%` } }),
                    ...(sku && { sku }),
                    ...(status && { status }),
                    ...(condition && { condition }),
                },
            }),
        });

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
    } catch (error: any) {
        logger.error(error); // Log the error for debugging
        res.status(500).json({
            message:
                error.message || "An error occurred while fetching auction products.",
        });
    }
};

export const viewAuctionProduct = async (
    req: Request,
    res: Response
): Promise<void> => {
    // Get auctionProductId from route params instead of query
    const { auctionProductId } = req.query;
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    try {
        const product = await AuctionProduct.findOne({
            where: {
                [Op.or]: [{ id: auctionProductId }, { sku: auctionProductId }],
                vendorId,
            },
            include: [
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
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch product" });
    }
};

// Subscription
export const subscriptionPlans = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    try {
        // Fetch all subscription plans
        const subscriptionPlans = await SubscriptionPlan.findAll();

        // Fetch the active subscription for the vendor
        const activeSubscription = await VendorSubscription.findOne({
            where: {
                vendorId: vendorId,
                isActive: true, // Only get active subscriptions
            },
        });

        // Check if the vendor has an active subscription
        if (activeSubscription) {
            // Mark the active plan in the list
            subscriptionPlans.forEach((plan) => {
                if (plan.id === activeSubscription.subscriptionPlanId) {
                    plan.setDataValue('isActiveForVendor', true); // Mark this plan as active for this vendor
                } else {
                    plan.setDataValue('isActiveForVendor', false); // Mark others as inactive for this vendor
                }
            });
        }

        res.status(200).json({ data: subscriptionPlans });
    } catch (error: any) {
        logger.error("Error fetching subscription plans or active subscription:", error);
        res.status(500).json({
            message: error.message || "An error occurred while fetching subscription plans",
        });
    }
};

export const subscribe = async (req: Request, res: Response): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware
    const { subscriptionPlanId, isWallet, refId } = req.body; // Including isWallet and refId in the request body

    if (!subscriptionPlanId) {
        res.status(400).json({ message: 'Subscription plan ID is required.' });
        return;
    }

    try {
        // Step 1: Check for active subscription
        const activeSubscription = await VendorSubscription.findOne({
            where: {
                vendorId,
                isActive: true,
            },
            include: [{
                model: SubscriptionPlan,
                as: "subscriptionPlans", // Assuming alias in your model definition
                attributes: ['id', 'name'],
            }],
        });

        const startDate = new Date();
        const endDate = new Date();

        const handleTransaction = async (amount: number) => {
            // If isWallet is true, deduct from wallet balance
            if (isWallet) {
                const vendor = await User.findByPk( vendorId );
                
                if (!vendor || vendor.wallet === undefined || vendor.wallet < amount) {
                    res.status(400).json({ message: "Insufficient wallet balance." });
                    return false;
                }

                // Deduct the amount from the wallet
                await vendor.update({ wallet: vendor.wallet - amount });
            } else {
                const paymentGateway = await PaymentGateway.findOne({ where: { isActive: true } });

                if (!paymentGateway) {
                    res.status(400).json({ message: "No active payment gateway found." });
                    return false;
                }

                // If refId is provided, verify the payment
                if (!refId) {
                    res.status(400).json({ message: 'Payment reference ID (refId) is required.' });
                    return;
                }

                // Simulate a payment verification function
                const isPaymentValid = await verifyPayment(refId, paymentGateway.secretKey);
                if (!isPaymentValid) {
                    res.status(400).json({ message: 'Invalid or unverified payment reference.' });
                    return false;
                }
            }

            // Save the transaction in the database
            await Transaction.create({
                userId: vendorId,
                amount,
                transactionType: 'subscription',
                status: 'success',
                refId: isWallet ? null : refId,
            });

            return true;
        };

        if (activeSubscription) {
            // Step 2: Handle active subscription
            const activePlan = activeSubscription.subscriptionPlans;

            // Step 2: Check if the active plan is defined and handle accordingly
            if (!activePlan) {
                res.status(400).json({ message: 'No subscription plan found for the vendor.' });
                return;
            }

            if (activePlan.name === 'Free Plan') {
                // If the active plan is free, proceed with the subscription
                // Step 3: Mark the current free plan as inactive
                await activeSubscription.update({ isActive: false });

                // Step 4: Create a new subscription for the vendor
                const subscriptionPlan = await SubscriptionPlan.findByPk(subscriptionPlanId);

                if (!subscriptionPlan) {
                    res.status(404).json({ message: 'Subscription plan not found' });
                    return;
                }

                const transactionSuccess = await handleTransaction(subscriptionPlan.price);
                if (!transactionSuccess) return;

                endDate.setMonth(startDate.getMonth() + subscriptionPlan.duration); // Set end date by adding months

                const newSubscription = await VendorSubscription.create({
                    vendorId,
                    subscriptionPlanId,
                    startDate,
                    endDate, // Adjust depending on plan duration
                    isActive: true,
                });

                // Create a notification for the vendor
                await Notification.create({
                    userId: vendorId,
                    message: `You have successfully subscribed to the ${subscriptionPlan.name} plan.`,
                    type: 'subscription',
                    isRead: false,
                });

                res.status(200).json({
                    message: 'Subscribed to new plan successfully',
                    subscription: newSubscription,
                });
            } else {
                // Create a notification about the existing active subscription
                await Notification.create({
                    userId: vendorId,
                    message: 'You already have an active non-free subscription and cannot switch to a new plan.',
                    type: 'subscription',
                    isRead: false,
                });

                // If the existing subscription is not free, notify the vendor
                res.status(400).json({
                    message: 'You already have an active non-free subscription',
                });
            }
        } else {
            // No active subscription exists, create a new one
            const subscriptionPlan = await SubscriptionPlan.findByPk(subscriptionPlanId);

            if (!subscriptionPlan) {
                res.status(404).json({ message: 'Subscription plan not found' });
                return;
            }

            const transactionSuccess = await handleTransaction(subscriptionPlan.price);
            if (!transactionSuccess) return;

            endDate.setMonth(startDate.getMonth() + subscriptionPlan.duration); // Set end date by adding months

            const newSubscription = await VendorSubscription.create({
                vendorId,
                subscriptionPlanId,
                startDate,
                endDate,
                isActive: true,
            });

            // Create a notification for the new subscription
            await Notification.create({
                userId: vendorId,
                message: `You have successfully subscribed to the ${subscriptionPlan.name} plan.`,
                type: 'subscription',
                isRead: false,
            });

            res.status(200).json({
                message: 'Subscribed to plan successfully',
                subscription: newSubscription,
            });
        }
    } catch (error: any) {
        logger.error('Error subscribing vendor:', error);
        res.status(500).json({
            message: error.message || 'An error occurred while processing the subscription.',
        });
    }
};

export const verifyCAC = async (req: Request, res: Response): Promise<void> => {
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
        const request = https.request(options, (response) => {
            let responseData = '';

            // Collect response data
            response.on('data', (chunk) => {
                responseData += chunk;
            });

            // Process complete response
            response.on('end', () => {
                if (!responseData) {
                    console.error('No response data received.');
                    res.status(500).json({ message: 'No response data received from API.' });
                    return;
                }

                try {
                    const parsedData = JSON.parse(responseData);
                    if (parsedData.status === true) {
                        console.log('Vendor verified successfully!', parsedData);
                        res.status(200).json({
                            message: 'Vendor verified successfully!',
                            data: parsedData,
                        });
                    } else {
                        console.log('Verification failed:', parsedData.message);
                        res.status(400).json({
                            message: 'Verification failed',
                            error: parsedData.message,
                        });
                    }
                } catch (parseError: any) {
                    console.error('Error parsing response:', parseError);
                    res.status(500).json({
                        message: 'Error parsing API response',
                        error: parseError.message,
                    });
                }
            });
        });

        // Handle request errors
        request.on('error', (error) => {
            console.error('Error verifying CAC:', error);
            res.status(500).json({ message: 'Request error', error: error.message });
        });

        // Write the data to the request body and send it
        request.write(data);
        request.end();
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Unexpected error', error: error });
    }
};

export const getAllCurrencies = async (req: Request, res: Response): Promise<void> => {
    try {
        const currencies = await Currency.findAll();
        res.status(200).json({ data: currencies });
    } catch (error) {
        logger.error('Error fetching currencies:', error);
        res.status(500).json({ message: 'Failed to fetch currencies' });
    }
};

export const getAllSubCategories = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { name } = req.query;

    try {
        // Query with name filter if provided
        const whereClause = name ? { name: { [Op.like]: `%${name}%` } } : {};

        const subCategories = await SubCategory.findAll({ where: whereClause });
        res.status(200).json({ data: subCategories });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Error fetching sub-categories" });
    }
};