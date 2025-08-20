import { DataTypes, Model, Sequelize } from "sequelize";

export class ServiceSubCategories extends Model {
	public id!: string;
	public serviceCategoryId!: number;
	public image!: string;
	public name!: string;
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;

	static associate(models: any) {
		this.belongsTo(models.ServiceCategories, {
			foreignKey: "serviceCategoryId",
			as: "serviceCategory",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	ServiceSubCategories.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			serviceCategoryId: {
				type: DataTypes.INTEGER,
				references: {
					model: "ServiceCategories",
					key: "id",
				},
				onDelete: "CASCADE",
			},
			image: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
		},
		{
			sequelize,
			modelName: "ServiceSubCategories",
			timestamps: true,
			paranoid: false,
			tableName: "service_sub_categories",
		},
	);
};

export default ServiceSubCategories;
export { initModel };
