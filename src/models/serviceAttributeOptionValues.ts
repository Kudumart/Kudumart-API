import { DataTypes, Model, Sequelize } from "sequelize";

export class ServiceAttributeOptionValues extends Model {
	public id!: string;
	public service_id!: string;
	public attribute_id!: number;
	public option_value_id!: number;

	public static associate(models: any) {
		this.belongsTo(models.Services, {
			foreignKey: "service_id",
			targetKey: "id",
			as: "service",
		});
		this.belongsTo(models.AttributeDefinitions, {
			foreignKey: "attribute_id",
			targetKey: "id",
			as: "attribute",
		});
		this.belongsTo(models.AttributeOptions, {
			foreignKey: "option_value_id",
			targetKey: "id",
			as: "optionValue",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	ServiceAttributeOptionValues.init(
		{
			id: {
				type: DataTypes.UUIDV4,
				primaryKey: true,
			},
			service_id: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: "services",
					key: "id",
				},
			},
			attribute_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "service_attribute",
					key: "id",
				},
			},
			option_value_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "service_attribute_options",
					key: "id",
				},
			},
		},
		{
			tableName: "service_attribute_option_values",
			timestamps: false,
			sequelize,
			indexes: [
				{
					unique: true,
					name: "unique_service_attribute_option",
					fields: ["service_id", "attribute_id", "option_value_id"],
				},
			],
		},
	);
	return ServiceAttributeOptionValues;
};

export default ServiceAttributeOptionValues;
export { initModel };
