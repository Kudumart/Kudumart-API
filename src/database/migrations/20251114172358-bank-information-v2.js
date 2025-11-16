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

		await queryInterface.addColumn("bank_informations", "bankName", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("bank_informations", "accountNumber", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("bank_informations", "accountHolderName", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("bank_informations", "swiftCode", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("bank_informations", "routingNumber", {
			type: Sequelize.STRING,
			allowNull: true,
		});

		await queryInterface.addColumn("bank_informations", "bankAddress", {
			type: Sequelize.STRING,
			allowNull: true,
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */

		await queryInterface.removeColumn("bank_informations", "bankName");
		await queryInterface.removeColumn("bank_informations", "accountNumber");
		await queryInterface.removeColumn("bank_informations", "accountHolderName");
		await queryInterface.removeColumn("bank_informations", "swiftCode");
		await queryInterface.removeColumn("bank_informations", "routingNumber");
		await queryInterface.removeColumn("bank_informations", "bankAddress");
	},
};
