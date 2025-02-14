// src/controllers/vendorController.ts
import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import { v4 as uuidv4 } from "uuid";
import { Op, ForeignKeyConstraintError, Sequelize } from "sequelize";
import { sendMail } from "../services/mail.service";
import { emailTemplates } from "../utils/messages";
import logger from "../middlewares/logger"; // Adjust the path to your logger.js
import { AuthenticatedRequest } from "../types/index";
import KYC from "../models/kyc";
import Store from "../models/store";
import Product from "../models/product";
import SubCategory from "../models/subcategory";
import { checkVendorAuctionProductLimit, checkVendorProductLimit, checkAdvertLimit, verifyPayment } from "../utils/helpers";
import AuctionProduct from "../models/auctionproduct";
import Bid from "../models/bid";
import https from 'https';
import SubscriptionPlan from "../models/subscriptionplan";
import VendorSubscription from "../models/vendorsubscription";
import Notification from "../models/notification";
import Transaction from "../models/transaction";
import PaymentGateway from "../models/paymentgateway";
import Currency from "../models/currency";
import OrderItem from "../models/orderitem";
import Order from "../models/order";
import Advert from "../models/advert";
import BankInformation from "../models/bankinformation";
import Cart from "../models/cart";
import sequelizeService from "../services/sequelize.service";
import SaveProduct from "../models/saveproduct";
import ReviewProduct from "../models/reviewproduct";

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
                    as: "currency",
                },
                {
                    model: Product,
                    as: "products",
                    attributes: [], // Don't include individual product details
                },
                {
                    model: AuctionProduct,
                    as: "auctionproducts",
                    attributes: [], // Don't include individual product details
                },
            ],
            attributes: {
                include: [
                    // Include total product count for each store
                    [
                        Sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM products AS product
                            WHERE product.storeId = Store.id
                        )`),
                        "totalProducts",
                    ],
                    // Include total auction product count for each store
                    [
                        Sequelize.literal(`(
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
    } catch (error) {
        logger.error("Error retrieving stores:", error);
        res.status(500).json({ message: "Failed to retrieve stores", error });
    }
};

export const viewStore = async (req: Request, res: Response): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware

    const storeId = req.query.storeId as string;

    try {
        const store = await Store.findOne({
            where: { vendorId, id: storeId },
            include: [
                {
                    model: Currency,
                    as: "currency",
                },
                {
                    model: Product,
                    as: "products",
                    attributes: [], // Don't include individual product details
                },
                {
                    model: AuctionProduct,
                    as: "auctionproducts",
                    attributes: [], // Don't include individual product details
                },
            ]
        });

        res.status(200).json({ data: store });
    } catch (error) {
        logger.error("Error retrieving store:", error);
        res.status(500).json({ message: "Failed to retrieve store", error });
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

        const relatedTables: { name: string; model: typeof AuctionProduct | typeof Product; field: string }[] = [
            { name: "auction_products", model: AuctionProduct, field: "storeId" },
            { name: "products", model: Product, field: "storeId" }
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof AuctionProduct).count({
                where: { [table.field]: store.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete store because related records exist in ${table.name}` });
                return;
            }
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

        const relatedTables: { name: string; model: typeof SaveProduct | typeof ReviewProduct | typeof Cart; field: string }[] = [
            { name: "save_products", model: SaveProduct, field: "productId" },
            { name: "review_products", model: ReviewProduct, field: "productId" },
            { name: "carts", model: Cart, field: "productId" }
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof SaveProduct).count({
                where: { [table.field]: product.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete product because related records exist in ${table.name}` });
                return;
            }
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

        // Remove the product from all carts
        await Cart.destroy({ where: { productId } });

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

        const relatedTables: { name: string; model: typeof Bid; field: string }[] = [
            { name: "bids", model: Bid, field: "auctionProductId" },
        ];

        // Check each related table
        for (const table of relatedTables) {
            const count = await (table.model as typeof Bid).count({
                where: { [table.field]: auctionProduct.id }
            });

            if (count > 0) {
                res.status(400).json({ message: `Cannot delete auction product because related records exist in ${table.name}` });
                return;
            }
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
    const vendorId = (req as AuthenticatedRequest).user?.id as string;
    const { subscriptionPlanId, isWallet, refId } = req.body;

    if (!subscriptionPlanId) {
        res.status(400).json({ message: "Subscription plan ID is required." });
        return;
    }

    const transaction = await sequelizeService.connection!.transaction();

    try {
        // Step 1: Check for active subscription
        const activeSubscription = await VendorSubscription.findOne({
            where: { vendorId, isActive: true },
            include: [{
                model: SubscriptionPlan,
                as: "subscriptionPlans",
                attributes: ["id", "name"],
            }],
            transaction, // Use the same transaction
            lock: true, // Prevents concurrent modifications
        });

        const startDate = new Date();
        const endDate = new Date();

        // Step 2: Function to handle payment (wallet or external)
        const handleTransaction = async (amount: number) => {
            if (isWallet) {
                const vendor = await User.findByPk(vendorId, { transaction, lock: true });

                if (!vendor || vendor.wallet === undefined || vendor.wallet < amount) {
                    await transaction.rollback();
                    res.status(400).json({ message: "Insufficient wallet balance." });
                    return false;
                }

                await vendor.update({ wallet: vendor.wallet - amount }, { transaction });
            } else {
                const paymentGateway = await PaymentGateway.findOne({
                    where: { isActive: true },
                    transaction,
                });

                if (!paymentGateway) {
                    await transaction.rollback();
                    res.status(400).json({ message: "No active payment gateway found." });
                    return false;
                }

                if (!refId) {
                    await transaction.rollback();
                    res.status(400).json({ message: "Payment reference ID (refId) is required." });
                    return false;
                }

                const isPaymentValid = await verifyPayment(refId, paymentGateway.secretKey);
                if (!isPaymentValid) {
                    await transaction.rollback();
                    res.status(400).json({ message: "Invalid or unverified payment reference." });
                    return false;
                }
            }

            await Transaction.create({
                userId: vendorId,
                amount,
                transactionType: "subscription",
                status: "success",
                refId: isWallet ? null : refId,
            }, { transaction });

            return true;
        };

        if (activeSubscription) {
            const activePlan = activeSubscription.subscriptionPlans;

            if (!activePlan) {
                await transaction.rollback();
                res.status(400).json({ message: "No subscription plan found for the vendor." });
                return;
            }

            if (activePlan.name === "Free Plan") {
                const subscriptionPlan = await SubscriptionPlan.findByPk(subscriptionPlanId, { transaction });

                if (!subscriptionPlan) {
                    await transaction.rollback();
                    res.status(404).json({ message: "Subscription plan not found." });
                    return;
                }

                const transactionSuccess = await handleTransaction(subscriptionPlan.price);
                if (!transactionSuccess) return;

                endDate.setMonth(startDate.getMonth() + subscriptionPlan.duration);

                await activeSubscription.update({ isActive: false }, { transaction });

                const newSubscription = await VendorSubscription.create({
                    vendorId,
                    subscriptionPlanId,
                    startDate,
                    endDate,
                    isActive: true,
                }, { transaction });

                await Notification.create({
                    userId: vendorId,
                    title: "Subscription",
                    message: `You have successfully subscribed to the ${subscriptionPlan.name} plan.`,
                    type: "subscription",
                    isRead: false,
                }, { transaction });

                await transaction.commit(); // Commit all changes

                res.status(200).json({
                    message: "Subscribed to new plan successfully",
                    subscription: newSubscription,
                });
            } else {
                await Notification.create({
                    userId: vendorId,
                    title: "Subscription",
                    message: "You already have an active non-free subscription.",
                    type: "subscription",
                    isRead: false,
                }, { transaction });

                await transaction.rollback();
                res.status(400).json({ message: "You already have an active non-free subscription." });
            }
        } else {
            const subscriptionPlan = await SubscriptionPlan.findByPk(subscriptionPlanId, { transaction });

            if (!subscriptionPlan) {
                await transaction.rollback();
                res.status(404).json({ message: "Subscription plan not found." });
                return;
            }

            const transactionSuccess = await handleTransaction(subscriptionPlan.price);
            if (!transactionSuccess) return;

            endDate.setMonth(startDate.getMonth() + subscriptionPlan.duration);

            const newSubscription = await VendorSubscription.create({
                vendorId,
                subscriptionPlanId,
                startDate,
                endDate,
                isActive: true,
            }, { transaction });

            await Notification.create({
                userId: vendorId,
                title: "Subscription",
                message: `You have successfully subscribed to the ${subscriptionPlan.name} plan.`,
                type: "subscription",
                isRead: false,
            }, { transaction });

            await transaction.commit(); // Commit all changes

            res.status(200).json({
                message: "Subscribed to plan successfully",
                subscription: newSubscription,
            });
        }
    } catch (error) {
        await transaction.rollback(); // Rollback changes on error
        logger.error("Error subscribing vendor:", error);
        res.status(500).json({ message: "An error occurred while processing the subscription." });
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
                    logger.error('No response data received.');
                    res.status(500).json({ message: 'No response data received from API.' });
                    return;
                }

                try {
                    const parsedData = JSON.parse(responseData);
                    if (parsedData.status === true) {
                        logger.log('Vendor verified successfully!', parsedData);
                        res.status(200).json({
                            message: 'Vendor verified successfully!',
                            data: parsedData,
                        });
                    } else {
                        logger.log('Verification failed:', parsedData.message);
                        res.status(400).json({
                            message: 'Verification failed',
                            error: parsedData.message,
                        });
                    }
                } catch (parseError: any) {
                    logger.error('Error parsing response:', parseError);
                    res.status(500).json({
                        message: 'Error parsing API response',
                        error: parseError.message,
                    });
                }
            });
        });

        // Handle request errors
        request.on('error', (error) => {
            logger.error('Error verifying CAC:', error);
            res.status(500).json({ message: 'Request error', error: error.message });
        });

        // Write the data to the request body and send it
        request.write(data);
        request.end();
    } catch (error) {
        logger.error('Unexpected error:', error);
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

export const getVendorOrderItems = async (req: Request, res: Response): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    if (!vendorId) {
        res.status(403).json({ message: "Unauthorized. Vendor ID is required." });
        return;
    }

    try {
        // Fetch OrderItems related to the vendor
        const orderItems = await OrderItem.findAll({
            where: { vendorId },
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
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to retrieve order items." });
    }
};

export const getOrderItemsInfo = async (req: Request, res: Response): Promise<void> => {
    const orderId = req.query.orderId as string;

    try {
        // Fetch Order related to the vendor
        const order = await Order.findOne({
            where: { id: orderId },
            include: [
                {
                    model: User,
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
    } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to retrieve order details." });
    }
};

// Adverts
export const activeProducts = async (
    req: Request,
    res: Response
): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id; // Authenticated user ID from middleware
    const { name } = req.query;

    try {
        const products = await Product.findAll({
            where: { vendorId, status: "active" },
            ...((name) && {
                where: {
                    ...(name && { name: { [Op.like]: `%${name}%` } }),
                },
            }),
        });

        res.status(200).json({
            data: products,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch active products" });
    }
};

export const createAdvert = async (req: Request, res: Response): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    const { categoryId, productId, title, description, media_url, showOnHomepage, link } = req.body;

    try {
        // Use the utility function to check the product limit
        const { status, message } = await checkAdvertLimit(vendorId);

        if (!status) {
            res.status(403).json({ message });
            return;
        }

        // Check if categoryId and productId exist
        const categoryExists = await SubCategory.findByPk(categoryId);
        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }

        if (productId) {
            const productExists = await Product.findByPk(productId);

            if (!productExists) {
                res
                    .status(404)
                    .json({ message: "Product not found." });
                return;
            }
        }

        const newAdvert = await Advert.create({
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
    } catch (error: any) {
        logger.error(error);
        res.status(500).json({ message: "Failed to create advert" });
    }
};

export const updateAdvert = async (req: Request, res: Response): Promise<void> => {
    const { advertId, categoryId, productId, title, description, media_url, showOnHomepage, link } = req.body;

    try {
        // Check if categoryId and productId exist
        const categoryExists = await SubCategory.findByPk(categoryId);

        if (!categoryExists) {
            res
                .status(404)
                .json({ message: "Category not found." });
            return;
        }

        if (productId) {
            const productExists = await Product.findByPk(productId);

            if (!productExists) {
                res
                    .status(404)
                    .json({ message: "Product not found." });
                return;
            }
        }

        const advert = await Advert.findByPk(advertId);

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

        await advert.save();

        res.status(200).json({
            message: "Advert updated successfully",
            data: advert,
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to update advert" });
    }
};

export const getAdverts = async (req: Request, res: Response): Promise<void> => {
    const { search, page = 1, limit = 10 } = req.query;
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    // Convert `page` and `limit` to numbers and ensure they are valid
    const pageNumber = parseInt(page as string, 10) || 1;
    const limitNumber = parseInt(limit as string, 10) || 10;
    const offset = (pageNumber - 1) * limitNumber;

    try {
        // Build the where condition for the search query (using Op.or for title and status)
        const whereConditions: any = { userId: vendorId };

        if (search) {
            whereConditions[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { status: { [Op.like]: `%${search}%` } },
            ];
        }

        // Fetch adverts with pagination, filters, and associated data
        const { count, rows: adverts } = await Advert.findAndCountAll({
            where: whereConditions,
            include: [
                { model: Product, as: "product", attributes: ['id', 'name'] },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error("Error fetching adverts:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const viewAdvert = async (req: Request, res: Response): Promise<void> => {
    const advertId = req.query.advertId as string;

    try {
        const advert = await Advert.findByPk(advertId, {
            include: [
                { model: Product, as: "product" },
                { model: SubCategory, as: "sub_category" },
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
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to fetch advert" });
    }
};

export const deleteAdvert = async (req: Request, res: Response): Promise<void> => {
    const advertId = req.query.advertId as string;

    try {
        const advert = await Advert.findByPk(advertId);

        if (!advert) {
            res.status(404).json({ message: "Advert not found" });
            return;
        }

        await advert.destroy();

        res.status(200).json({
            message: "Advert deleted successfully",
        });
    } catch (error) {
        logger.error(error);
        res.status(500).json({ message: "Failed to delete advert" });
    }
};

/**
 * Add a new bank account for a vendor
 */
export const addBankInformation = async (req: Request, res: Response): Promise<void> => {
    const { bankInfo } = req.body; // bankInfo contains bankName, accountNumber, accountName

    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

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
        const vendor = await User.findByPk(vendorId);

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
        const bankData = await BankInformation.create({
            vendorId,
            bankInfo
        });

        res.status(200).json({ message: "Bank information added successfully", data: bankData });

    } catch (error: any) {
        logger.error("Error adding bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Update bank account details for a vendor
 */
export const updateBankInformation = async (req: Request, res: Response): Promise<void> => {
    const { bankId, bankInfo } = req.body;

    try {
        // Find the bank record
        const bankData = await BankInformation.findOne({ where: { id: bankId } });
        if (!bankData) {
            res.status(404).json({ message: "Bank information not found" });
            return;
        }

        // Update bank details
        await bankData.update({
            bankInfo
        });

        res.status(200).json({ message: "Bank information updated successfully", data: bankData });

    } catch (error: any) {
        logger.error("Error updating bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get bank information for a specific vendor or all vendors
 */
export const getBankInformation = async (req: Request, res: Response): Promise<void> => {
    const vendorId = (req as AuthenticatedRequest).user?.id as string; // Authenticated user ID from middleware

    try {
        let bankData;

        // Fetch bank details for a specific vendor
        bankData = await BankInformation.findAll({ where: { vendorId } });

        if (!bankData.length) {
            res.status(404).json({ message: "No bank information found for this vendor" });
            return;
        }

        res.status(200).json({ message: "Bank information retrieved successfully", data: bankData });

    } catch (error: any) {
        logger.error("Error fetching bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * Get a single bank information record for a specific vendor
 */
export const getSingleBankInformation = async (req: Request, res: Response): Promise<void> => {
    const bankId = req.query.bankId; // bankId is required

    try {
        // Fetch bank details
        const bankInfo = await BankInformation.findOne({ where: { id: bankId } });

        if (!bankInfo) {
            res.status(404).json({ message: "Bank information not found" });
            return;
        }

        res.status(200).json({ message: "Bank information retrieved successfully", data: bankInfo });

    } catch (error: any) {
        logger.error("Error fetching bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
};


/**
 * Delete bank account details for a vendor
 */
export const deleteBankInformation = async (req: Request, res: Response): Promise<void> => {
    const bankId = req.query.bankId; // bankId is required

    try {
        // Find the bank record
        const bankData = await BankInformation.findOne({ where: { id: bankId } });
        if (!bankData) {
            res.status(404).json({ message: "Bank information not found" });
            return;
        }

        // Delete the bank record
        await bankData.destroy();

        res.status(200).json({ message: "Bank information deleted successfully" });

    } catch (error: any) {
        logger.error("Error deleting bank information:", error);
        res.status(500).json({ message: "Server error" });
    }
};