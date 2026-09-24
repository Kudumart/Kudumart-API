import { DataTypes, Model, Sequelize } from "sequelize";

class CommissionPayout extends Model {
	public id!: string;
	public agentId!: string;
	public currency!: string;
	public totalAmount!: string;
	public earningCount!: number;
	public status!: "DRAFT" | "APPROVED" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED";
	public approvedBy?: string;
	public approvedAt?: Date;
	public paidAt?: Date;
	public paymentReference?: string;
	public failureReason?: string;

	static associate(models: any) {
		this.belongsTo(models.SalesAgent, { as: "agent", foreignKey: "agentId" });
		this.belongsTo(models.Admin, { as: "approver", foreignKey: "approvedBy" });
		this.hasMany(models.CommissionEarning, { as: "earnings", foreignKey: "payoutBatchId" });
	}
}

const initModel = (sequelize: Sequelize) => {
	CommissionPayout.init(
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			agentId: { type: DataTypes.UUID, allowNull: false },
			currency: { type: DataTypes.STRING(3), allowNull: false },
			totalAmount: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
			earningCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
			status: { type: DataTypes.ENUM("DRAFT", "APPROVED", "PROCESSING", "PAID", "FAILED", "CANCELLED"), allowNull: false, defaultValue: "DRAFT" },
			approvedBy: { type: DataTypes.UUID, allowNull: true },
			approvedAt: { type: DataTypes.DATE, allowNull: true },
			paidAt: { type: DataTypes.DATE, allowNull: true },
			paymentReference: { type: DataTypes.STRING(191), allowNull: true, unique: true },
			failureReason: { type: DataTypes.TEXT, allowNull: true },
		},
		{ sequelize, modelName: "CommissionPayout", tableName: "commission_payouts", timestamps: true },
	);
};

export default CommissionPayout;
export { initModel };
