'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stores', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vendorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      currencyId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'currencies',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      location: {
        type: Sequelize.JSON,
        allowNull: true // Address or general location
      },
      businessHours: {
        type: Sequelize.JSON, // Example: { "Monday-Friday": "9am - 6pm", "Saturday": "10am - 4pm" }
        allowNull: true
      },
      deliveryOptions: {
        type: Sequelize.JSON, // Example: { "Standard": "5-7 days", "Express": "2-3 days" }
        allowNull: true
      },
      tipsOnFinding: {
        type: Sequelize.TEXT, // Any tips for finding the store, e.g., "Near Central Mall, second floor"
        allowNull: true
      },
      logo: {
        type: Sequelize.TEXT, // Any tips for finding the store, e.g., "Near Central Mall, second floor"
        allowNull: true
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Default is not verified
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
    await queryInterface.dropTable('stores');
  }
};