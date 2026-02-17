"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("auction_reminders", {
			id: {
				type: Sequelize.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			userId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			auctionProductId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "auction_products",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			sendDate: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			daysBefore: {
				type: Sequelize.INTEGER,
				allowNull: false,
			},
			sent: {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	async down(queryInterface, _) {
		await queryInterface.dropTable("Reminders");
	},
};
