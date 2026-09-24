import { DataTypes, Model, Sequelize } from "sequelize";

class SalesAgent extends Model {
	public id!: string;
	public userId?: string;
	public managerId?: string;
	public employeeReference?: string;
	public agentCode!: string;
	public firstName!: string;
	public lastName!: string;
	public email!: string;
	public phoneNumber?: string;
	public agentType!:
		| "INTERNAL_SALES"
		| "CONTRACTOR"
		| "AFFILIATE"
		| "INFLUENCER"
		| "PARTNER";
	public status!: "INVITED" | "ACTIVE" | "SUSPENDED" | "TERMINATED";
	public crmUserId?: string;
	public linkedAt?: Date;
	public linkedByAdminId?: string;
	public joinedAt?: Date;
	public suspendedAt?: Date;
	public terminatedAt?: Date;
	public createdAt!: Date;
	public updatedAt!: Date;

	static associate(models: any) {
		this.belongsTo(models.User, { as: "user", foreignKey: "userId" });
		this.belongsTo(models.SalesAgent, {
			as: "manager",
			foreignKey: "managerId",
		});
		this.hasMany(models.SalesAgent, {
			as: "directReports",
			foreignKey: "managerId",
		});
		this.hasMany(models.ReferralCode, {
			as: "referralCodes",
			foreignKey: "agentId",
		});
		this.hasMany(models.ReferralVisit, { as: "referralVisits", foreignKey: "agentId" });
		this.hasMany(models.Referral, { as: "referrals", foreignKey: "agentId" });
		this.hasMany(models.CommissionEarning, { as: "commissionEarnings", foreignKey: "agentId" });
		this.hasMany(models.CommissionPayout, { as: "commissionPayouts", foreignKey: "agentId" });
		this.hasMany(models.CrmLead, { as: "crmLeads", foreignKey: "ownerAgentId" });
		this.belongsTo(models.Admin, { as: "linkedBy", foreignKey: "linkedByAdminId" });
		this.hasMany(models.SalesAgentLinkEvent, { as: "linkEvents", foreignKey: "agentId" });
	}
}

const initModel = (sequelize: Sequelize) => {
	SalesAgent.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
			},
			userId: { type: DataTypes.UUID, allowNull: true, unique: true },
			managerId: { type: DataTypes.UUID, allowNull: true },
			employeeReference: {
				type: DataTypes.STRING(80),
				allowNull: true,
				unique: true,
			},
			agentCode: {
				type: DataTypes.STRING(40),
				allowNull: false,
				unique: true,
				set(value: string) {
					this.setDataValue("agentCode", value.trim().toUpperCase());
				},
			},
			firstName: { type: DataTypes.STRING(100), allowNull: false },
			lastName: { type: DataTypes.STRING(100), allowNull: false },
			email: {
				type: DataTypes.STRING(191),
				allowNull: false,
				unique: true,
				set(value: string) {
					this.setDataValue("email", value.trim().toLowerCase());
				},
			},
			phoneNumber: { type: DataTypes.STRING(40), allowNull: true },
			agentType: {
				type: DataTypes.ENUM(
					"INTERNAL_SALES",
					"CONTRACTOR",
					"AFFILIATE",
					"INFLUENCER",
					"PARTNER",
				),
				allowNull: false,
				defaultValue: "INTERNAL_SALES",
			},
			status: {
				type: DataTypes.ENUM(
					"INVITED",
					"ACTIVE",
					"SUSPENDED",
					"TERMINATED",
				),
				allowNull: false,
				defaultValue: "INVITED",
			},
			crmUserId: { type: DataTypes.STRING(191), allowNull: true },
			linkedAt: { type: DataTypes.DATE, allowNull: true },
			linkedByAdminId: { type: DataTypes.UUID, allowNull: true },
			joinedAt: { type: DataTypes.DATE, allowNull: true },
			suspendedAt: { type: DataTypes.DATE, allowNull: true },
			terminatedAt: { type: DataTypes.DATE, allowNull: true },
		},
		{
			sequelize,
			modelName: "SalesAgent",
			tableName: "sales_agents",
			timestamps: true,
			paranoid: false,
		},
	);
};

export default SalesAgent;
export { initModel };
