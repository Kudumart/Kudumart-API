import { DataTypes, Model, Sequelize } from "sequelize";

class ReferralCode extends Model {
	public id!: string;
	public programId!: string;
	public agentId!: string;
	public code!: string;
	public destinationUrl!: string;
	public campaignCode?: string;
	public channel?:
		| "WHATSAPP"
		| "EMAIL"
		| "PHONE"
		| "FIELD_SALES"
		| "SOCIAL_MEDIA"
		| "EVENT"
		| "WEBSITE"
		| "OTHER";
	public status!: "ACTIVE" | "PAUSED" | "REVOKED" | "EXPIRED";
	public maximumUses?: number;
	public usageCount!: number;
	public expiresAt?: Date;
	public revokedAt?: Date;
	public createdAt!: Date;
	public updatedAt!: Date;

	static associate(models: any) {
		this.belongsTo(models.ReferralProgram, {
			as: "program",
			foreignKey: "programId",
		});
		this.belongsTo(models.SalesAgent, {
			as: "agent",
			foreignKey: "agentId",
		});
		this.hasMany(models.CrmLead, { as: "crmLeads", foreignKey: "referralCodeId" });
		this.hasMany(models.ReferralVisit, { as: "visits", foreignKey: "referralCodeId" });
		this.hasMany(models.Referral, { as: "referrals", foreignKey: "referralCodeId" });
	}
}

const initModel = (sequelize: Sequelize) => {
	ReferralCode.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			programId: { type: DataTypes.UUID, allowNull: false },
			agentId: { type: DataTypes.UUID, allowNull: false },
			code: {
				type: DataTypes.STRING(80),
				allowNull: false,
				unique: true,
				set(value: string) {
					this.setDataValue("code", value.trim().toUpperCase());
				},
			},
			destinationUrl: { type: DataTypes.TEXT, allowNull: false },
			campaignCode: { type: DataTypes.STRING(80), allowNull: true },
			channel: {
				type: DataTypes.ENUM(
					"WHATSAPP",
					"EMAIL",
					"PHONE",
					"FIELD_SALES",
					"SOCIAL_MEDIA",
					"EVENT",
					"WEBSITE",
					"OTHER",
				),
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM("ACTIVE", "PAUSED", "REVOKED", "EXPIRED"),
				allowNull: false,
				defaultValue: "ACTIVE",
			},
			maximumUses: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
			usageCount: {
				type: DataTypes.INTEGER.UNSIGNED,
				allowNull: false,
				defaultValue: 0,
			},
			expiresAt: { type: DataTypes.DATE, allowNull: true },
			revokedAt: { type: DataTypes.DATE, allowNull: true },
		},
		{
			sequelize,
			modelName: "ReferralCode",
			tableName: "referral_codes",
			timestamps: true,
			paranoid: false,
		},
	);
};

export default ReferralCode;
export { initModel };
