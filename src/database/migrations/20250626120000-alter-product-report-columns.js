"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("ProductReports", "productId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Products", // Adjust casing if necessary
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.changeColumn("ProductReports", "userId", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Users", // Adjust casing if necessary
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("ProductReports", "productId", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn("ProductReports", "userId", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};
