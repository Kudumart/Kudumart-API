import { DataTypes, Model, Sequelize } from "sequelize";
class SalesAgentLinkEvent extends Model {
	static associate(models: any) {
		this.belongsTo(models.SalesAgent, { as: "agent", foreignKey: "agentId" });
		this.belongsTo(models.User, { as: "user", foreignKey: "userId" });
		this.belongsTo(models.Admin, { as: "admin", foreignKey: "adminId" });
	}
}
const initModel = (sequelize: Sequelize) => SalesAgentLinkEvent.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	agentId: { type: DataTypes.UUID, allowNull: false }, userId: { type: DataTypes.UUID, allowNull: false }, adminId: { type: DataTypes.UUID, allowNull: true },
	action: { type: DataTypes.ENUM("LINKED", "UNLINKED"), allowNull: false }, reason: { type: DataTypes.TEXT, allowNull: true }, occurredAt: { type: DataTypes.DATE, allowNull: false },
}, { sequelize, modelName: "SalesAgentLinkEvent", tableName: "sales_agent_link_events", timestamps: true });
export default SalesAgentLinkEvent;
export { initModel };
