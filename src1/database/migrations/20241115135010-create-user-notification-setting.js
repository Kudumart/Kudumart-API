'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_notification_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      hotDeals: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,  // Default is false (not enabled)
      },
      auctionProducts: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,  // Default is false (not enabled)
      },
      subscription: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,  // Default is false (not enabled)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_notification_settings');
  }
};