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

		await queryInterface.addColumn("order_items", "dropshipProductId", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("order_items", "dropshipOrderItemIds", {
			type: Sequelize.JSON,
			allowNull: false,
			defaultValue: [],
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	},
};
