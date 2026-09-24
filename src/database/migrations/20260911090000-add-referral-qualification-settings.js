"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("referral_programs", "holdingPeriodDays", {
			type: Sequelize.INTEGER.UNSIGNED,
			allowNull: false,
			defaultValue: 14,
			after: "commissionDurationDays",
		});

		await queryInterface.addColumn("referral_programs", "qualificationRules", {
			type: Sequelize.JSON,
			allowNull: true,
			after: "holdingPeriodDays",
		});

		await queryInterface.sequelize.query(
			"UPDATE referral_programs SET qualificationRules = JSON_ARRAY() WHERE qualificationRules IS NULL",
		);
		await queryInterface.changeColumn("referral_programs", "qualificationRules", {
			type: Sequelize.JSON,
			allowNull: false,
		});
	},

	async down(queryInterface) {
		await queryInterface.removeColumn("referral_programs", "qualificationRules");
		await queryInterface.removeColumn("referral_programs", "holdingPeriodDays");
	},
};
