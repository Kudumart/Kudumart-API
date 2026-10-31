"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("otps", "purpose", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		await queryInterface.addColumn("otps", "pendingValue", {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn("otps", "pendingValue");
		await queryInterface.removeColumn("otps", "purpose");
	},
};
