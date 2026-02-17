import { DataTypes, Model, Sequelize } from "sequelize";

export class ServiceCategoryToAttributeMap extends Model {
	public id!: number;
	public service_category_id!: number;
	public attribute_id!: number;
	public attribute?: any; // To hold the associated attribute

	public static associate(models: any) {
		this.belongsTo(models.ServiceCategories, {
			foreignKey: "service_category_id",
			targetKey: "id",
			as: "category",
		});
		this.belongsTo(models.AttributeDefinitions, {
			foreignKey: "attribute_id",
			targetKey: "id",
			as: "attribute",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	ServiceCategoryToAttributeMap.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			service_category_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "service_categories",
					key: "id",
				},
			},
			attribute_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_definitions",
					key: "id",
				},
			},
		},
		{
			tableName: "attribute_category_map",
			timestamps: false,
			sequelize,
			indexes: [
				{
					unique: true,
					name: "unique_attribute_category_map",
					fields: ["service_category_id", "attribute_id"],
				},
			],
		},
	);
	return ServiceCategoryToAttributeMap;
};

export default ServiceCategoryToAttributeMap;
export { initModel };
