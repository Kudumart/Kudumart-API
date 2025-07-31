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
		await queryInterface.addColumn("users", "trackingId", {
			type: Sequelize.STRING,
			allowNull: true,
			unique: true,
			comment: "Unique identifier for tracking vendors",
		});

		// Update existing vendor users
		const [vendors] = await queryInterface.sequelize.query(
			"SELECT id FROM users WHERE accountType = 'Vendor' AND trackingId IS NULL",
		);

		for (const vendor of vendors) {
			const hash = require("crypto")
				.createHash("sha256")
				.update(vendor.id)
				.digest("hex");
			const trackingId = `KDM-VEN-${hash.substring(0, 8).toUpperCase()}`;

			await queryInterface.sequelize.query(
				"UPDATE users SET trackingId = ? WHERE id = ?",
				{ replacements: [trackingId, vendor.id] },
			);
		}
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.removeColumn("users", "trackingId");
	},
};
