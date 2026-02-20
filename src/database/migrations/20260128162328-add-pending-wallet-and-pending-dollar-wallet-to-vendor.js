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
		await queryInterface.addColumn("users", "pendingWallet", {
			type: Sequelize.DECIMAL(20, 2),
			allowNull: false,
			defaultValue: 0.0,
		});

		await queryInterface.addColumn("users", "pendingDollarWallet", {
			type: Sequelize.DECIMAL(20, 2),
			allowNull: false,
			defaultValue: 0.0,
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeColumn("users", "pendingWallet");
		await queryInterface.removeColumn("users", "pendingDollarWallet");
	},
};
