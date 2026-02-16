
import { Op, Sequelize, Transaction as SequelizeTransaction } from "sequelize";
import Decimal from "decimal.js";
import User from "../models/user";
import Product from "../models/product";
import Cart from "../models/cart";
import Order from "../models/order";
import OrderItem from "../models/orderitem";
import Payment from "../models/payment";
import Store from "../models/store";
import Currency from "../models/currency";
import ProductCharge from "../models/productcharge";
import DropshipProducts from "../models/dropshipProducts";
import SubCategory from "../models/subcategory";
import Notification from "../models/notification";
import Transaction from "../models/transaction";
import Admin from "../models/admin";
import PaymentGateway from "../models/paymentgateway";
import sequelizeService from "../services/sequelize.service";
import logger from "../middlewares/logger";
import { verifyPayment, verifyStripePayment, splitPhoneNumber } from "../utils/helpers";
import { DropShippingService } from "./dropShipping.service";
import { emailTemplates } from "../utils/messages";
import { sendMail } from "./mail.service";
import { sendPushNotificationSingle, PushNotificationTypes } from "../firebase/pushNotification";

const dropShippingService = new DropShippingService();

export class PaymentService {
    static async calculateCartTotals(userId: string, currency: "NGN" | "USD") {
        const cartItems = await Cart.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: "product",
                include: [{ model: DropshipProducts, as: "dropshipDetails" }]
            }]
        });

        if (!cartItems.length) throw new Error("Cart is empty");

        const productCharges = await ProductCharge.findAll({ where: { is_active: true } });

        let subtotal = new Decimal(0);
        let totalCharges = new Decimal(0);
        let vendorEarnings: Record<string, { amount: Decimal, currency: string, items: any[] }> = {};

        for (const item of cartItems) {
            const product = item.product;
            if (!product) continue;

            let itemPrice = new Decimal(0);
            if (product.type === "in_stock") {
                const discountPrice = Number(product.discount_price);
                const regularPrice = Number(product.price);
                itemPrice = new Decimal(discountPrice > 0 ? discountPrice : regularPrice);
            } else if (product.type === "dropship") {
                const variant = product.variants?.find(v => v.sku_id === item.dropshipProductSkuId);
                if (!variant) throw new Error(`Variant not found for product ${product.name}`);
                const offerPrice = Number(variant.offer_sale_price);
                const skuPrice = Number(variant.sku_price);
                itemPrice = new Decimal(offerPrice > 0 ? offerPrice : skuPrice);
            }

            // Calculate charges
            const charge = productCharges.find(c =>
                c.charge_currency === (currency === "USD" ? "USD" : "NGN") &&
                itemPrice.gte(c.minimum_product_amount) &&
                (c.maximum_product_amount ? itemPrice.lte(c.maximum_product_amount) : true)
            );

            let itemCharge = new Decimal(0);
            if (charge) {
                if (charge.calculation_type === "percentage") {
                    itemCharge = itemPrice.mul(new Decimal(charge.charge_percentage).div(100));
                } else {
                    itemCharge = new Decimal(charge.charge_amount || 0);
                }
            }

            const itemTotal = itemPrice.plus(itemCharge).mul(item.quantity);
            subtotal = subtotal.plus(itemTotal);
            totalCharges = totalCharges.plus(itemCharge.mul(item.quantity));

            if (!vendorEarnings[product.vendorId]) {
                vendorEarnings[product.vendorId] = { amount: new Decimal(0), currency, items: [] };
            }
            vendorEarnings[product.vendorId].amount = vendorEarnings[product.vendorId].amount.plus(itemPrice.mul(item.quantity));
            vendorEarnings[product.vendorId].items.push({ product, quantity: item.quantity, price: itemPrice });
        }

        return {
            subtotal: subtotal.toNearest(0.01),
            totalCharges: totalCharges.toNearest(0.01),
            vendorEarnings,
            cartItems
        };
    }

    static async processCheckout(
        userId: string,
        refId: string,
        shippingData: { address: string, zipCode: string, city?: string, state?: string, country?: string },
        currency: "NGN" | "USD",
        gateway: "Paystack" | "Stripe"
    ) {
        const transaction = await sequelizeService.connection!.transaction();
        try {
            const user = await User.findByPk(userId, { transaction });
            if (!user) throw new Error("User not found");

            // Verify Payment
            if (gateway === "Paystack") {
                const pg = await PaymentGateway.findOne({ where: { name: "Paystack", isActive: true } });
                if (!pg || !pg.secretKey) throw new Error("Paystack not configured");
                const verification = await verifyPayment(refId, pg.secretKey);
                if (verification.status !== "success") throw new Error("Payment verification failed");
            } else if (gateway === "Stripe") {
                const stripeData = await verifyStripePayment(refId);
                if (stripeData.status !== "succeeded") {
                    throw new Error("Stripe payment verification failed or not succeeded");
                }
            }

            const { subtotal, totalCharges, vendorEarnings, cartItems } = await this.calculateCartTotals(userId, currency);

            // Create Order
            const order = await Order.create({
                userId,
                totalAmount: subtotal.toNumber(),
                refId,
                shippingAddress: shippingData.address,
                status: "pending",
                trackingNumber: `KUDO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
            }, { transaction });

            // Process Vendor Items
            for (const vendorId in vendorEarnings) {
                const data = vendorEarnings[vendorId];
                const vendor = await User.findByPk(vendorId, { transaction });
                const admin = !vendor ? await Admin.findByPk(vendorId, { transaction }) : null;

                for (const item of data.items) {
                    const orderItem = await OrderItem.create({
                        vendorId: vendorId,
                        orderId: order.id,
                        product: item.product,
                        quantity: item.quantity,
                        price: item.price.toNumber(),
                        status: "pending"
                    }, { transaction });

                    // Inventory Update
                    if (item.product.type === "in_stock") {
                        await item.product.update({ quantity: (item.product.quantity || 0) - item.quantity }, { transaction });
                    }

                    if (vendor) {
                        // Log Transaction per OrderItem
                        await Transaction.create({
                            userId: vendor.id,
                            amount: item.price.mul(item.quantity).toNumber(),
                            currency: currency,
                            transactionType: "sale",
                            refId: orderItem.id,
                            status: "pending",
                            metadata: { orderId: order.id, trackingNumber: order.trackingNumber, productId: item.product.id }
                        }, { transaction });
                    }
                }

                if (vendor) {
                    // Update Wallet
                    if (currency === "USD") {
                        vendor.pendingDollarWallet = new Decimal(vendor.pendingDollarWallet || 0).plus(data.amount).toNumber();
                    } else {
                        vendor.pendingWallet = new Decimal(vendor.pendingWallet || 0).plus(data.amount).toNumber();
                    }
                    await vendor.save({ transaction });

                    // Notify Vendor
                    await Notification.create({
                        userId: vendor.id,
                        title: "New Order Received",
                        type: "new_order",
                        message: `You received an order for ${data.items.length} item(s). Order: ${order.trackingNumber}`
                    }, { transaction });

                    // Send Email & Push (Async, don't await if you want speed, but for reliability we might)
                    this.sendNotifications(vendor, order, data.items, currency);
                }
            }

            // Create Payment record
            await Payment.create({
                orderId: order.id,
                refId,
                amount: subtotal.toNumber(),
                currency: currency,
                status: "completed",
                paymentDate: new Date()
            }, { transaction });

            // Clear Cart
            await Cart.destroy({ where: { userId }, transaction });

            await transaction.commit();

            // Notify Buyer
            await Notification.create({
                userId,
                title: "Order Placed Successfully",
                type: "order_confirmation",
                message: `Your order ${order.trackingNumber} has been placed.`
            });

            return order;
        } catch (error) {
            await transaction.rollback();
            logger.error("Checkout Error:", error);
            throw error;
        }
    }

    private static async sendNotifications(vendor: any, order: any, items: any[], currency: string) {
        try {
            // Email
            const emailContent = `New order ${order.trackingNumber} received for ${items.length} items.`;
            await sendMail(vendor.email, "New Order Received", emailContent);

            // Push
            if (vendor.fcmToken) {
                await sendPushNotificationSingle({
                    notification: { title: "New Order", body: `Order ${order.trackingNumber} received.` },
                    token: vendor.fcmToken,
                    data: { orderId: order.id, type: PushNotificationTypes.ORDER_CREATED }
                });
            }
        } catch (e) {
            logger.error("Notification Error:", e);
        }
    }
}
