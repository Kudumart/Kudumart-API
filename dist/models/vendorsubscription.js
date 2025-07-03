"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/vendorsubscription.ts
const sequelize_1 = require("sequelize");
class VendorSubscription extends sequelize_1.Model {
    static associate(models) {
        // Associate with User model
        this.belongsTo(models.User, {
            as: 'vendor',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT',
        });
        // Associate with SubscriptionPlan model
        this.belongsTo(models.SubscriptionPlan, {
            as: 'subscriptionPlans',
            foreignKey: 'subscriptionPlanId',
            onDelete: 'RESTRICT',
        });
    }
}
const initModel = (sequelize) => {
    VendorSubscription.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        vendorId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        subscriptionPlanId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
            defaultValue: sequelize_1.DataTypes.NOW,
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        isActive: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        modelName: "VendorSubscription",
        timestamps: true,
        paranoid: false,
        tableName: "vendor_subscriptions"
    });
};
exports.initModel = initModel;
exports.default = VendorSubscription;
//# sourceMappingURL=vendorsubscription.js.map