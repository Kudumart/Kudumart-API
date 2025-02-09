"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/role.ts
const sequelize_1 = require("sequelize");
class Role extends sequelize_1.Model {
    static associate(models) {
        // Many-to-Many relationship between Role and Permission
        this.belongsToMany(models.Permission, {
            through: 'role_permissions',
            foreignKey: 'roleId',
            as: 'permissions', // Alias for accessing permissions from a role
        });
        this.hasMany(models.Admin, {
            foreignKey: 'roleId',
            as: 'admins', // Alias for the relationship
        });
    }
}
const initModel = (sequelize) => {
    Role.init({
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
        modelName: "Role",
        timestamps: true,
        paranoid: false,
        tableName: "roles"
    });
};
exports.initModel = initModel;
exports.default = Role;
//# sourceMappingURL=role.js.map