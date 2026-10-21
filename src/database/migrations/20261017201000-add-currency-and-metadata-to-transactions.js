"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		const table = await queryInterface.describeTable("transactions");

		if (!table.currency) {
			await queryInterface.addColumn("transactions", "currency", {
				type: Sequelize.STRING,
				allowNull: false,
				defaultValue: "NGN",
			});
		}

		if (!table.metadata) {
			await queryInterface.addColumn("transactions", "metadata", {
				type: Sequelize.JSON,
				allowNull: true,
			});
		}
	},

	async down(queryInterface) {
		const table = await queryInterface.describeTable("transactions");

		if (table.metadata) {
			await queryInterface.removeColumn("transactions", "metadata");
		}

		if (table.currency) {
			await queryInterface.removeColumn("transactions", "currency");
		}
	},
};
