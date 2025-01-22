"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/subscriptionplan.ts
const sequelize_1 = require("sequelize");
class SubscriptionPlan extends sequelize_1.Model {
    static associate(models) {
        this.hasMany(models.VendorSubscription, {
            as: 'vendorSubscriptions',
            foreignKey: 'subscriptionPlanId',
        });
    }
}
const initModel = (sequelize) => {
    SubscriptionPlan.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        duration: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        price: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0, // Free plan has price 0
        },
        productLimit: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        allowsAuction: {
            type: sequelize_1.DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false, // Free plan may not allow auctions
        },
        auctionProductLimit: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true, // Null if auctions are not allowed
        },
    }, {
        sequelize,
        modelName: "SubscriptionPlan",
        timestamps: true,
        paranoid: false,
        tableName: "subscription_plans"
    });
};
exports.initModel = initModel;
exports.default = SubscriptionPlan;
//# sourceMappingURL=subscriptionplan.js.map