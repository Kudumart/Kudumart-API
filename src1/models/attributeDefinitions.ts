import { Model, DataTypes, Sequelize } from "sequelize";

export class AttributeDefinitions extends Model {
	public id!: number;
	public name!: string;
	public input_type!: string;
	public data_type!: string;

	public static associate(model: any) {
		this.hasMany(model.AttributeOptions, {
			foreignKey: "attribute_id",
			as: "options",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	AttributeDefinitions.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			input_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			data_type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: "attribute_definitions",
			timestamps: false,
			sequelize,
			indexes: [
				{
					unique: true,
					fields: ["name"],
				},
			],
		},
	);
	return AttributeDefinitions;
};

export default AttributeDefinitions;
export { initModel };
