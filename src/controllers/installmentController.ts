// controllers/installmentController.ts
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import logger from '../middlewares/logger';
import InstallmentConfig, { defaultTenures, AllowedTenure } from '../models/installmentConfig';
import InstallmentPlan from '../models/installmentPlan';
import InstallmentMilestone from '../models/installmentMilestone';
import User from '../models/user';
import Product from '../models/product';
import Cart from '../models/cart';
import Order from '../models/order';
import OrderItem from '../models/orderitem';
import Payment from '../models/payment';
import Notification from '../models/notification';
import PaymentGateway from '../models/paymentgateway';
import sequelizeService from '../services/sequelize.service';
import { initializePaystackPayment, verifyPayment } from '../utils/helpers';
import { getEffectiveProductPrice } from '../utils/pricing';
import { AuthenticatedRequest } from '../types';

/**
 * Helper to ensure a singleton config row exists
 */
const getOrCreateConfig = async () => {
  let config = await InstallmentConfig.findOne();
  if (!config) {
    config = await InstallmentConfig.create({
      system_mode: 'layaway_only',
      fulfillment_trigger: 'on_completion',
      min_order_amount: 25000.0,
      max_order_amount: 2000000.0,
      min_deposit_percentage: 25,
      allowed_tenures: defaultTenures,
      financing_fee_percentage: 0.0,
      grace_period_days: 5,
      cancellation_fee_percentage: 8.0,
      vendor_split_percentage: 50.0,
      refund_to_wallet: true,
      eligible_categories: [],
      vendor_restriction: 'all_vendors',
    });
  }
  return config;
};

/**
 * Helper to fetch active Paystack secret key
 */
const getPaystackSecretKey = async (): Promise<string> => {
  const paymentGateway = await PaymentGateway.findOne({
    where: {
      name: { [Op.like]: '%Paystack%' },
      isActive: true,
    },
  });
  const secretKey = paymentGateway?.secretKey || process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) {
    throw new Error('Active Paystack gateway not configured');
  }
  return secretKey;
};

// ==========================================
// ADMIN CONTROLLERS
// ==========================================

export const getInstallmentConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateConfig();
    res.status(200).json({
      status: true,
      message: 'Installment configuration fetched successfully',
      data: config,
    });
  } catch (error) {
    logger.error('Error fetching installment config:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch installment configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateInstallmentConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateConfig();
    const {
      system_mode,
      fulfillment_trigger,
      min_order_amount,
      max_order_amount,
      min_deposit_percentage,
      allowed_tenures,
      financing_fee_percentage,
      grace_period_days,
      cancellation_fee_percentage,
      vendor_split_percentage,
      refund_to_wallet,
      eligible_categories,
      vendor_restriction,
    } = req.body;

    if (min_deposit_percentage !== undefined && (min_deposit_percentage < 10 || min_deposit_percentage > 90)) {
      res.status(400).json({
        status: false,
        message: 'Minimum deposit percentage must be between 10% and 90%',
      });
      return;
    }

    if (min_order_amount !== undefined && max_order_amount !== undefined && Number(min_order_amount) > Number(max_order_amount)) {
      res.status(400).json({
        status: false,
        message: 'Minimum order amount cannot exceed maximum order amount',
      });
      return;
    }

    await config.update({
      ...(system_mode !== undefined && { system_mode }),
      ...(fulfillment_trigger !== undefined && { fulfillment_trigger }),
      ...(min_order_amount !== undefined && { min_order_amount: Number(min_order_amount) }),
      ...(max_order_amount !== undefined && { max_order_amount: Number(max_order_amount) }),
      ...(min_deposit_percentage !== undefined && { min_deposit_percentage: Number(min_deposit_percentage) }),
      ...(allowed_tenures !== undefined && { allowed_tenures }),
      ...(financing_fee_percentage !== undefined && { financing_fee_percentage: Number(financing_fee_percentage) }),
      ...(grace_period_days !== undefined && { grace_period_days: Number(grace_period_days) }),
      ...(cancellation_fee_percentage !== undefined && { cancellation_fee_percentage: Number(cancellation_fee_percentage) }),
      ...(vendor_split_percentage !== undefined && { vendor_split_percentage: Number(vendor_split_percentage) }),
      ...(refund_to_wallet !== undefined && { refund_to_wallet: Boolean(refund_to_wallet) }),
      ...(eligible_categories !== undefined && { eligible_categories }),
      ...(vendor_restriction !== undefined && { vendor_restriction }),
    });

    res.status(200).json({
      status: true,
      message: 'Installment configuration updated successfully',
      data: config,
    });
  } catch (error) {
    logger.error('Error updating installment config:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to update installment configuration',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getPublicInstallmentConfig = async (_req: Request, res: Response): Promise<void> => {
  try {
    const config = await getOrCreateConfig();
    res.status(200).json({
      status: true,
      data: {
        system_mode: config.system_mode,
        fulfillment_trigger: config.fulfillment_trigger,
        min_order_amount: config.min_order_amount,
        max_order_amount: config.max_order_amount,
        min_deposit_percentage: config.min_deposit_percentage,
        allowed_tenures: (config.allowed_tenures || []).filter((t: any) => t.is_active !== false),
        financing_fee_percentage: config.financing_fee_percentage,
        grace_period_days: config.grace_period_days,
        cancellation_fee_percentage: config.cancellation_fee_percentage,
        eligible_categories: config.eligible_categories || [],
      },
    });
  } catch (error) {
    logger.error('Error fetching public installment config:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch installment settings',
    });
  }
};

export const getAdminInstallmentPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 15));
    const offset = (page - 1) * limit;
    const { status, search } = req.query;

    const whereClause: any = {};
    if (status && ['active', 'completed', 'defaulted', 'cancelled'].includes(status as string)) {
      whereClause.status = status;
    }

    const { count, rows } = await InstallmentPlan.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
          where: search
            ? {
                [Op.or]: [
                  { firstName: { [Op.iLike]: `%${search}%` } },
                  { lastName: { [Op.iLike]: `%${search}%` } },
                  { email: { [Op.iLike]: `%${search}%` } },
                ],
              }
            : undefined,
          required: Boolean(search),
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url'],
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: InstallmentMilestone,
          as: 'milestones',
        },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    res.status(200).json({
      status: true,
      message: 'Installment plans fetched successfully',
      data: {
        plans: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching installment plans:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch installment plans',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAdminInstallmentPlanDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const plan = await InstallmentPlan.findByPk(id, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
        },
        {
          model: Product,
          as: 'product',
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
        },
        {
          model: InstallmentMilestone,
          as: 'milestones',
        },
      ],
    });

    if (!plan) {
      res.status(404).json({
        status: false,
        message: 'Installment plan not found',
      });
      return;
    }

    res.status(200).json({
      status: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Error fetching installment plan detail:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch installment plan detail',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// ==========================================
// USER (BUYER) CHECKOUT & MILESTONE CONTROLLERS
// ==========================================

/**
 * Prepares an installment plan checkout session and initializes Paystack for Milestone #1 (Deposit)
 */
export const prepareInstallmentCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ status: false, message: 'Authentication required' });
      return;
    }

    const {
      productId,
      quantity = 1,
      tenureId,
      depositPercentage,
      shippingAddress,
      deliveryMethod = 'delivery',
      deliveryFee = 0,
    } = req.body;

    if (!productId) {
      res.status(400).json({ status: false, message: 'Product ID is required' });
      return;
    }

    const config = await getOrCreateConfig();
    if (config.system_mode === 'disabled') {
      res.status(400).json({ status: false, message: 'Installment payments are currently disabled.' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ status: false, message: 'User not found' });
      return;
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(404).json({ status: false, message: 'Product not found' });
      return;
    }

    const effectivePrice = getEffectiveProductPrice(product.price, product.discount_price);
    const orderItemTotal = effectivePrice * Number(quantity);

    if (orderItemTotal < Number(config.min_order_amount) || orderItemTotal > Number(config.max_order_amount)) {
      res.status(400).json({
        status: false,
        message: `Order amount (₦${orderItemTotal.toLocaleString()}) does not fall within installment limits (₦${Number(config.min_order_amount).toLocaleString()} - ₦${Number(config.max_order_amount).toLocaleString()})`,
      });
      return;
    }

    if ((product.quantity ?? 0) < Number(quantity)) {
      res.status(400).json({ status: false, message: 'Insufficient product inventory to reserve item.' });
      return;
    }

    // Match chosen tenure
    const tenures: AllowedTenure[] = config.allowed_tenures || defaultTenures;
    const activeTenures = tenures.filter((t) => t.is_active !== false);
    const chosenTenure = activeTenures.find((t) => t.id === tenureId) || activeTenures[0];
    if (!chosenTenure) {
      res.status(400).json({ status: false, message: 'No valid installment tenure duration available' });
      return;
    }

    // Calculate Deposit & Schedule
    const chosenDepositPct = Math.max(
      Number(depositPercentage) || config.min_deposit_percentage,
      config.min_deposit_percentage,
    );

    const shipping = deliveryMethod === 'pickup' ? 0 : Math.max(0, Number(deliveryFee) || 0);
    const financingFee = Math.round((orderItemTotal * (Number(config.financing_fee_percentage) || 0) / 100) * 100) / 100;
    const totalAmount = orderItemTotal + shipping + financingFee;
    const depositAmount = Math.round((totalAmount * (chosenDepositPct / 100)) * 100) / 100;
    const remainingBalance = Math.round((totalAmount - depositAmount) * 100) / 100;

    const subsequentMilestoneCount = Math.max(1, chosenTenure.installments - 1);
    const subsequentAmount = Math.round((remainingBalance / subsequentMilestoneCount) * 100) / 100;

    // Build milestone timeline preview
    const milestones = [];
    milestones.push({
      installmentNumber: 1,
      amount: depositAmount,
      dueDate: new Date(),
      status: 'pending',
      label: 'Initial Deposit (Today)',
    });

    for (let i = 1; i <= subsequentMilestoneCount; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + i * (chosenTenure.interval_days || 30));
      const amount = i === subsequentMilestoneCount
        ? Math.round((remainingBalance - subsequentAmount * (subsequentMilestoneCount - 1)) * 100) / 100
        : subsequentAmount;

      milestones.push({
        installmentNumber: i + 1,
        amount,
        dueDate,
        status: 'pending',
        label: `Payment #${i + 1}`,
      });
    }

    // Initialize Paystack for Milestone #1
    const secretKey = await getPaystackSecretKey();
    const refId = `psk_inst_${uuidv4().substring(0, 8)}_${Date.now()}`;
    const paystack = await initializePaystackPayment(refId, depositAmount, user.email, secretKey);

    res.status(200).json({
      status: true,
      message: 'Installment checkout initialized',
      data: {
        refId,
        productPrice: orderItemTotal,
        shippingFee: shipping,
        financingFee,
        totalAmount,
        depositAmount,
        remainingBalance,
        tenure: chosenTenure,
        milestones,
        shippingAddress,
        deliveryMethod,
        paystackDetails: paystack,
      },
    });
  } catch (error) {
    logger.error('Error preparing installment checkout:', error);
    res.status(500).json({
      status: false,
      message: error instanceof Error ? error.message : 'Failed to prepare installment checkout',
    });
  }
};

/**
 * Confirms payment of Milestone #1, decrements inventory stock, and creates the InstallmentPlan
 */
export const confirmInstallmentCheckout = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id;
  if (!userId) {
    res.status(401).json({ status: false, message: 'Authentication required' });
    return;
  }

  const {
    refId,
    productId,
    quantity = 1,
    tenureId,
    depositPercentage,
    shippingAddress,
    deliveryMethod = 'delivery',
    deliveryFee = 0,
  } = req.body;

  if (!refId || !productId) {
    res.status(400).json({ status: false, message: 'Reference ID and Product ID are required' });
    return;
  }

  const transaction = await sequelizeService.connection!.transaction();
  try {
    const config = await getOrCreateConfig();
    const secretKey = await getPaystackSecretKey();

    // Verify Paystack payment
    const verification = await verifyPayment(refId, secretKey);
    if (verification.status !== 'success') {
      await transaction.rollback();
      res.status(400).json({ status: false, message: 'Payment verification failed' });
      return;
    }

    const product = await Product.findByPk(productId, { transaction });
    if (!product) {
      await transaction.rollback();
      res.status(404).json({ status: false, message: 'Product not found' });
      return;
    }

    if ((product.quantity ?? 0) < Number(quantity)) {
      await transaction.rollback();
      res.status(400).json({ status: false, message: 'Insufficient stock to complete reservation' });
      return;
    }

    // Decrement stock to hold item exclusively for this buyer
    await product.update(
      { quantity: Math.max(0, (product.quantity || 0) - Number(quantity)) },
      { transaction },
    );

    // Calculate financials
    const effectivePrice = getEffectiveProductPrice(product.price, product.discount_price);
    const orderItemTotal = effectivePrice * Number(quantity);
    const tenures: AllowedTenure[] = config.allowed_tenures || defaultTenures;
    const activeTenures = tenures.filter((t) => t.is_active !== false);
    const chosenTenure = activeTenures.find((t) => t.id === tenureId) || activeTenures[0];

    const chosenDepositPct = Math.max(
      Number(depositPercentage) || config.min_deposit_percentage,
      config.min_deposit_percentage,
    );

    const shipping = deliveryMethod === 'pickup' ? 0 : Math.max(0, Number(deliveryFee) || 0);
    const financingFee = Math.round((orderItemTotal * (Number(config.financing_fee_percentage) || 0) / 100) * 100) / 100;
    const totalAmount = orderItemTotal + shipping + financingFee;
    const depositAmount = Math.round((totalAmount * (chosenDepositPct / 100)) * 100) / 100;
    const remainingBalance = Math.round((totalAmount - depositAmount) * 100) / 100;

    const holdingDays = (chosenTenure.tenure_days || 60) + (config.grace_period_days || 5);
    const reservedUntil = new Date(Date.now() + holdingDays * 86400000);

    // Determine operating mode
    const mode = config.system_mode === 'bnpl_only' ? 'bnpl' : 'layaway';
    const fulfillment_trigger = config.fulfillment_trigger;

    // Create the plan
    const plan = await InstallmentPlan.create(
      {
        userId,
        productId,
        vendorId: product.vendorId,
        storeId: product.storeId,
        mode,
        fulfillment_trigger,
        productPrice: orderItemTotal,
        shippingFee: shipping,
        financingFee,
        totalAmount,
        depositAmount,
        remainingBalance,
        numberOfInstallments: chosenTenure.installments,
        tenureDays: chosenTenure.tenure_days,
        status: 'active',
        shippingAddress: typeof shippingAddress === 'string' ? { address: shippingAddress } : shippingAddress,
        reservedUntil,
      },
      { transaction },
    );

    // Create Milestone #1 (Paid)
    await InstallmentMilestone.create(
      {
        planId: plan.id,
        installmentNumber: 1,
        amount: depositAmount,
        dueDate: new Date(),
        paidAt: new Date(),
        status: 'paid',
        paymentReference: refId,
        gateway: 'Paystack',
        paymentMethod: 'card',
      },
      { transaction },
    );

    // Create Subsequent Milestones (Pending)
    const subsequentMilestoneCount = Math.max(1, chosenTenure.installments - 1);
    const subsequentAmount = Math.round((remainingBalance / subsequentMilestoneCount) * 100) / 100;

    for (let i = 1; i <= subsequentMilestoneCount; i++) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + i * (chosenTenure.interval_days || 30));
      const amount = i === subsequentMilestoneCount
        ? Math.round((remainingBalance - subsequentAmount * (subsequentMilestoneCount - 1)) * 100) / 100
        : subsequentAmount;

      await InstallmentMilestone.create(
        {
          planId: plan.id,
          installmentNumber: i + 1,
          amount,
          dueDate,
          status: 'pending',
        },
        { transaction },
      );
    }

    // If BNPL (ship on deposit), create the Order right away
    if (fulfillment_trigger === 'on_deposit') {
      const order = await Order.create(
        {
          userId,
          totalAmount,
          refId,
          shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : shippingAddress?.address || 'Standard Delivery',
          deliveryCode: null,
        },
        { transaction },
      );

      await OrderItem.create(
        {
          orderId: order.id,
          vendorId: product.vendorId,
          product,
          quantity: Number(quantity),
          price: effectivePrice,
          status: 'pending',
        },
        { transaction },
      );

      await plan.update({ orderId: order.id }, { transaction });
    }

    // Remove from cart if present
    await Cart.destroy({
      where: { userId, productId },
      transaction,
    });

    // Notify Buyer
    await Notification.create(
      {
        userId,
        title: mode === 'bnpl' ? 'BNPL Order Confirmed' : 'Layaway Reservation Confirmed',
        type: 'order_confirmation',
        message: mode === 'bnpl'
          ? `Your installment purchase for "${product.name}" has been placed and is being prepared.`
          : `Item "${product.name}" is reserved exclusively for you until ${reservedUntil.toLocaleDateString()}. Make remaining payments anytime.`,
      },
      { transaction },
    );

    // Notify Vendor
    if (product.vendorId) {
      await Notification.create(
        {
          userId: product.vendorId,
          title: mode === 'bnpl' ? 'New BNPL Order Dispatched' : 'Product Placed on Layaway Reservation',
          type: 'new_order',
          message: mode === 'bnpl'
            ? `An installment order for "${product.name}" was approved and is ready to fulfill.`
            : `Product "${product.name}" has been reserved under customer layaway. Stock has been placed on hold.`,
        },
        { transaction },
      );
    }

    await transaction.commit();

    res.status(200).json({
      status: true,
      message: mode === 'bnpl' ? 'Installment purchase successful' : 'Layaway reservation confirmed',
      data: { planId: plan.id, plan },
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Error confirming installment checkout:', error);
    res.status(500).json({
      status: false,
      message: error instanceof Error ? error.message : 'Failed to confirm installment checkout',
    });
  }
};

/**
 * Buyer fetches their active and completed installment plans
 */
export const getUserInstallmentPlans = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    if (!userId) {
      res.status(401).json({ status: false, message: 'Authentication required' });
      return;
    }

    const { status } = req.query;
    const whereClause: any = { userId };
    if (status && ['active', 'completed', 'defaulted', 'cancelled'].includes(status as string)) {
      whereClause.status = status;
    }

    const plans = await InstallmentPlan.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: InstallmentMilestone,
          as: 'milestones',
        },
      ],
      order: [
        ['createdAt', 'DESC'],
        [{ model: InstallmentMilestone, as: 'milestones' }, 'installmentNumber', 'ASC'],
      ],
    });

    res.status(200).json({
      status: true,
      data: plans,
    });
  } catch (error) {
    logger.error('Error fetching user installment plans:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch installment plans',
    });
  }
};

/**
 * Buyer fetches details of a specific installment plan
 */
export const getUserInstallmentPlanDetail = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const planId = req.params.id as string;

    const plan = await InstallmentPlan.findOne({
      where: { id: planId, userId },
      include: [
        {
          model: Product,
          as: 'product',
        },
        {
          model: User,
          as: 'vendor',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
        {
          model: InstallmentMilestone,
          as: 'milestones',
        },
      ],
      order: [[{ model: InstallmentMilestone, as: 'milestones' }, 'installmentNumber', 'ASC']],
    });

    if (!plan) {
      res.status(404).json({ status: false, message: 'Installment plan not found' });
      return;
    }

    res.status(200).json({
      status: true,
      data: plan,
    });
  } catch (error) {
    logger.error('Error fetching user installment plan detail:', error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch plan detail',
    });
  }
};

/**
 * Prepares Paystack payment session for an upcoming milestone (#2, #3, etc.)
 */
export const prepareMilestonePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const milestoneId = req.params.milestoneId as string;

    const milestone = await InstallmentMilestone.findByPk(milestoneId, {
      include: [{ model: InstallmentPlan, as: 'plan' }],
    });

    if (!milestone || !milestone.plan || milestone.plan.userId !== userId) {
      res.status(404).json({ status: false, message: 'Installment milestone not found' });
      return;
    }

    if (milestone.status === 'paid') {
      res.status(400).json({ status: false, message: 'This milestone has already been paid.' });
      return;
    }

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ status: false, message: 'User not found' });
      return;
    }

    const secretKey = await getPaystackSecretKey();
    const refId = `psk_ms_${uuidv4().substring(0, 8)}_${Date.now()}`;
    const paystack = await initializePaystackPayment(refId, Number(milestone.amount), user.email, secretKey);

    res.status(200).json({
      status: true,
      data: {
        refId,
        milestoneId,
        amount: milestone.amount,
        installmentNumber: milestone.installmentNumber,
        paystackDetails: paystack,
      },
    });
  } catch (error) {
    logger.error('Error preparing milestone payment:', error);
    res.status(500).json({
      status: false,
      message: error instanceof Error ? error.message : 'Failed to prepare milestone payment',
    });
  }
};

/**
 * Confirms payment of an upcoming milestone and triggers fulfillment if plan is complete
 */
export const confirmMilestonePayment = async (req: Request, res: Response): Promise<void> => {
  const userId = (req as AuthenticatedRequest).user?.id;
  const milestoneId = req.params.milestoneId as string;
  const { refId } = req.body;

  if (!refId) {
    res.status(400).json({ status: false, message: 'Payment reference ID is required' });
    return;
  }

  const transaction = await sequelizeService.connection!.transaction();
  try {
    const secretKey = await getPaystackSecretKey();

    // Verify Paystack
    const verification = await verifyPayment(refId, secretKey);
    if (verification.status !== 'success') {
      await transaction.rollback();
      res.status(400).json({ status: false, message: 'Payment verification failed' });
      return;
    }

    const milestone = await InstallmentMilestone.findByPk(milestoneId, {
      include: [
        {
          model: InstallmentPlan,
          as: 'plan',
          include: [{ model: Product, as: 'product' }],
        },
      ],
      transaction,
    });

    if (!milestone || !milestone.plan || milestone.plan.userId !== userId) {
      await transaction.rollback();
      res.status(404).json({ status: false, message: 'Installment milestone not found' });
      return;
    }

    if (milestone.status === 'paid') {
      await transaction.rollback();
      res.status(400).json({ status: false, message: 'Milestone is already paid' });
      return;
    }

    // Mark milestone paid
    await milestone.update(
      {
        status: 'paid',
        paidAt: new Date(),
        paymentReference: refId,
        gateway: 'Paystack',
        paymentMethod: 'card',
      },
      { transaction },
    );

    // Update remaining balance
    const plan = milestone.plan;
    const newRemainingBalance = Math.max(0, Math.round((Number(plan.remainingBalance) - Number(milestone.amount)) * 100) / 100);

    // Check all milestones
    const allMilestones = await InstallmentMilestone.findAll({
      where: { planId: plan.id },
      transaction,
    });

    const allPaid = allMilestones.every((m) => m.id === milestone.id || m.status === 'paid');

    if (allPaid || newRemainingBalance <= 0) {
      await plan.update(
        {
          remainingBalance: 0,
          status: 'completed',
          completedAt: new Date(),
        },
        { transaction },
      );

      // If layaway (fulfillment on completion), create the Order for delivery now!
      if (plan.fulfillment_trigger === 'on_completion' && !plan.orderId) {
        const order = await Order.create(
          {
            userId,
            totalAmount: plan.totalAmount,
            refId,
            shippingAddress: typeof plan.shippingAddress === 'string'
              ? plan.shippingAddress
              : (plan.shippingAddress as any)?.address || 'Standard Delivery',
            deliveryCode: null,
          },
          { transaction },
        );

        await OrderItem.create(
          {
            orderId: order.id,
            vendorId: plan.vendorId,
            product: plan.product,
            quantity: 1,
            price: plan.productPrice,
            status: 'pending',
          },
          { transaction },
        );

        await plan.update({ orderId: order.id }, { transaction });

        // Notify Buyer
        await Notification.create(
          {
            userId,
            title: 'Layaway 100% Paid – Order Dispatched!',
            type: 'order_confirmation',
            message: `Congratulations! Your layaway plan for "${plan.product?.name || 'your item'}" is fully paid. Your order is now in delivery.`,
          },
          { transaction },
        );

        // Notify Vendor
        if (plan.vendorId) {
          await Notification.create(
            {
              userId: plan.vendorId,
              title: 'Layaway Fully Completed – Fulfill Order',
              type: 'new_order',
              message: `Customer has completed all installment payments for "${plan.product?.name || 'the item'}". Please fulfill and ship the order.`,
            },
            { transaction },
          );
        }
      }
    } else {
      await plan.update({ remainingBalance: newRemainingBalance }, { transaction });

      // Notify Buyer of milestone received
      await Notification.create(
        {
          userId,
          title: `Milestone #${milestone.installmentNumber} Payment Received`,
          type: 'order_confirmation',
          message: `Your payment of ₦${Number(milestone.amount).toLocaleString()} was received. Remaining balance: ₦${newRemainingBalance.toLocaleString()}.`,
        },
        { transaction },
      );
    }

    await transaction.commit();

    res.status(200).json({
      status: true,
      message: allPaid ? 'Installment plan completed in full!' : 'Milestone payment recorded successfully',
      data: { plan, milestone },
    });
  } catch (error) {
    await transaction.rollback();
    logger.error('Error confirming milestone payment:', error);
    res.status(500).json({
      status: false,
      message: error instanceof Error ? error.message : 'Failed to confirm milestone payment',
    });
  }
};
