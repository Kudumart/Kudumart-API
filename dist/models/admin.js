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
// models/admin.ts
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
class Admin extends sequelize_1.Model {
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
    hasRole(requiredRole) {
        return this.roleId === requiredRole;
    }
    // Association with Role model
    static associate(models) {
        this.belongsTo(models.Role, {
            as: 'role',
            foreignKey: 'roleId',
        });
        this.hasMany(models.Store, {
            as: 'stores',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT',
        });
    }
}
const initModel = (sequelize) => {
    Admin.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4, // Automatically generate UUIDs
        },
        name: sequelize_1.DataTypes.STRING,
        email: {
            type: sequelize_1.DataTypes.STRING,
            unique: true, // Ensure unique emails
        },
        password: sequelize_1.DataTypes.STRING,
        photo: sequelize_1.DataTypes.TEXT,
        roleId: sequelize_1.DataTypes.UUID,
        status: sequelize_1.DataTypes.ENUM("active", "inactive"),
    }, {
        sequelize,
        modelName: "Admin",
        timestamps: true,
        paranoid: false,
        tableName: "admins",
        defaultScope: {
            attributes: { exclude: ["password"] },
        },
        scopes: {
            auth: {
                attributes: { include: ["password"] }, // Add necessary fields for authentication
            },
        },
    });
    // Add the password hashing hook before saving
    Admin.addHook("beforeSave", (admin) => __awaiter(void 0, void 0, void 0, function* () {
        if (admin.changed("password") || admin.isNewRecord) {
            admin.password = yield Admin.hashPassword(admin.password);
        }
    }));
};
exports.initModel = initModel;
// Export the User model and the init function
exports.default = Admin; // Ensure User is exported as default
//# sourceMappingURL=admin.js.map