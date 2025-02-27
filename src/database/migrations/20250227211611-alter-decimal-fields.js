'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Alter auction_products table
    await queryInterface.changeColumn('auction_products', 'price', {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn('auction_products', 'bidIncrement', {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: true,
    });

    await queryInterface.changeColumn('auction_products', 'participantsInterestFee', {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: true,
    });

    // Alter products table
    await queryInterface.changeColumn('products', 'price', {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn('products', 'discount_price', {
      type: Sequelize.DECIMAL(20, 2),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Revert changes for auction_products table
    await queryInterface.changeColumn('auction_products', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn('auction_products', 'bidIncrement', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: true,
    });

    await queryInterface.changeColumn('auction_products', 'participantsInterestFee', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });

    // Revert changes for products table
    await queryInterface.changeColumn('products', 'price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });

    await queryInterface.changeColumn('products', 'discount_price', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
    });
  }
};
