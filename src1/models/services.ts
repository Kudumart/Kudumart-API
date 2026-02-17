import { DataTypes, Model, Sequelize } from "sequelize";

export class Services extends Model {
	public id!: string;
	public title!: string;
	public description!: string;
	public image_url!: string;
	public video_url!: string;
	public vendorId!: string;
	public service_category_id!: number;
	public service_subcategory_id!: number;
	public location_city!: string;
	public location_state!: string;
	public location_country!: string;
	public is_negotiable!: boolean;
	public work_experience_years!: number;
	public additional_images!: string[];
	public status!: "active" | "inactive" | "suspended";
	public price!: number;
	public discount_price!: number | null;
	public attributes?: Array<object>;
	public provider?: any;
	public createdAt!: Date;
	public updatedAt!: Date;

	public static associate(models: any) {
		this.belongsTo(models.User, {
			foreignKey: "vendorId",
			targetKey: "id",
			as: "provider",
		});
		this.belongsTo(models.ServiceCategories, {
			foreignKey: "service_category_id",
			as: "category",
		});
		this.belongsTo(models.ServiceSubCategories, {
			foreignKey: "service_subcategory_id",
			as: "subCategory",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	Services.init(
		{
			id: {
				type: DataTypes.UUIDV4,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			image_url: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			video_url: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			vendorId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "User",
					key: "id",
				},
			},
			service_category_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			service_subcategory_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			location_city: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			location_state: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			location_country: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			work_experience_years: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			is_negotiable: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
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
			price: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			discount_price: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM("active", "inactive", "suspended"),
				defaultValue: "active",
				allowNull: false,
			},
			attributes: {
				type: DataTypes.JSON,
				allowNull: true,
				defaultValue: [],
				get() {
					const value = this.getDataValue("attributes");
					return typeof value === "string" ? JSON.parse(value) : value;
				},
			},
		},
		{
			tableName: "services",
			timestamps: true,
			paranoid: false,
			sequelize,
		},
	);
};

export default Services;
export { initModel };
