"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
const sequelize_1 = require("sequelize");
class BlockedVendor extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
        this.belongsTo(models.User, {
            as: 'vendor',
            foreignKey: 'vendorId',
            onDelete: 'CASCADE',
        });
    }
}
const initBlockedVendor = (sequelize) => {
    BlockedVendor.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            primaryKey: true,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        vendorId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'BlockedVendor',
        tableName: 'blocked_vendors',
        timestamps: true,
    });
};
exports.initModel = initBlockedVendor;
exports.default = BlockedVendor;
//# sourceMappingURL=blockedvendor.js.map