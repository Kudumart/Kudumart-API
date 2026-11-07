import { DataTypes, Model, Sequelize } from "sequelize";

class CrmVendorReferral extends Model {
	public id!: string;
	static associate(models: any) {
		this.belongsTo(models.CrmCampaign, { as: "campaign", foreignKey: "campaignId" });
		this.belongsTo(models.CrmRepresentative, { as: "representative", foreignKey: "representativeId" });
		this.belongsTo(models.User, { as: "vendor", foreignKey: "vendorId" });
		this.belongsTo(models.Order, { as: "firstOrder", foreignKey: "firstOrderId" });
		this.hasOne(models.CrmCommission, { as: "commission", foreignKey: "referralId" });
	}
}

const initModel = (sequelize: Sequelize) => CrmVendorReferral.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	campaignId: { type: DataTypes.UUID, allowNull: false },
	representativeId: { type: DataTypes.UUID, allowNull: false },
	vendorId: { type: DataTypes.UUID, allowNull: false, unique: true },
	referralCode: { type: DataTypes.STRING(30), allowNull: false },
	status: { type: DataTypes.ENUM("referred", "verified", "qualified", "rejected"), allowNull: false, defaultValue: "referred" },
	referredAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
	verifiedAt: DataTypes.DATE,
	qualifiedAt: DataTypes.DATE,
	firstOrderId: DataTypes.UUID,
	notes: DataTypes.TEXT,
}, { sequelize, modelName: "CrmVendorReferral", tableName: "crm_vendor_referrals", timestamps: true });

export default CrmVendorReferral;
export { initModel };
