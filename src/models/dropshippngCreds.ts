import { DataTypes, Model, Sequelize } from "sequelize";

class DropShippingCred extends Model {
	id!: string;
	accessToken!: string;
	expiresIn!: number;
	expireTime!: number;
	refreshToken!: string;
	refreshExpiresIn!: number;
	refreshTokenValidTime!: number;
	userNick!: string;
	locale!: string | null;
	vendorId!: string | null;
	accountId!: string | null;
	account!: string;
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
				defaultValue: DataTypes.UUIDV4,
				primaryKey: true,
				allowNull: false,
			},
			accessToken: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			expiresIn: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			expireTime: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			refreshToken: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			refreshExpiresIn: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			refreshTokenValidTime: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			userNick: {
				type: DataTypes.STRING,
				allowNull: true,
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
			modelName: "DropShippingCred",
			timestamps: true,
			paranoid: false,
			tableName: "dropshipping_creds",
		},
	);
};

export default DropShippingCred;
export { initModel };
