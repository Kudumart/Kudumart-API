'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add 'reason' column to 'blocked_vendors' table
    await queryInterface.addColumn('blocked_vendors', 'reason', {
      type: Sequelize.STRING,
      allowNull: true, // Reason is optional
      comment: 'Reason for blocking the vendor',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove 'reason' column from 'blocked_vendors' table
    await queryInterface.removeColumn('blocked_vendors', 'reason');
  },
};
