// models/product.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import User from "./user";
import Store from "./store";
import SubCategory from "./subcategory";
import ReviewProduct from "./reviewproduct";
import DropshipProducts from "./dropshipProducts";

interface SkuProperty {
	sku_image: string;
	sku_property_id: number;
	property_value_id: number;
	sku_property_name: string;
	sku_property_value: string;
	property_value_definition_name?: string; // optional because not all objects have it
}

interface ProductSku {
	id: string;
	sku_id: string;
	sku_attr: string;
	sku_price: string; // prices are strings from API
	currency_code: string;
	offer_sale_price: string;
	price_include_tax: boolean;
	sku_available_stock: number;
	aeop_s_k_u_propertys: SkuProperty[];
	offer_bulk_sale_price: string;
}

class Product extends Model {
	public id!: string;
	public vendorId!: string;
	public storeId!: string;
	public categoryId!: string;
	public name!: string;
	public sku!: string;
	public condition!:
		| "brand_new"
		| "fairly_used"
		| "fairly_foreign"
		| "refurbished";
	public description!: string | null;
	public specification!: string | null;
	public quantity?: number | 0;
	public price!: number;
	public discount_price!: number | null;
	public type!: "dropship" | "in_stock";
	public image_url!: string | null;
	public video_url!: string | null;
	public additional_images!: object | null; // JSON array or object for additional images
	public warranty!: string | null;
	public return_policy!: string | null;
	public seo_title!: string | null;
	public meta_description!: string | null;
	public keywords!: string | null;
	public views!: number | null;
	public status!: "active" | "inactive" | "draft";
	public vendor?: User; // Declare the relationship to User (vendor)
	public variants!: ProductSku[] | null; // JSON array or object for product variants
	public createdAt!: Date;
	public updatedAt!: Date;

	public store!: Store;
	public sub_category!: SubCategory;
	public reviews!: ReviewProduct;
	public dropshipDetails!: DropshipProducts;

	static associate(models: any) {
		// Define associations here
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
		this.belongsTo(models.Store, {
			as: "store",
			foreignKey: "storeId",
			onDelete: "RESTRICT",
		});
		this.belongsTo(models.SubCategory, {
			as: "sub_category",
			foreignKey: "categoryId",
			onDelete: "RESTRICT",
		});
		this.hasMany(models.SaveProduct, {
			as: "savedProducts",
			foreignKey: "productId",
			onDelete: "RESTRICT",
		});
		this.hasMany(models.ReviewProduct, {
			as: "reviews",
			foreignKey: "productId",
			onDelete: "RESTRICT",
		});
		this.hasMany(models.Cart, {
			as: "carts",
			foreignKey: "productId",
			onDelete: "RESTRICT",
		});
		this.hasOne(models.DropshipProducts, {
			as: "dropshipDetails",
			foreignKey: "productId",
			sourceKey: "id",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	Product.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			vendorId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			storeId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "stores",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			categoryId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "sub_categories",
					key: "id",
				},
				onDelete: "RESTRICT",
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			sku: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
			condition: {
				type: DataTypes.ENUM(
					"brand_new",
					"fairly_used",
					"fairly_foreign",
					"refurbished",
				),
				allowNull: false,
			},
			type: {
				type: DataTypes.ENUM("dropship", "in_stock"),
				allowNull: false,
				defaultValue: "in_stock",
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			specification: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			price: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: false,
			},
			discount_price: {
				type: DataTypes.DECIMAL(20, 2),
				allowNull: true,
			},
			image_url: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			video_url: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			additional_images: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: [], // Ensures it's an array by default
				get() {
					const value = this.getDataValue("additional_images");
					return typeof value === "string" ? JSON.parse(value) : value;
				},
			},
			warranty: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			return_policy: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			seo_title: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			meta_description: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			keywords: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			views: {
				type: DataTypes.INTEGER,
				allowNull: true,
				defaultValue: 0,
			},
			status: {
				type: DataTypes.ENUM("active", "inactive", "draft"),
				defaultValue: "active",
				allowNull: false,
			},
			variants: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: [],
				get() {
					const value = this.getDataValue("variants");
					return typeof value === "string" ? JSON.parse(value) : value;
				},
			},
			last_synced_at: {
				type: DataTypes.DATE,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "Product",
			timestamps: true,
			paranoid: false,
			tableName: "products",
		},
	);
};

export default Product;
export { initModel };
