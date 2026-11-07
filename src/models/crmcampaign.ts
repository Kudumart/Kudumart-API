import { DataTypes, Model, Sequelize } from "sequelize";

class CrmCampaign extends Model {
	public id!: string;
	public name!: string;
	public code!: string;
	public description?: string;
	public channel!: "field_reps" | "referral" | "event" | "digital" | "other";
	public status!: "draft" | "active" | "paused" | "completed";
	public targetVendors!: number;
	public budget!: number;
	public startsAt!: Date;
	public endsAt!: Date;
	public createdBy!: string;

	static associate(models: any) {
		this.belongsTo(models.Admin, { as: "creator", foreignKey: "createdBy" });
		this.belongsToMany(models.CrmRepresentative, { through: models.CrmCampaignRepresentative, as: "representatives", foreignKey: "campaignId" });
		this.hasMany(models.CrmVendorReferral, { as: "referrals", foreignKey: "campaignId" });
		this.hasMany(models.CrmCommissionRule, { as: "commissionRules", foreignKey: "campaignId" });
	}
}

const initModel = (sequelize: Sequelize) => CrmCampaign.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	name: { type: DataTypes.STRING, allowNull: false },
	code: { type: DataTypes.STRING(30), allowNull: false, unique: true },
	description: DataTypes.TEXT,
	channel: { type: DataTypes.ENUM("field_reps", "referral", "event", "digital", "other"), allowNull: false, defaultValue: "field_reps" },
	status: { type: DataTypes.ENUM("draft", "active", "paused", "completed"), allowNull: false, defaultValue: "draft" },
	targetVendors: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
	budget: { type: DataTypes.DECIMAL(20, 2), allowNull: false, defaultValue: 0 },
	startsAt: { type: DataTypes.DATE, allowNull: false },
	endsAt: { type: DataTypes.DATE, allowNull: false },
	createdBy: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: "CrmCampaign", tableName: "crm_campaigns", timestamps: true });

export default CrmCampaign;
export { initModel };
