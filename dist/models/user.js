"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/user.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
const kyc_1 = __importDefault(require("./kyc"));
class User extends sequelize_1.Model {
    // Method to hash the password before saving
    static hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield bcrypt_1.default.hash(password, 10);
        });
    }
    // Method to check the password
    checkPassword(password) {
        return bcrypt_1.default.compare(password, this.password);
    }
    static associate(models) {
        this.hasOne(models.OTP, {
            as: 'otp',
            foreignKey: 'userId', // Ensure the OTP model has a 'userId' column
            onDelete: 'RESTRICT'
        });
        this.hasMany(models.VendorSubscription, {
            as: 'subscriptions',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT',
        });
        this.hasMany(models.Store, {
            as: 'stores',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT',
        });
        this.hasMany(models.Bid, {
            foreignKey: 'bidderId',
            as: 'bids',
        });
        this.hasOne(models.KYC, {
            as: 'kyc',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT'
        });
    }
    // Add method to fetch KYC record
    getKyc() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield kyc_1.default.findOne({ where: { vendorId: this.id } }); // Assuming KYC has a userId field linking to User
        });
    }
}
const initModel = (sequelize) => {
    User.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4, // Automatically generate UUIDs
        },
        firstName: sequelize_1.DataTypes.STRING,
        lastName: sequelize_1.DataTypes.STRING,
        gender: sequelize_1.DataTypes.STRING,
        email: {
            type: sequelize_1.DataTypes.STRING,
            unique: true, // Ensure unique emails
            allowNull: false, // You might want to enforce this
        },
        email_verified_at: sequelize_1.DataTypes.DATE,
        password: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false, // Enforce password requirement
        },
        phoneNumber: {
            type: sequelize_1.DataTypes.STRING,
            unique: true,
            allowNull: false, // Enforce phone number requirement
        },
        dateOfBirth: sequelize_1.DataTypes.STRING,
        location: sequelize_1.DataTypes.JSON,
        photo: sequelize_1.DataTypes.TEXT,
        wallet: sequelize_1.DataTypes.DECIMAL(20, 2),
        dollarWallet: sequelize_1.DataTypes.DECIMAL(20, 2),
        facebookId: sequelize_1.DataTypes.STRING,
        googleId: sequelize_1.DataTypes.STRING,
        accountType: sequelize_1.DataTypes.ENUM('Vendor', 'Customer'),
        status: sequelize_1.DataTypes.ENUM("active", "inactive"),
        isVerified: {
            type: sequelize_1.DataTypes.VIRTUAL,
            get() {
                // This will be populated during the query
                return this.getDataValue('isVerified') === true;
            },
        },
    }, {
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
    });
    // After finding a user, set the isVerified status
    User.addHook("afterFind", (user) => __awaiter(void 0, void 0, void 0, function* () {
        // If no user is found, exit early
        if (!user)
            return;
        // Function to update the `isVerified` field
        const setVerificationStatus = (userInstance) => __awaiter(void 0, void 0, void 0, function* () {
            const kyc = yield kyc_1.default.findOne({
                where: { vendorId: userInstance.id },
            });
            if (kyc) {
                userInstance.setDataValue('isVerified', kyc.isVerified); // Set it correctly based on KYC data
            }
            else {
                userInstance.setDataValue('isVerified', false); // Set as false if no KYC record exists
            }
        });
        if (Array.isArray(user)) {
            yield Promise.all(user.map(setVerificationStatus));
        }
        else {
            yield setVerificationStatus(user);
        }
    }));
    // Add the password hashing hook before saving
    User.addHook("beforeSave", (user) => __awaiter(void 0, void 0, void 0, function* () {
        if (user.changed("password") || user.isNewRecord) {
            user.password = yield User.hashPassword(user.password);
        }
    }));
};
exports.initModel = initModel;
// Export the User model and the init function
exports.default = User; // Ensure User is exported as default
//# sourceMappingURL=user.js.map