import { DataTypes, Model, Sequelize } from "sequelize";
import AttributeDefinitions from "./attributeDefinitions";

export class ServiceAttributeTextValues extends Model {
	public id!: string;
	public service_id!: string;
	public attribute_id!: number;
	public text_value!: string;
	public attribute!: AttributeDefinitions;

	public static associate(models: any) {
		this.belongsTo(models.Services, {
			foreignKey: "service_id",
			targetKey: "id",
			onDelete: "CASCADE",
			as: "service",
		});
		this.belongsTo(models.AttributeDefinitions, {
			foreignKey: "attribute_id",
			targetKey: "id",
			as: "attribute",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	ServiceAttributeTextValues.init(
		{
			id: {
				type: DataTypes.UUIDV4,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
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
					model: "attribute_definitions",
					key: "id",
				},
			},
			text_value: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
		},
		{
			tableName: "attribute_text_values",
			timestamps: false,
			sequelize,
			indexes: [
				{
					unique: true,
					name: "unique_attribute_text_value",
					fields: ["service_id", "attribute_id"],
				},
			],
		},
	);
	return ServiceAttributeTextValues;
};

export default ServiceAttributeTextValues;
export { initModel };
