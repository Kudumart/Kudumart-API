import { DataTypes, Model, Sequelize } from "sequelize";

class DropShippingCred extends Model {
	id!: string;
	accessToken!: string;
	expiresIn!: number;
	expireTime!: number;
	refreshToken!: string;
	refreshExpiresIn!: number;
	refreshTokenValidTime!: number;
	userId!: string;
	userNick!: string;
	locale!: string | null;
	vendorId!: string | null;
	accountId!: string | null;
	accountPlatform!: string | null;
	sellerId!: string | null;
	createdAt!: Date;
	updatedAt!: Date;

	static associate(models: any) {}
}

const initModel = (sequelize: Sequelize) => {
	DropShippingCred.init(
		{
			id: {
				type: DataTypes.UUID,
				autoIncrement: true,
				primaryKey: true,
				allowNull: false,
			},
			accessToken: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			expiresIn: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			expireTime: {
				type: DataTypes.NUMBER,
				allowNull: false,
			},
			refreshToken: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			refreshExpiresIn: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			refreshTokenValidTime: {
				type: DataTypes.NUMBER,
				allowNull: false,
			},
			userId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			userNick: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			locale: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			accountId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			vendorId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			account: {
				type: DataTypes.STRING,
				allowNull: false,
			}, // The user valid aliexpress email account
			accountPlatform: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			sellerId: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			sequelize,
			modelName: "Product",
			timestamps: true,
			paranoid: false,
			tableName: "products",
		},
	);
};

export default DropShippingCred;
export { initModel };
