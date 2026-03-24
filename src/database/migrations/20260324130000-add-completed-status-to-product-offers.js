"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.changeColumn("product_offers", "status", {
			type: Sequelize.ENUM("pending", "accepted", "rejected", "countered", "completed"),
			allowNull: false,
			defaultValue: "pending",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.changeColumn("product_offers", "status", {
			type: Sequelize.ENUM("pending", "accepted", "rejected", "countered"),
			allowNull: false,
			defaultValue: "pending",
		});
	},
};
