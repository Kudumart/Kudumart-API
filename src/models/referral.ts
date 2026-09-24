import { DataTypes, Model, Sequelize } from "sequelize";

class Referral extends Model {
	public id!: string;
	public programId!: string;
	public agentId!: string;
	public referralCodeId!: string;
	public referralVisitId?: string;
	public referredUserId!: string;
	public referredEntityType!: "CUSTOMER" | "VENDOR";
	public attributionMethod!: "REFERRAL_CODE" | "FIRST_TOUCH" | "LAST_TOUCH" | "MANUAL_ASSIGNMENT" | "CRM_OWNER";
	public status!: "REGISTERED" | "VERIFIED" | "QUALIFIED" | "CONVERTED" | "INACTIVE" | "REJECTED" | "DISQUALIFIED";
	public attributedAt!: Date;
	public attributionExpiresAt?: Date;
	public qualifiedAt?: Date;
	public convertedAt?: Date;

	static associate(models: any) {
		this.belongsTo(models.ReferralProgram, { as: "program", foreignKey: "programId" });
		this.belongsTo(models.SalesAgent, { as: "agent", foreignKey: "agentId" });
		this.belongsTo(models.ReferralCode, { as: "referralCode", foreignKey: "referralCodeId" });
		this.belongsTo(models.ReferralVisit, { as: "visit", foreignKey: "referralVisitId" });
		this.belongsTo(models.User, { as: "referredUser", foreignKey: "referredUserId" });
		this.hasMany(models.ReferralEvent, { as: "events", foreignKey: "referralId" });
		this.hasMany(models.CommissionEarning, { as: "commissionEarnings", foreignKey: "referralId" });
	}
}

const initModel = (sequelize: Sequelize) => {
	Referral.init(
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			programId: { type: DataTypes.UUID, allowNull: false },
			agentId: { type: DataTypes.UUID, allowNull: false },
			referralCodeId: { type: DataTypes.UUID, allowNull: false },
			referralVisitId: { type: DataTypes.UUID, allowNull: true, unique: true },
			referredUserId: { type: DataTypes.UUID, allowNull: false },
			referredEntityType: { type: DataTypes.ENUM("CUSTOMER", "VENDOR"), allowNull: false },
			attributionMethod: {
				type: DataTypes.ENUM("REFERRAL_CODE", "FIRST_TOUCH", "LAST_TOUCH", "MANUAL_ASSIGNMENT", "CRM_OWNER"),
				allowNull: false,
				defaultValue: "REFERRAL_CODE",
			},
			status: {
				type: DataTypes.ENUM("REGISTERED", "VERIFIED", "QUALIFIED", "CONVERTED", "INACTIVE", "REJECTED", "DISQUALIFIED"),
				allowNull: false,
				defaultValue: "REGISTERED",
			},
			attributedAt: { type: DataTypes.DATE, allowNull: false },
			attributionExpiresAt: { type: DataTypes.DATE, allowNull: true },
			qualifiedAt: { type: DataTypes.DATE, allowNull: true },
			convertedAt: { type: DataTypes.DATE, allowNull: true },
		},
		{ sequelize, modelName: "Referral", tableName: "referrals", timestamps: true },
	);
};

export default Referral;
export { initModel };
