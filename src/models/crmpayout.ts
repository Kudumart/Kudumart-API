import { DataTypes, Model, Sequelize } from "sequelize";

class CrmPayout extends Model {
	static associate(models: any) {
		this.belongsTo(models.CrmRepresentative, { as: "representative", foreignKey: "representativeId" });
		this.belongsTo(models.Admin, { as: "approver", foreignKey: "approvedBy" });
	}
}

const initModel = (sequelize: Sequelize) => CrmPayout.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	representativeId: { type: DataTypes.UUID, allowNull: false },
	amount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
	commissionIds: { type: DataTypes.JSON, allowNull: false },
	currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "NGN" },
	status: { type: DataTypes.ENUM("pending", "approved", "paid", "rejected"), allowNull: false, defaultValue: "pending" },
	reference: { type: DataTypes.STRING, unique: true },
	approvedBy: DataTypes.UUID,
	approvedAt: DataTypes.DATE,
	paidAt: DataTypes.DATE,
	notes: DataTypes.TEXT,
}, { sequelize, modelName: "CrmPayout", tableName: "crm_payouts", timestamps: true });

export default CrmPayout;
export { initModel };
