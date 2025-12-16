"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("ServiceReviews", {
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
			rating: {
				type: Sequelize.INTEGER,
				allowNull: false,
				validate: {
					min: 1,
					max: 5,
				},
			},
			comment: {
				type: Sequelize.TEXT,
				allowNull: false,
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
		await queryInterface.addIndex("ServiceReviews", ["serviceId"]);
		await queryInterface.addIndex("ServiceReviews", ["userId"]);
		await queryInterface.addIndex("ServiceReviews", ["rating"]);
		await queryInterface.addIndex("ServiceReviews", ["createdAt"]);
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.dropTable("ServiceReviews");
	},
};
