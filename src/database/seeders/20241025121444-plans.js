// seeders/20241024123456-FreePlanSeeder.js
'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface) => {
    // Check if the Free Plan already exists using rawSelect
    const existingPlanId = await queryInterface.rawSelect('subscription_plans', {
      where: { name: 'Free Plan' },
    }, ['id']);

    // Only create the Free Plan if it doesn't exist
    if (!existingPlanId) {
      await queryInterface.bulkInsert('subscription_plans', [
        {
          id: uuidv4(),
          name: 'Free Plan',
          duration: 1, // Duration in months
          price: 0.00,
          productLimit: 5, // Number of products allowed on the free plan
          allowsAuction: false, // Free plan does not allow auction by default
          auctionProductLimit: null,
          maxAds: null,
          adsDurationDays: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
    }
  },

  down: async (queryInterface) => {
    console.log("Skipping deletion of Free Plan.");
  },
};
