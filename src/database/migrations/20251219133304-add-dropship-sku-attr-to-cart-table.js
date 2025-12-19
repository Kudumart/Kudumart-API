"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		await queryInterface.addColumn("carts", "dropshipProductSkuId", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("carts", "dropshipProductSkuAttr", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("carts", "productType", {
			type: Sequelize.ENUM("in_stock", "dropship"),
			allowNull: false,
			defaultValue: "in_stock",
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeColumn("carts", "dropshipProductSkuAttr");
		await queryInterface.removeColumn("carts", "dropshipProductSkuId");
		await queryInterface.removeColumn("carts", "productType");
	},
};
