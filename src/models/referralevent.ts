import { DataTypes, Model, Sequelize } from "sequelize";

class ReferralEvent extends Model {
	public id!: string;
	public referralId!: string;
	public eventType!: string;
	public eventKey!: string;
	public occurredAt!: Date;
	public metadata?: Record<string, unknown>;

	static associate(models: any) {
		this.belongsTo(models.Referral, { as: "referral", foreignKey: "referralId" });
	}
}

const initModel = (sequelize: Sequelize) => {
	ReferralEvent.init(
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			referralId: { type: DataTypes.UUID, allowNull: false },
			eventType: { type: DataTypes.STRING(80), allowNull: false },
			eventKey: { type: DataTypes.STRING(191), allowNull: false, unique: true },
			occurredAt: { type: DataTypes.DATE, allowNull: false },
			metadata: { type: DataTypes.JSON, allowNull: true },
		},
		{ sequelize, modelName: "ReferralEvent", tableName: "referral_events", timestamps: true },
	);
};

export default ReferralEvent;
export { initModel };
