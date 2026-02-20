import { DataTypes, Model, Sequelize } from "sequelize";

export class AttributeOptions extends Model {
	public id!: number;
	public attribute_id!: number;
	public option_value!: string;

	public static associate(model: any) {
		this.belongsTo(model.AttributeDefinitions, {
			foreignKey: "attribute_id",
			targetKey: "id",
			onDelete: "CASCADE",
			as: "attribute",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	AttributeOptions.init(
		{
			id: {
				type: DataTypes.INTEGER,
				autoIncrement: true,
				primaryKey: true,
			},
			attribute_id: {
				type: DataTypes.INTEGER,
				allowNull: false,
				references: {
					model: "attribute_definitions",
					key: "id",
				},
			},
			option_value: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: "attribute_options",
			timestamps: false,
			sequelize,
		},
	);
	return AttributeOptions;
};

export default AttributeOptions;
export { initModel };
