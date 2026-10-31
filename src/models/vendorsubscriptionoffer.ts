import { Model, DataTypes, Sequelize } from "sequelize";

class VendorSubscriptionOffer extends Model {
	public id!: string;
	public vendorId!: string;
	public subscriptionPlanId!: string;
	public specialPrice!: number;
	public reason!: string;
	public expiresAt!: Date | null;
	public isActive!: boolean;
	public redeemedAt!: Date | null;
	public createdBy!: string | null;
	public createdAt!: Date;
	public updatedAt!: Date;

	static associate(models: any) {
		this.belongsTo(models.User, { as: "vendor", foreignKey: "vendorId", onDelete: "CASCADE" });
		this.belongsTo(models.SubscriptionPlan, { as: "subscriptionPlan", foreignKey: "subscriptionPlanId", onDelete: "CASCADE" });
		this.belongsTo(models.Admin, { as: "creator", foreignKey: "createdBy", onDelete: "SET NULL" });
	}
}

const initModel = (sequelize: Sequelize) => {
	VendorSubscriptionOffer.init(
		{
			id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
			vendorId: { type: DataTypes.UUID, allowNull: false },
			subscriptionPlanId: { type: DataTypes.UUID, allowNull: false },
			specialPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
			reason: { type: DataTypes.STRING(255), allowNull: false },
			expiresAt: { type: DataTypes.DATE, allowNull: true },
			isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
			redeemedAt: { type: DataTypes.DATE, allowNull: true },
			createdBy: { type: DataTypes.UUID, allowNull: true },
		},
		{
			sequelize,
			modelName: "VendorSubscriptionOffer",
			tableName: "vendor_subscription_offers",
			timestamps: true,
			indexes: [
				{ fields: ["vendorId", "subscriptionPlanId", "isActive"] },
				{ fields: ["expiresAt"] },
			],
		},
	);
};

export default VendorSubscriptionOffer;
export { initModel };
