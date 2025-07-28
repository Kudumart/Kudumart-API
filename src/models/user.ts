// models/user.ts
import bcrypt from "bcrypt";
import { Model, DataTypes, Sequelize } from "sequelize";
import KYC from "./kyc";

interface Location {
	country?: string;
	state?: string;
	city?: string;
	// Add other fields as needed
}

class User extends Model {
	public id!: string; // Use '!' to indicate these fields are definitely assigned
	public firstName!: string;
	public lastName!: string;
	public gender?: string;
	public email!: string;
	public email_verified_at?: Date;
	public password!: string;
	public phoneNumber!: string;
	public dateOfBirth?: string;
	public location?: Location; // This will be serialized as JSON
	public photo?: string;
	public fcmToken?: string;
	public wallet?: number;
	public dollarWallet?: number;
	public accountType?: string;
	public status?: "active" | "inactive";
	public isVerified?: boolean;
	public createdAt?: Date;
	public updatedAt?: Date;
	public kyc?: KYC | null;

	// Method to hash the password before saving
	static async hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	// Method to check the password
	checkPassword(password: string): Promise<boolean> {
		return bcrypt.compare(password, this.password);
	}

	static associate(models: any) {
		// Define expected model types
		this.hasOne(models.OTP, {
			as: "otp",
			foreignKey: "userId", // Ensure the OTP model has a 'userId' column
			onDelete: "RESTRICT",
		});
		this.hasMany(models.VendorSubscription, {
			as: "subscriptions",
			foreignKey: "vendorId",
			onDelete: "RESTRICT",
		});
		this.hasMany(models.Store, {
			as: "stores",
			foreignKey: "vendorId",
			onDelete: "RESTRICT",
		});
		this.hasMany(models.Bid, {
			foreignKey: "bidderId",
			as: "bids",
		});
		this.hasOne(models.KYC, {
			as: "kyc",
			foreignKey: "vendorId",
			onDelete: "RESTRICT",
		});
	}

	// Add method to fetch KYC record
	public async getKyc(): Promise<KYC | null> {
		return await KYC.findOne({ where: { vendorId: this.id } }); // Assuming KYC has a userId field linking to User
	}
}

const initModel = (sequelize: Sequelize) => {
	User.init(
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4, // Automatically generate UUIDs
			},
			firstName: DataTypes.STRING,
			lastName: DataTypes.STRING,
			gender: DataTypes.STRING,
			email: {
				type: DataTypes.STRING,
				unique: true, // Ensure unique emails
				allowNull: false, // You might want to enforce this
			},
			email_verified_at: DataTypes.DATE,
			password: {
				type: DataTypes.STRING,
				allowNull: false, // Enforce password requirement
			},
			phoneNumber: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false, // Enforce phone number requirement
			},
			dateOfBirth: DataTypes.STRING,
			location: {
				type: DataTypes.JSON,
				defaultValue: [], // Ensures it's an array by default
				get() {
					const value = this.getDataValue("location");
					return typeof value === "string" ? JSON.parse(value) : value;
				},
			},
			photo: DataTypes.TEXT,
			fcmToken: DataTypes.STRING,
			wallet: DataTypes.DECIMAL(20, 2),
			dollarWallet: DataTypes.DECIMAL(20, 2),
			facebookId: DataTypes.STRING,
			googleId: DataTypes.STRING,
			accountType: DataTypes.ENUM("Vendor", "Customer"),
			status: DataTypes.ENUM("active", "inactive"),
			isVerified: {
				type: DataTypes.VIRTUAL,
				get() {
					// This will be populated during the query
					return this.getDataValue("isVerified") === true;
				},
			},
		},
		{
			sequelize,
			modelName: "User",
			timestamps: true,
			paranoid: false,
			tableName: "users",
			defaultScope: {
				attributes: { exclude: ["password"] },
			},
			scopes: {
				auth: {
					attributes: { include: ["password"] }, // Add necessary fields for authentication
				},
			},
		},
	);

	// After finding a user, set the isVerified status
	User.addHook("afterFind", async (user: any) => {
		// If no user is found, exit early
		if (!user) return;

		// Function to update the `isVerified` field
		const setVerificationStatus = async (userInstance: User) => {
			const kyc = await KYC.findOne({
				where: { vendorId: userInstance.id },
			});

			if (kyc) {
				userInstance.setDataValue("isVerified", kyc.isVerified); // Set it correctly based on KYC data
			} else {
				userInstance.setDataValue("isVerified", false); // Set as false if no KYC record exists
			}
		};

		// If the result is an array of users (e.g., when using includes in a query), set for each one
		if (Array.isArray(user)) {
			await Promise.all(
				user.map((userInstance: User) => setVerificationStatus(userInstance)),
			);
		} else {
			// For a single user, directly update the status
			await setVerificationStatus(user);
		}
	});

	// Add the password hashing hook before saving
	User.addHook("beforeSave", async (user: User) => {
		if (user.changed("password") || user.isNewRecord) {
			user.password = await User.hashPassword(user.password);
		}
	});
};

// Export the User model and the init function
export default User; // Ensure User is exported as default
export { initModel };
