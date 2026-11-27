import { Model, DataTypes, Sequelize } from "sequelize";

class PlatformSetting extends Model {
	public key!: string;
	public value!: string | null;
	public updatedBy!: string | null;
	public createdAt?: Date;
	public updatedAt?: Date;

	static associate(_models: any) {
		// Standalone key-value settings table
	}
}

const initModel = (sequelize: Sequelize) => {
	PlatformSetting.init(
		{
			key: {
				type: DataTypes.STRING(120),
				primaryKey: true,
				allowNull: false,
			},
			value: {
				type: DataTypes.TEXT("long"),
				allowNull: true,
			},
			updatedBy: {
				type: DataTypes.STRING(120),
				allowNull: true,
			},
		},
		{
			sequelize,
			tableName: "platform_settings",
			timestamps: true,
		},
	);
};

export default PlatformSetting;
export { initModel };
