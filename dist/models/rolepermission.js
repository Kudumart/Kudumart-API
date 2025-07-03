"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/rolepermission.ts
const sequelize_1 = require("sequelize");
const role_1 = __importDefault(require("./role"));
const permission_1 = __importDefault(require("./permission"));
class RolePermission extends sequelize_1.Model {
    // Define associations
    static associate(models) {
        this.belongsTo(role_1.default, {
            foreignKey: 'roleId',
            as: 'role',
        });
        this.belongsTo(permission_1.default, {
            foreignKey: 'permissionId',
            as: 'permission',
        });
    }
}
const initModel = (sequelize) => {
    RolePermission.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        roleId: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: 'roles',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        permissionId: {
            type: sequelize_1.DataTypes.UUID,
            references: {
                model: 'permissions',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
    }, {
        sequelize,
        modelName: "RolePermission",
        timestamps: true,
        paranoid: false,
        tableName: "role_permissions"
    });
};
exports.initModel = initModel;
exports.default = RolePermission;
//# sourceMappingURL=rolepermission.js.map