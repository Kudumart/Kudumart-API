import { DataTypes, Model, Sequelize } from "sequelize";

class CrmLead extends Model {
	public id!: string;
	public ownerAgentId!: string;
	public firstName!: string;
	public lastName!: string;
	public email?: string;
	public phoneNumber?: string;
	public entityType!: "CUSTOMER" | "VENDOR";
	public stage!: "NEW" | "CONTACTED" | "QUALIFIED" | "ONBOARDING" | "WON" | "LOST";
	public source?: string;
	public referralCodeId?: string;
	public referredUserId?: string;
	public nextFollowUpAt?: Date;
	public expectedValue?: string;
	public currency?: string;
	public lostReason?: string;

	static associate(models: any) {
		this.belongsTo(models.SalesAgent, { as: "owner", foreignKey: "ownerAgentId" });
		this.belongsTo(models.ReferralCode, { as: "referralCode", foreignKey: "referralCodeId" });
		this.belongsTo(models.User, { as: "referredUser", foreignKey: "referredUserId" });
		this.hasMany(models.CrmActivity, { as: "activities", foreignKey: "leadId" });
	}
}

const initModel = (sequelize: Sequelize) => {
	CrmLead.init({
		id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
		ownerAgentId: { type: DataTypes.UUID, allowNull: false },
		firstName: { type: DataTypes.STRING(100), allowNull: false },
		lastName: { type: DataTypes.STRING(100), allowNull: false },
		email: { type: DataTypes.STRING(191), allowNull: true },
		phoneNumber: { type: DataTypes.STRING(40), allowNull: true },
		entityType: { type: DataTypes.ENUM("CUSTOMER", "VENDOR"), allowNull: false },
		stage: { type: DataTypes.ENUM("NEW", "CONTACTED", "QUALIFIED", "ONBOARDING", "WON", "LOST"), allowNull: false, defaultValue: "NEW" },
		source: { type: DataTypes.STRING(80), allowNull: true },
		referralCodeId: { type: DataTypes.UUID, allowNull: true },
		referredUserId: { type: DataTypes.UUID, allowNull: true },
		nextFollowUpAt: { type: DataTypes.DATE, allowNull: true },
		expectedValue: { type: DataTypes.DECIMAL(20, 2), allowNull: true },
		currency: { type: DataTypes.STRING(3), allowNull: true },
		lostReason: { type: DataTypes.TEXT, allowNull: true },
	}, { sequelize, modelName: "CrmLead", tableName: "crm_leads", timestamps: true });
};
export default CrmLead;
export { initModel };
