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
import AuctionProduct from '../models/auctionproduct';
import Advert from '../models/advert';

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
            console.log('SMS sent successfully');
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

// Export functions
export { generateOTP, capitalizeFirstLetter, sendSMS, fetchAdminWithPermissions, checkVendorProductLimit, checkVendorAuctionProductLimit, checkAdvertLimit, verifyPayment, shuffleArray };
