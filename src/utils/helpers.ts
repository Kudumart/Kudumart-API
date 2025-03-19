// utils/helpers.ts
import http from 'http';
import https from 'https';
import querystring from 'querystring';
import Admin from '../models/admin';
import Role from '../models/role';
import Permission from '../models/permission';
import VendorSubscription from '../models/vendorsubscription';
import SubscriptionPlan from '../models/subscriptionplan';
import Product from '../models/product';
import logger from '../middlewares/logger';
import { Op, Sequelize } from "sequelize";
import AuctionProduct from '../models/auctionproduct';
import Advert from '../models/advert';
import OrderItem from '../models/orderitem';
import Order from '../models/order';
import User from '../models/user';
import Job from '../models/job';
import Stripe from 'stripe';
import PaymentGateway from '../models/paymentgateway';

interface PaystackResponse {
  status: boolean;
  message: string;
  data?: any; // Replace `any` with the specific type of the Paystack `data` object if known
}

// Function to generate a 6-digit OTP
const generateOTP = (): string => {
  const otp: string = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  return otp;
};

// Utility function to capitalize the first letter of a string
function capitalizeFirstLetter(string: string): string {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

const sendSMS = async (mobile: string, messageContent: string): Promise<void> => {
  const apiUrl = 'portal.nigeriabulksms.com';
  const data = querystring.stringify({
    username: process.env.SMS_USERNAME, // Your SMS API username
    password: process.env.SMS_PASSWORD, // Your SMS API password
    sender: process.env.APP_NAME,     // Sender ID
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
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(responseData);
          if (result.status && result.status.toUpperCase() === 'OK') {
            logger.info('SMS sent successfully');
            resolve();
          } else {
            reject(new Error(`SMS failed with error: ${result.error}`));
          }
        } catch (error) {
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
};

const fetchAdminWithPermissions = async (adminId: string) => {
  return await Admin.findByPk(adminId, {
    include: [
      {
        model: Role,
        include: [Permission], // Assuming you have a Role and Permission model with proper associations
      },
    ],
  });
};

/**
 * Checks if a vendor has reached their product limit based on their active subscription plan.
 * @param vendorId - The ID of the vendor to check.
 * @returns A promise that resolves to an object indicating the status and a message.
 */
const checkVendorProductLimit = async (vendorId: string): Promise<{ status: boolean, message: string }> => {
  try {
    // Find the active subscription for the vendor
    const activeSubscription = await VendorSubscription.findOne({
      where: {
        vendorId,
        isActive: true,
      },
    });

    if (!activeSubscription) {
      return { status: false, message: 'Vendor does not have an active subscription.' };
    }

    // Fetch the subscription plan details
    const subscriptionPlan = await SubscriptionPlan.findByPk(activeSubscription.subscriptionPlanId);

    if (!subscriptionPlan) {
      return { status: false, message: 'Subscription plan not found.' };
    }

    const { productLimit } = subscriptionPlan;

    // Count the number of products already created by the vendor
    const productCount = await Product.count({
      where: { vendorId },
    });

    if (productCount >= productLimit) {
      return { status: false, message: 'You have reached the maximum number of products allowed for your current subscription plan. Please upgrade your plan to add more products.' };
    }

    return { status: true, message: 'Vendor can create more products.' };
  } catch (error: any) {
    // Error type should be handled more gracefully if you have custom error types
    throw new Error(error.message || 'An error occurred while checking the product limit.');
  }
};

const checkVendorAuctionProductLimit = async (vendorId: string): Promise<{ status: boolean, message: string }> => {
  try {
    // Find the active subscription for the vendor
    const activeSubscription = await VendorSubscription.findOne({
      where: {
        vendorId,
        isActive: true,
      },
    });

    if (!activeSubscription) {
      return { status: false, message: 'Vendor does not have an active subscription.' };
    }

    // Fetch the subscription plan details
    const subscriptionPlan = await SubscriptionPlan.findByPk(activeSubscription.subscriptionPlanId);

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
    const auctionProductCount = await AuctionProduct.count({
      where: { vendorId },
    });

    if (auctionProductCount >= auctionProductLimit) {
      return { status: false, message: 'You have reached the maximum number of auction products allowed for your current subscription plan. Please upgrade your plan to add more auction products.' };
    }

    return { status: true, message: 'Vendor can create more auction products.' };
  } catch (error: any) {
    // Error type should be handled more gracefully if you have custom error types
    throw new Error(error.message || 'An error occurred while checking the auction product limit.');
  }
};

const checkAdvertLimit = async (vendorId: string): Promise<{ status: boolean, message: string }> => {
  try {
    // Find the active subscription for the vendor
    const activeSubscription = await VendorSubscription.findOne({
      where: {
        vendorId,
        isActive: true,
      },
    });

    if (!activeSubscription) {
      return { status: false, message: 'Vendor does not have an active subscription.' };
    }

    // Fetch the subscription plan details
    const subscriptionPlan = await SubscriptionPlan.findByPk(activeSubscription.subscriptionPlanId);

    if (!subscriptionPlan) {
      return { status: false, message: 'Subscription plan not found.' };
    }

    const maxAds = subscriptionPlan.maxAds;

    // Handle the case where maxAds is null
    if (maxAds === null) {
      return { status: false, message: 'Your subscription plan does not define a limit for adverts.' };
    }

    // Count the number of adverts already created by the vendor
    const maxAdsCount = await Advert.count({
      where: { userId: vendorId },
    });

    if (maxAdsCount >= maxAds) {
      return { status: false, message: 'You have reached the maximum number of adverts allowed for your current subscription plan. Please upgrade your plan to add more adverts.' };
    }

    return { status: true, message: 'Vendor can create more adverts.' };
  } catch (error: any) {
    // Error type should be handled more gracefully if you have custom error types
    throw new Error(error.message || 'An error occurred while checking the advert limit.');
  }
};

const verifyPayment = (refId: string, paystackSecretKey: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.paystack.co",
      path: `/transaction/verify/${refId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`, // Use dynamic key
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const response: PaystackResponse = JSON.parse(data);

          if (response.status) {
            resolve(response.data);
          } else {
            reject(new Error(`Paystack Error: ${response.message}`));
          }
        } catch (err) {
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

// Utility function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const hasPurchasedProduct = async (orderId: string, productId: string) => {
  const orderItem = await OrderItem.findOne({
      where: {
          orderId,
          status: "delivered",
          [Op.and]: Sequelize.literal(`JSON_UNQUOTE(JSON_EXTRACT(product, '$.id')) = '${productId}'`)
      }
  });

  return !!orderItem; // Returns true if found, false otherwise
};

const generateUniquePhoneNumber = async () => {
  let phoneNumber;
  let isUnique = false;

  while (!isUnique) {
    // Generate a random 10-digit number (US-style format)
    phoneNumber = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;

    // Check if this phone number already exists in the database
    const existingUser = await User.findOne({ where: { phoneNumber } });

    if (!existingUser) {
      isUnique = true;
    }
  }

  return phoneNumber;
};

const getJobsBySearch = async (searchTerm: string, number: number) => {
  const where: any = { status: 'active' };

  if (searchTerm) {
      const searchRegex = { [Op.iLike]: `%${searchTerm}%` }; // Use Sequelize's Op.iLike for case-insensitive search.
      where[Op.or] = [
          { title: searchRegex },
          { workplace_type: searchRegex },
          { job_type: searchRegex },
          { location: searchRegex },
      ];
  }

  return await Job.findAll({
      where,
      order: [['createdAt', 'DESC']], // Sort by createdAt in descending order.
      limit: number, // Limit the number of results.
  });
};

export const getStripeSecretKey = async (): Promise<string | null> => {
  try {
    const paymentGateway = await PaymentGateway.findOne({
      where: {
        isActive: true,
        name: "stripe", // Assuming 'name' is the field storing the gateway name
      },
    });

    if (!paymentGateway) {
      logger.error("No active Stripe gateway found.");
      return null;
    }

    return paymentGateway.secretKey; // Ensure your model has this field
  } catch (error) {
    logger.error("Error fetching Stripe secret key:", error);
    return null;
  }
};

const initStripe = async () => {
  const secretKey = await getStripeSecretKey();

  if (!secretKey) {
    throw new Error("Stripe secret key not found.");
  }

  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia" as any, // Force TypeScript to accept it
  });
};

// Export functions
export { generateOTP, capitalizeFirstLetter, sendSMS, fetchAdminWithPermissions, checkVendorProductLimit, checkVendorAuctionProductLimit, checkAdvertLimit, verifyPayment, shuffleArray, hasPurchasedProduct, generateUniquePhoneNumber, getJobsBySearch, initStripe };
