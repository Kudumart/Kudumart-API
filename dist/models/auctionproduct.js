"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/AuctionProduct.ts
const sequelize_1 = require("sequelize");
class AuctionProduct extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.User, {
            as: 'vendor',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT',
        });
        this.belongsTo(models.Admin, {
            as: 'admin',
            foreignKey: 'vendorId',
            onDelete: 'RESTRICT',
        });
        this.belongsTo(models.Store, {
            as: 'store',
            foreignKey: 'storeId',
            onDelete: 'RESTRICT',
        });
        this.belongsTo(models.SubCategory, {
            as: 'sub_category',
            foreignKey: 'categoryId',
            onDelete: 'RESTRICT',
        });
        this.hasMany(models.Bid, {
            as: 'bids',
            foreignKey: 'auctionProductId',
            onDelete: 'CASCADE',
        });
    }
}
const initModel = (sequelize) => {
    AuctionProduct.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        vendorId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false
        },
        storeId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'stores',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        categoryId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'sub_categories',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: false,
        },
        sku: {
            type: sequelize_1.DataTypes.STRING,
            unique: true,
            allowNull: false,
        },
        condition: {
            type: sequelize_1.DataTypes.ENUM('brand_new', 'fairly_used', 'fairly_foreign', 'refurbished'),
            allowNull: false,
        },
        description: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
        specification: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: false,
        },
        price: {
            type: sequelize_1.DataTypes.DECIMAL(20, 2),
            allowNull: false,
        },
        bidIncrement: {
            type: sequelize_1.DataTypes.DECIMAL(29, 2),
            allowNull: true,
        },
        maxBidsPerUser: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: true,
        },
        participantsInterestFee: {
            type: sequelize_1.DataTypes.DECIMAL(20, 2),
            allowNull: false,
        },
        startDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        endDate: {
            type: sequelize_1.DataTypes.DATE,
            allowNull: false,
        },
        image: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        additionalImages: {
            type: sequelize_1.DataTypes.JSON,
            allowNull: true,
        },
        auctionStatus: {
            type: sequelize_1.DataTypes.ENUM('upcoming', 'ongoing', 'cancelled', 'ended'),
            defaultValue: 'upcoming',
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: 'AuctionProduct',
        timestamps: true,
        paranoid: false,
        tableName: 'auction_products',
    });
};
exports.initModel = initModel;
exports.default = AuctionProduct;
//# sourceMappingURL=auctionproduct.js.map