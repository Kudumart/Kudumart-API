'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('bids', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      auctionProductId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'auction_products', // Ensure this matches your AuctionProduct table name
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      bidderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users', // Ensure this matches your Users table name
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      bidAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      bidCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      isWinningBid: { 
        type: Sequelize.BOOLEAN, 
        defaultValue: false, 
        allowNull: false 
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
    await queryInterface.dropTable('bids');
  }
};