import { DataTypes, Model, Sequelize } from "sequelize";

export class ServiceAttributeNumberValues extends Model {
	public id!: string;
	public service_id!: string;
	public attribute_id!: number;
	public value!: number;

	public static associate(models: any) {
		this.belongsTo(models.Services, {
			foreignKey: "service_id",
			targetKey: "id",
			as: "service",
		});
		this.belongsTo(models.ServiceAttributes, {
			foreignKey: "attribute_id",
			targetKey: "id",
			as: "attribute",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	ServiceAttributeNumberValues.init(
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
			value: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
		},
		{
			tableName: "service_attribute_number_values",
			timestamps: false,
			sequelize,
			indexes: [
				{
					unique: true,
					name: "unique_service_attribute_number_value",
					fields: ["service_id", "attribute_id"],
				},
			],
		},
	);
	return ServiceAttributeNumberValues;
};

export default ServiceAttributeNumberValues;
export { initModel };
