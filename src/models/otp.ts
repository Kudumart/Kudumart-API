// models/otp.ts
import { Model, DataTypes, Sequelize } from "sequelize";
import User from "./user";

class OTP extends Model {
	public userId!: string;
	public otpCode!: string;
	public expiresAt?: Date;
	public otpToken!: string;
	public otpTokenExpiresAt?: Date;
	public updatedAt?: Date;
	public deletedAt?: Date | null;
	public user?: User;

	// Association with User model
	static associate(models: any) {
		this.belongsTo(models.User, {
			as: "user",
			foreignKey: "userId", // Ensure the OTP model has a 'userId' column
		});
	}
}

const initModel = (sequelize: Sequelize) => {
	OTP.init(
		{
			userId: DataTypes.UUID,
			otpCode: DataTypes.STRING,
			otpToken: DataTypes.STRING,
			otpTokenExpiresAt: DataTypes.DATE,
			expiresAt: DataTypes.DATE,
		},
		{
			sequelize,
			modelName: "OTP",
			timestamps: true,
			paranoid: false,
			tableName: "otps",
		},
	);
};

export default OTP;
export { initModel };
