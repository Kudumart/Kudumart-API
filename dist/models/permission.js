"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/permission.ts
const sequelize_1 = require("sequelize");
class Permission extends sequelize_1.Model {
    static associate(models) {
        // Many-to-Many relationship between Permission and Role
        this.belongsToMany(models.Role, {
            through: 'role_permissions', // The join table
            foreignKey: 'permissionId', // Foreign key for Permission in the join table
            as: 'roles', // Alias for accessing roles from a permission
        });
    }
}
const initModel = (sequelize) => {
    Permission.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
    }, {
        sequelize,
        modelName: "Permission",
        timestamps: true,
        paranoid: false,
        tableName: "permissions"
    });
};
exports.initModel = initModel;
exports.default = Permission;
//# sourceMappingURL=permission.js.map