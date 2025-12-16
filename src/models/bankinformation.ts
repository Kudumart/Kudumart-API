// models/BankInformation.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import User from "./user";

class BankInformation extends Model {
	public id!: string;
	public vendorId!: string;
	public bankInfo!: string;
	public bankName!: string;
	public accountNumber!: string;
	public accountHolderName!: string;
	public swiftCode!: string;
	public routingNumber!: string;
	public bankAddress!: string;

	public createdAt?: Date;
	public updatedAt?: Date;

	public user?: User;

	static associate(models: any) {
		// Define associations here
		this.belongsTo(models.User, {
			as: "user",
			foreignKey: "vendorId",
			onDelete: "RESTRICT",
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	BankInformation.init(
		{
			id: {
				type: DataTypes.UUID,
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			vendorId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			bankInfo: {
				type: DataTypes.TEXT,
				allowNull: true,
			},
			bankName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			accountNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			accountHolderName: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			swiftCode: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			routingNumber: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			bankAddress: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "BankInformation",
			timestamps: true,
			paranoid: false,
			tableName: "bank_informations",
		},
	);
};

export default BankInformation;
export { initModel };
