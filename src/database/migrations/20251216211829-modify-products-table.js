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
		await queryInterface.addColumn("products", "type", {
			type: Sequelize.ENUM("dropship", "in_stock"),
			allowNull: false,
			defaultValue: "in_stock",
		});

		await queryInterface.addColumn("products", "variants", {
			type: Sequelize.JSON,
			allowNull: true,
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

		await queryInterface.removeColumn("products", "type");
		await queryInterface.removeColumn("products", "variants");
	},
};
