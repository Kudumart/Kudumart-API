"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/store.ts
const sequelize_1 = require("sequelize");
class Store extends sequelize_1.Model {
    static associate(models) {
        // Associate with User model
        this.belongsTo(models.User, {
            as: 'vendor',
            foreignKey: 'vendorId'
        });
        this.hasMany(models.Product, {
            as: 'products',
            foreignKey: 'storeId'
        });
        this.hasMany(models.AuctionProduct, {
            as: 'auctionproducts',
            foreignKey: 'storeId'
        });
        this.belongsTo(models.Currency, {
            as: 'currency',
            foreignKey: 'currencyId'
        });
    }
}
const initModel = (sequelize) => {
    Store.init({
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
        currencyId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'currencies',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false
        },
        location: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true // Address or general location
        },
        businessHours: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        deliveryOptions: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true
        },
        tipsOnFinding: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        logo: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        isVerified: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false, // Default is not verified
        },
    }, {
        sequelize,
        modelName: "Store",
        timestamps: true,
        paranoid: false,
        tableName: "stores"
    });
};
exports.initModel = initModel;
exports.default = Store;
//# sourceMappingURL=store.js.map