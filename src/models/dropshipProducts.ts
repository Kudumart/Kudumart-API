import { DataTypes, Model, Sequelize } from "sequelize";

class DropshipProducts extends Model {
	public id!: string;
	public dropshipProductId!: string;
	public dropshipPlatform!: string;
	public productId!: string;
	public vendorId!: string;
	public priceIncrementPercent!: number;

	static associate(models: any) {
		// Define associations here
		this.belongsTo(models.Product, {
			as: "product",
			foreignKey: "productId",
			onDelete: "RESTRICT",
		});
		this.belongsTo(models.User, {
			as: "vendor",
			foreignKey: "vendorId",
			onDelete: "RESTRICT",
		});
		this.belongsTo(models.Admin, {
			as: "admin",
			foreignKey: "vendorId",
			onDelete: "RESTRICT",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	DropshipProducts.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			dropshipProductId: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			productId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "products",
					key: "id",
				},
			},
			vendorId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			dropshipPlatform: {
				type: DataTypes.ENUM("aliexpress"),
				allowNull: false,
				defaultValue: "aliexpress",
			},
			priceIncrementPercent: {
				type: DataTypes.FLOAT,
				allowNull: false,
				defaultValue: 0,
			},
		},
		{
			modelName: "DropshipProducts",
			tableName: "dropship_products",
			timestamps: true,
			paranoid: false,
			sequelize,
		},
	);
};

export default DropshipProducts;
export { initModel };
