import { DataTypes, Model, Sequelize } from "sequelize";

export class ServiceAttributeBoolValues extends Model {
	public id!: number;
	public service_id!: string;
	public attribute_id!: number;
	public value!: boolean;

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
	}
}

const initModel = (sequelize: Sequelize) => {
	ServiceAttributeBoolValues.init(
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
					model: "attribute_definitions",
					key: "id",
				},
			},
			value: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
		},
		{
			tableName: "service_attribute_bool_values",
			timestamps: false,
			sequelize,
			indexes: [
				{
					unique: true,
					name: "unique_service_attribute_bool_value",
					fields: ["service_id", "attribute_id"],
				},
			],
		},
	);
	return ServiceAttributeBoolValues;
};

export default ServiceAttributeBoolValues;
export { initModel };
