'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_plans', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      duration: {
        type: Sequelize.INTEGER, // Duration in months
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0, // Free plan has price 0
      },
      productLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      allowsAuction: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Free plan may not allow auctions
      },
      auctionProductLimit: {
        type: Sequelize.INTEGER,
        allowNull: true, // Null if auctions are not allowed
      },
      maxAds: {
        type: Sequelize.INTEGER,
        allowNull: true, // Null if auctions are not allowed
        defaultValue: 0
      },
      adsDurationDays: {
        type: Sequelize.INTEGER,
        allowNull: true, // Null if auctions are not allowed
        defaultValue: 0
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
    await queryInterface.dropTable('subscription_plans');
  }
};