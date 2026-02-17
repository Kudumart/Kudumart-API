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
		await queryInterface.addColumn("products", "video_url", {
			type: Sequelize.STRING,
			allowNull: true,
			defaultValue: null,
			comment: "URL of the product video",
		});

		await queryInterface.addColumn("auction_products", "video", {
			type: Sequelize.STRING,
			allowNull: true,
			defaultValue: null,
			comment: "URL of the auction product video",
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeColumn("products", "video_url");
		await queryInterface.removeColumn("auction_products", "video");
	},
};
