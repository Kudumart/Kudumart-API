'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('auction_products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vendorId: {
        type: Sequelize.UUID,
        allowNull: false
      },
      storeId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'stores',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sub_categories',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sku: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
      },
      condition: {
        type: Sequelize.ENUM('brand_new', 'fairly_used', 'fairly_foreign', 'refurbished'),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      specification: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      bidIncrement: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
      },
      maxBidsPerUser: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      participantsInterestFee: {
        type: Sequelize.DECIMAL(10, 2), // Fee participants pay to join the auction
        allowNull: true,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      additionalImages: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      auctionStatus: {
        type: Sequelize.ENUM('upcoming', 'ongoing', 'cancelled', 'ended'),
        defaultValue: 'upcoming',
        allowNull: false,
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
    await queryInterface.dropTable('auction_products');
  }
};