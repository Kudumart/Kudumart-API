// controllers/installmentController.ts
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import logger from '../middlewares/logger';
import InstallmentConfig, { defaultTenures } from '../models/installmentConfig';
import InstallmentPlan from '../models/installmentPlan';
import InstallmentMilestone from '../models/installmentMilestone';
import User from '../models/user';
import Product from '../models/product';

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
 * Admin: Get active installment configuration
 */
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

/**
 * Admin: Update installment configuration
 */
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

    // Optional validations
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

/**
 * Public: Get active configuration for checkout calculator
 */
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

/**
 * Admin: List installment plans with filtering and pagination
 */
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

/**
 * Admin: Get single installment plan details
 */
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
