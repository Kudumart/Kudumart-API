import { DataTypes, Model, Sequelize } from "sequelize";

class CommissionEarning extends Model {
	public id!: string;
	public referralId!: string;
	public programId!: string;
	public agentId!: string;
	public ruleId!: string;
	public payoutBatchId?: string;
	public sourceType!: "ORDER" | "ORDER_ITEM";
	public sourceId!: string;
	public baseAmount!: string;
	public amount!: string;
	public currency!: string;
	public status!: "PENDING" | "AVAILABLE" | "PAID" | "REVERSED" | "CANCELLED";
	public earnedAt!: Date;
	public heldUntil!: Date;
	public availableAt?: Date;
	public paidAt?: Date;
	public reversedAt?: Date;
	public calculationSnapshot!: Record<string, unknown>;

	static associate(models: any) {
		this.belongsTo(models.Referral, { as: "referral", foreignKey: "referralId" });
		this.belongsTo(models.ReferralProgram, { as: "program", foreignKey: "programId" });
		this.belongsTo(models.SalesAgent, { as: "agent", foreignKey: "agentId" });
		this.belongsTo(models.CommissionPayout, { as: "payoutBatch", foreignKey: "payoutBatchId" });
	}
}

const initModel = (sequelize: Sequelize) => {
	CommissionEarning.init(
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			referralId: { type: DataTypes.UUID, allowNull: false },
			programId: { type: DataTypes.UUID, allowNull: false },
			agentId: { type: DataTypes.UUID, allowNull: false },
			ruleId: { type: DataTypes.STRING(60), allowNull: false },
			payoutBatchId: { type: DataTypes.UUID, allowNull: true },
			sourceType: { type: DataTypes.ENUM("ORDER", "ORDER_ITEM"), allowNull: false },
			sourceId: { type: DataTypes.UUID, allowNull: false },
			baseAmount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
			amount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
			currency: { type: DataTypes.STRING(3), allowNull: false },
			status: { type: DataTypes.ENUM("PENDING", "AVAILABLE", "PAID", "REVERSED", "CANCELLED"), allowNull: false, defaultValue: "PENDING" },
			earnedAt: { type: DataTypes.DATE, allowNull: false },
			heldUntil: { type: DataTypes.DATE, allowNull: false },
			availableAt: { type: DataTypes.DATE, allowNull: true },
			paidAt: { type: DataTypes.DATE, allowNull: true },
			reversedAt: { type: DataTypes.DATE, allowNull: true },
			calculationSnapshot: { type: DataTypes.JSON, allowNull: false },
		},
		{ sequelize, modelName: "CommissionEarning", tableName: "commission_earnings", timestamps: true },
	);
};

export default CommissionEarning;
export { initModel };
