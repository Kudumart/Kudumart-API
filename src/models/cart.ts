// models/Cart.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import User from "./user";
import Product from "./product";

class Cart extends Model {
	public id!: string;
	public userId!: string;
	public productId!: string;
	public productType!: "dropship" | "in_stock";
	public dropshipProductSkuId!: string | null;
	public dropshipProductSkuAttr!: string | null;
	public quantity!: number;
	public createdAt?: Date;
	public updatedAt?: Date;

	public product?: Product;
	public user?: User;

	static associate(models: any) {
		// Define associations here
		this.belongsTo(models.User, {
			as: "user",
			foreignKey: "userId",
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
	Cart.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			userId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "users",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			productId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "products", // Ensure this matches your AuctionProduct table name
					key: "id",
				},
				onDelete: "CASCADE",
			},
			productType: {
				type: DataTypes.ENUM("dropship", "in_stock"),
				allowNull: false,
			},
			dropshipProductSkuId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			dropshipProductSkuAttr: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
		},
		{
			sequelize,
			modelName: "Cart",
			timestamps: true,
			paranoid: false,
			tableName: "carts",
		},
	);
};

export default Cart;
export { initModel };
