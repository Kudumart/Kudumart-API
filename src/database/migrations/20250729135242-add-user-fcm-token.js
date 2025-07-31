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
		await queryInterface.addColumn("users", "fcmToken", {
			type: Sequelize.STRING,
			allowNull: true,
			defaultValue: null,
			comment: "Firebase Cloud Messaging Token for push notifications",
		});
		await queryInterface.addColumn("admins", "fcmToken", {
			type: Sequelize.STRING,
			allowNull: true,
			defaultValue: null,
			comment: "Firebase Cloud Messaging Token for push notifications",
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeColumn("users", "fcmToken");
		await queryInterface.removeColumn("admins", "fcmToken");
	},
};
