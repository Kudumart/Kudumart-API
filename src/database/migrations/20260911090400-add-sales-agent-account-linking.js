"use strict";
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn("sales_agents", "linkedAt", { type: Sequelize.DATE, allowNull: true });
		await queryInterface.addColumn("sales_agents", "linkedByAdminId", { type: Sequelize.UUID, allowNull: true, references: { model: "admins", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" });
		await queryInterface.createTable("sales_agent_link_events", {
			id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, allowNull: false, primaryKey: true },
			agentId: { type: Sequelize.UUID, allowNull: false, references: { model: "sales_agents", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
			userId: { type: Sequelize.UUID, allowNull: false, references: { model: "users", key: "id" }, onUpdate: "CASCADE", onDelete: "RESTRICT" },
			adminId: { type: Sequelize.UUID, allowNull: true, references: { model: "admins", key: "id" }, onUpdate: "CASCADE", onDelete: "SET NULL" },
			action: { type: Sequelize.ENUM("LINKED", "UNLINKED"), allowNull: false }, reason: { type: Sequelize.TEXT, allowNull: true }, occurredAt: { type: Sequelize.DATE, allowNull: false },
			createdAt: { type: Sequelize.DATE, allowNull: false }, updatedAt: { type: Sequelize.DATE, allowNull: false },
		});
		await queryInterface.addIndex("sales_agent_link_events", ["agentId", "occurredAt"]);
	},
	async down(queryInterface) { await queryInterface.dropTable("sales_agent_link_events"); await queryInterface.removeColumn("sales_agents", "linkedByAdminId"); await queryInterface.removeColumn("sales_agents", "linkedAt"); },
};
