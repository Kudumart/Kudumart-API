import { DataTypes, Model, Sequelize } from "sequelize";

class CrmCommissionRule extends Model {
	public id!: string;
	static associate(models: any) {
		this.belongsTo(models.CrmCampaign, { as: "campaign", foreignKey: "campaignId" });
		this.belongsTo(models.Admin, { as: "creator", foreignKey: "createdBy" });
		this.hasMany(models.CrmCommission, { as: "commissions", foreignKey: "ruleId" });
	}
}

const initModel = (sequelize: Sequelize) => CrmCommissionRule.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	campaignId: DataTypes.UUID,
	name: { type: DataTypes.STRING, allowNull: false },
	amount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
	currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "NGN" },
	qualificationType: { type: DataTypes.ENUM("vendor_verified", "first_completed_order"), allowNull: false, defaultValue: "first_completed_order" },
	validationDays: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 14 },
	status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
	createdBy: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: "CrmCommissionRule", tableName: "crm_commission_rules", timestamps: true });

export default CrmCommissionRule;
export { initModel };
