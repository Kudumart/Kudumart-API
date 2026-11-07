import { DataTypes, Model, Sequelize } from "sequelize";

class CrmCommission extends Model {
	static associate(models: any) {
		this.belongsTo(models.CrmVendorReferral, { as: "referral", foreignKey: "referralId" });
		this.belongsTo(models.CrmCommissionRule, { as: "rule", foreignKey: "ruleId" });
		this.belongsTo(models.CrmRepresentative, { as: "representative", foreignKey: "representativeId" });
		this.belongsTo(models.Admin, { as: "approver", foreignKey: "approvedBy" });
	}
}

const initModel = (sequelize: Sequelize) => CrmCommission.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	referralId: { type: DataTypes.UUID, allowNull: false, unique: true },
	ruleId: { type: DataTypes.UUID, allowNull: false },
	representativeId: { type: DataTypes.UUID, allowNull: false },
	amount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
	currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "NGN" },
	status: { type: DataTypes.ENUM("pending", "qualified", "approved", "paid", "rejected"), allowNull: false, defaultValue: "pending" },
	qualifiedAt: DataTypes.DATE,
	approvedAt: DataTypes.DATE,
	approvedBy: DataTypes.UUID,
	paidAt: DataTypes.DATE,
	notes: DataTypes.TEXT,
}, { sequelize, modelName: "CrmCommission", tableName: "crm_commissions", timestamps: true });

export default CrmCommission;
export { initModel };
