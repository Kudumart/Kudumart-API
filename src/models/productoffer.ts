// models/productoffer.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import User from "./user";
import Product from "./product";

class ProductOffer extends Model {
	public id!: string;
	public productId!: string;
	public buyerId!: string;
	public offeredPrice!: number;
	public message!: string | null;
	public status!: "pending" | "accepted" | "rejected" | "countered" | "completed";
	public counterPrice!: number | null;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	public buyer?: User;
	public product?: Product;

	static associate(models: any) {
		this.belongsTo(models.User, {
			as: "buyer",
			foreignKey: "buyerId",
			onDelete: "RESTRICT",
		});
		this.belongsTo(models.Product, {
			as: "product",
			foreignKey: "productId",
			onDelete: "CASCADE",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	ProductOffer.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			productId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "products",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			buyerId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			offeredPrice: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: false,
			},
			message: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM("pending", "accepted", "rejected", "countered", "completed"),
				allowNull: false,
				defaultValue: "pending",
			},
			counterPrice: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "ProductOffer",
			timestamps: true,
			paranoid: false,
			tableName: "product_offers",
		},
	);
};

export default ProductOffer;
export { initModel };
