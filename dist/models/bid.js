"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Bid.ts
const sequelize_1 = require("sequelize");
class Bid extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'bidderId',
            onDelete: 'RESTRICT',
        });
        this.belongsTo(models.AuctionProduct, {
            as: 'auctionProduct',
            foreignKey: 'auctionProductId',
            onDelete: 'CASCADE',
        });
    }
}
const initModel = (sequelize) => {
    Bid.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        auctionProductId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'auction_products',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        bidderId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT',
        },
        bidAmount: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        bidCount: {
            type: sequelize_1.DataTypes.INTEGER,
            allowNull: false,
        },
        isWinningBid: {
            type: sequelize_1.DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Bid',
        timestamps: true,
        paranoid: false,
        tableName: 'bids',
    });
};
exports.initModel = initModel;
exports.default = Bid;
//# sourceMappingURL=bid.js.map