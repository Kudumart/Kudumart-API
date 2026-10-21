"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const table = await queryInterface.describeTable("bank_informations");
		if (!table.bankCode) {
			await queryInterface.addColumn("bank_informations", "bankCode", {
				type: Sequelize.STRING,
				allowNull: true,
			});
		}
	},

	async down(queryInterface) {
		const table = await queryInterface.describeTable("bank_informations");
		if (table.bankCode) await queryInterface.removeColumn("bank_informations", "bankCode");
	},
};
