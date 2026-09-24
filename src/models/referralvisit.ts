import { DataTypes, Model, Sequelize } from "sequelize";

class ReferralVisit extends Model {
	public id!: string;
	public referralCodeId!: string;
	public programId!: string;
	public agentId!: string;
	public visitorToken!: string;
	public ipHash?: string;
	public userAgentHash?: string;
	public landingUrl?: string;
	public referrerUrl?: string;
	public campaignCode?: string;
	public channel?: string;
	public expiresAt!: Date;
	public convertedAt?: Date;
	public referredUserId?: string;

	static associate(models: any) {
		this.belongsTo(models.ReferralCode, { as: "referralCode", foreignKey: "referralCodeId" });
		this.belongsTo(models.ReferralProgram, { as: "program", foreignKey: "programId" });
		this.belongsTo(models.SalesAgent, { as: "agent", foreignKey: "agentId" });
		this.belongsTo(models.User, { as: "referredUser", foreignKey: "referredUserId" });
		this.hasOne(models.Referral, { as: "referral", foreignKey: "referralVisitId" });
	}
}

const initModel = (sequelize: Sequelize) => {
	ReferralVisit.init(
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			referralCodeId: { type: DataTypes.UUID, allowNull: false },
			programId: { type: DataTypes.UUID, allowNull: false },
			agentId: { type: DataTypes.UUID, allowNull: false },
			visitorToken: { type: DataTypes.STRING(64), allowNull: false, unique: true },
			ipHash: { type: DataTypes.STRING(64), allowNull: true },
			userAgentHash: { type: DataTypes.STRING(64), allowNull: true },
			landingUrl: { type: DataTypes.TEXT, allowNull: true },
			referrerUrl: { type: DataTypes.TEXT, allowNull: true },
			campaignCode: { type: DataTypes.STRING(80), allowNull: true },
			channel: { type: DataTypes.STRING(40), allowNull: true },
			expiresAt: { type: DataTypes.DATE, allowNull: false },
			convertedAt: { type: DataTypes.DATE, allowNull: true },
			referredUserId: { type: DataTypes.UUID, allowNull: true },
		},
		{ sequelize, modelName: "ReferralVisit", tableName: "referral_visits", timestamps: true },
	);
};

export default ReferralVisit;
export { initModel };
