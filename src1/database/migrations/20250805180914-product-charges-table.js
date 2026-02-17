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
		await queryInterface.createTable("product_charges", {
			id: {
				type: Sequelize.INTEGER,
				allowNull: false,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			description: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			charge_currency: {
				type: Sequelize.ENUM("USD", "NGN"),
				allowNull: false,
				defaultValue: "NGN",
			},
			calculation_type: {
				type: Sequelize.ENUM("fixed", "percentage"),
				allowNull: false,
			},
			charge_amount: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			charge_percentage: {
				type: Sequelize.DECIMAL(5, 2),
				allowNull: true,
			},
			minimum_product_amount: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			maximum_product_amount: {
				type: Sequelize.DECIMAL(10, 2),
				allowNull: true,
			},
			is_active: {
				type: Sequelize.BOOLEAN,
				defaultValue: true,
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

		await queryInterface.addIndex("product_charges", ["name"], {
			unique: true,
			name: "product_charges_name_unique",
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeIndex(
			"product_charges",
			"product_charges_name_unique",
		);
		await queryInterface.dropTable("product_charges");
	},
};
