"use strict";

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.createTable("referral_events", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
			referralId: {
				type: Sequelize.UUID,
				allowNull: false,
				references: { model: "referrals", key: "id" },
				onUpdate: "CASCADE",
				onDelete: "RESTRICT",
			},
			eventType: { type: Sequelize.STRING(80), allowNull: false },
			eventKey: { type: Sequelize.STRING(191), allowNull: false, unique: true },
			occurredAt: { type: Sequelize.DATE, allowNull: false },
			metadata: { type: Sequelize.JSON, allowNull: true },
			createdAt: { type: Sequelize.DATE, allowNull: false },
			updatedAt: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("referral_events", ["referralId", "occurredAt"]);
		await queryInterface.addIndex("referral_events", ["eventType", "occurredAt"]);
	},
	async down(queryInterface) {
		await queryInterface.dropTable("referral_events");
	},
};
