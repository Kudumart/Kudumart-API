import { DataTypes, Model, Sequelize } from "sequelize";

class CrmActivity extends Model {
	public id!: string;
	public leadId!: string;
	public createdByAdminId?: string;
	public type!: "NOTE" | "CALL" | "EMAIL" | "MEETING" | "TASK" | "STAGE_CHANGE";
	public subject!: string;
	public details?: string;
	public dueAt?: Date;
	public completedAt?: Date;

	static associate(models: any) {
		this.belongsTo(models.CrmLead, { as: "lead", foreignKey: "leadId" });
		this.belongsTo(models.Admin, { as: "creator", foreignKey: "createdByAdminId" });
	}
}
const initModel = (sequelize: Sequelize) => {
	CrmActivity.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
		leadId: { type: DataTypes.UUID, allowNull: false },
		createdByAdminId: { type: DataTypes.UUID, allowNull: true },
		type: { type: DataTypes.ENUM("NOTE", "CALL", "EMAIL", "MEETING", "TASK", "STAGE_CHANGE"), allowNull: false },
		subject: { type: DataTypes.STRING(191), allowNull: false },
		details: { type: DataTypes.TEXT, allowNull: true },
		dueAt: { type: DataTypes.DATE, allowNull: true },
		completedAt: { type: DataTypes.DATE, allowNull: true },
	}, { sequelize, modelName: "CrmActivity", tableName: "crm_activities", timestamps: true });
};
export default CrmActivity;
export { initModel };
