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
			otpCode: {
				allowNull: true,
				type: DataTypes.STRING,
				validate: {
					notBothNull(value: string | null) {
						if (!value && !this.otpToken) {
							throw new Error("Either otpCode or otpToken must be provided");
						}
					},
				},
			},
			otpToken: {
				allowNull: true,
				type: DataTypes.STRING,
				validate: {
					notBothNull(value: string | null) {
						if (!value && !this.otpCode) {
							throw new Error("Either otpCode or otpToken must be provided");
						}
					},
				},
			},
			otpTokenExpiresAt: {
				allowNull: true,
				type: DataTypes.DATE,
				validate: {
					notBothNull(value: Date | null) {
						if (!value && !this.expiresAt) {
							throw new Error(
								"Either otpTokenExpiresAt or expiresAt must be provided",
							);
						}
					},
				},
			},
			expiresAt: {
				allowNull: true,
				type: DataTypes.DATE,
				validate: {
					notBothNull(value: Date | null) {
						if (!value && !this.otpTokenExpiresAt) {
							throw new Error(
								"Either expiresAt or otpTokenExpiresAt must be provided",
							);
						}
					},
				},
			},
		},
		{
			sequelize,
			modelName: "OTP",
			timestamps: true,
			paranoid: false,
			tableName: "otps",
			validate: {
				atLeastOneFieldRequired() {
					if (!this.otpCode && !this.otpToken) {
						throw new Error("Either otpCode or otpToken must be provided");
					}
				},
				atLeastOneExpirationFieldRequired() {
					if (!this.otpTokenExpiresAt && !this.expiresAt) {
						throw new Error(
							"Either otpTokenExpiresAt or expiresAt must be provided",
						);
					}
				},
			},
		},
	);
};

export default OTP;
export { initModel };
