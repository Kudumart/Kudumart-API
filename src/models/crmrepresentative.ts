import { DataTypes, Model, Sequelize } from "sequelize";

class CrmRepresentative extends Model {
	public id!: string;
	public firstName!: string;
	public lastName!: string;
	public email!: string;
	public phoneNumber?: string;
	public region?: string;
	public referralCode!: string;
	public status!: "active" | "paused" | "inactive";
	public bankInformation?: object;
	public createdBy!: string;

	static associate(models: any) {
		this.belongsTo(models.Admin, { as: "creator", foreignKey: "createdBy" });
		this.belongsToMany(models.CrmCampaign, { through: models.CrmCampaignRepresentative, as: "campaigns", foreignKey: "representativeId" });
		this.hasMany(models.CrmVendorReferral, { as: "referrals", foreignKey: "representativeId" });
		this.hasMany(models.CrmCommission, { as: "commissions", foreignKey: "representativeId" });
		this.hasMany(models.CrmPayout, { as: "payouts", foreignKey: "representativeId" });
	}
}

const initModel = (sequelize: Sequelize) => CrmRepresentative.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	firstName: { type: DataTypes.STRING, allowNull: false },
	lastName: { type: DataTypes.STRING, allowNull: false },
	email: { type: DataTypes.STRING, allowNull: false, unique: true },
	phoneNumber: DataTypes.STRING,
	region: DataTypes.STRING,
	referralCode: { type: DataTypes.STRING(30), allowNull: false, unique: true },
	status: { type: DataTypes.ENUM("active", "paused", "inactive"), allowNull: false, defaultValue: "active" },
	bankInformation: DataTypes.JSON,
	createdBy: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: "CrmRepresentative", tableName: "crm_representatives", timestamps: true });

export default CrmRepresentative;
export { initModel };
