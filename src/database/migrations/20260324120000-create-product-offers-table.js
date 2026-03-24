"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("product_offers", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			productId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "products",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			buyerId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			offeredPrice: {
				type: Sequelize.DECIMAL(20, 2),
				allowNull: false,
			},
			message: {
				type: Sequelize.TEXT,
				allowNull: true,
			},
			status: {
				type: Sequelize.ENUM("pending", "accepted", "rejected", "countered"),
				allowNull: false,
				defaultValue: "pending",
			},
			counterPrice: {
				type: Sequelize.DECIMAL(20, 2),
				allowNull: true,
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
			},
		});
	},

	async down(queryInterface) {
		await queryInterface.dropTable("product_offers");
	},
};
