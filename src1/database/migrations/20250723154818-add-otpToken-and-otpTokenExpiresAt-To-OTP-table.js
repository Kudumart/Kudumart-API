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
		await queryInterface.addColumn("otps", "otpToken", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn("otps", "otpTokenExpiresAt", {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeColumn("otps", "otpToken");
		await queryInterface.removeColumn("otps", "otpTokenExpiresAt");
	},
};
