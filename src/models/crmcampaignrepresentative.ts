import { DataTypes, Model, Sequelize } from "sequelize";

class CrmCampaignRepresentative extends Model {
	static associate(models: any) {
		this.belongsTo(models.CrmCampaign, { as: "campaign", foreignKey: "campaignId" });
		this.belongsTo(models.CrmRepresentative, { as: "representative", foreignKey: "representativeId" });
	}
}

const initModel = (sequelize: Sequelize) => CrmCampaignRepresentative.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	campaignId: { type: DataTypes.UUID, allowNull: false },
	representativeId: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: "CrmCampaignRepresentative", tableName: "crm_campaign_representatives", timestamps: true, indexes: [{ unique: true, fields: ["campaignId", "representativeId"] }] });

export default CrmCampaignRepresentative;
export { initModel };
