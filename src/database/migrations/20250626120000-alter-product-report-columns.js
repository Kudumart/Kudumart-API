"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("ProductReports", "productId", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("ProductReports", "userId", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("ProductReports", "productId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn("ProductReports", "userId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
