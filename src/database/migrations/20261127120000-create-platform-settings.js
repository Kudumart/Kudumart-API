"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("platform_settings", {
			key: {
				type: Sequelize.STRING(120),
				primaryKey: true,
				allowNull: false,
			},
			value: {
				type: Sequelize.TEXT("long"),
				allowNull: true,
			},
			updatedBy: {
				type: Sequelize.STRING(120),
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("platform_settings");
	},
};
