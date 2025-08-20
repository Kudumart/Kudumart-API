import { DataTypes, Model, Sequelize } from "sequelize";

class ServiceCategories extends Model {
	public id!: number;
	public name!: string;
	public image!: string;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	static associate(models: any) {
		this.hasMany(models.ServiceSubCategories, {
			foreignKey: "serviceCategoryId",
			as: "serviceSubCategories",
			onDelete: "CASCADE", // Prevent deletion if subcategories exist
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	ServiceCategories.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			image: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "ServiceCategories",
			timestamps: true,
			paranoid: false,
			tableName: "service_categories",
		},
	);
};

export default ServiceCategories;
export { initModel };
