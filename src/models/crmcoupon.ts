import { DataTypes, Model, Sequelize } from "sequelize";

class CrmCoupon extends Model {
	public id!: string;
	public code!: string;
	public name!: string;
	public description?: string;
	public discountType!: "percentage" | "fixed";
	public discountValue!: number;
	public currency!: string;
	public minOrderAmount!: number;
	public maxDiscountAmount?: number | null;
	public usageLimit?: number | null;
	public usageCount!: number;
	public perUserLimit!: number;
	public scope!: "all" | "market" | "vendor";
	public marketName?: string | null;
	public vendorId?: string | null;
	public campaignId?: string | null;
	public status!: "draft" | "active" | "paused" | "expired";
	public startsAt!: Date;
	public endsAt!: Date;
	public createdBy!: string;

	static associate(models: any) {
		this.belongsTo(models.Admin, { as: "creator", foreignKey: "createdBy" });
		this.belongsTo(models.CrmCampaign, { as: "campaign", foreignKey: "campaignId" });
		this.belongsTo(models.User, { as: "vendor", foreignKey: "vendorId" });
	}
}

const initModel = (sequelize: Sequelize) => CrmCoupon.init({
	id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
	code: { type: DataTypes.STRING(40), allowNull: false, unique: true },
	name: { type: DataTypes.STRING, allowNull: false },
	description: DataTypes.TEXT,
	discountType: { type: DataTypes.ENUM("percentage", "fixed"), allowNull: false, defaultValue: "percentage" },
	discountValue: { type: DataTypes.DECIMAL(20, 2), allowNull: false },
	currency: { type: DataTypes.STRING(10), allowNull: false, defaultValue: "NGN" },
	minOrderAmount: { type: DataTypes.DECIMAL(20, 2), allowNull: false, defaultValue: 0 },
	maxDiscountAmount: { type: DataTypes.DECIMAL(20, 2), allowNull: true },
	usageLimit: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
	usageCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
	perUserLimit: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 1 },
	scope: { type: DataTypes.ENUM("all", "market", "vendor"), allowNull: false, defaultValue: "all" },
	marketName: { type: DataTypes.STRING, allowNull: true },
	vendorId: { type: DataTypes.UUID, allowNull: true },
	campaignId: { type: DataTypes.UUID, allowNull: true },
	status: { type: DataTypes.ENUM("draft", "active", "paused", "expired"), allowNull: false, defaultValue: "active" },
	startsAt: { type: DataTypes.DATE, allowNull: false },
	endsAt: { type: DataTypes.DATE, allowNull: false },
	createdBy: { type: DataTypes.UUID, allowNull: false },
}, { sequelize, modelName: "CrmCoupon", tableName: "crm_coupons", timestamps: true });

export default CrmCoupon;
export { initModel };
