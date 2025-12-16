"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("ServiceBookings", {
			id: {
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			serviceId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "services",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			userId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			vendorId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: {
					model: "users", // Assuming vendors are also in the Users table
					key: "id",
				},
				onUpdate: "CASCADE",
				onDelete: "CASCADE",
			},
			bookingDate: {
				type: Sequelize.DATE,
				allowNull: false,
			},
			status: {
				type: Sequelize.ENUM("pending", "confirmed", "canceled", "completed"),
				allowNull: false,
				defaultValue: "pending",
			},
			createdAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
			},
			updatedAt: {
				type: Sequelize.DATE,
				allowNull: false,
				defaultValue: Sequelize.literal(
					"CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
				),
			},
		});

		// Add indexes for better performance
		await queryInterface.addIndex("ServiceBookings", ["serviceId"]);
		await queryInterface.addIndex("ServiceBookings", ["userId"]);
		await queryInterface.addIndex("ServiceBookings", ["vendorId"]);
		await queryInterface.addIndex("ServiceBookings", ["status"]);
		await queryInterface.addIndex("ServiceBookings", ["bookingDate"]);
		await queryInterface.addIndex("ServiceBookings", ["createdAt"]);

		// Add composite indexes for common queries
		await queryInterface.addIndex("ServiceBookings", ["userId", "status"]);
		await queryInterface.addIndex("ServiceBookings", ["vendorId", "status"]);
		await queryInterface.addIndex("ServiceBookings", ["serviceId", "status"]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("ServiceBookings");
	},
};
