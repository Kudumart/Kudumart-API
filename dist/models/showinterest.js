"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/ShowInterest.ts
const sequelize_1 = require("sequelize");
class ShowInterest extends sequelize_1.Model {
    static associate(models) {
        // Define associations here
        this.belongsTo(models.User, {
            as: 'user',
            foreignKey: 'userId',
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
    ShowInterest.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        userId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: "users",
                key: "id",
            },
            onDelete: "RESTRICT",
        },
        auctionProductId: {
            type: sequelize_1.DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'auction_products', // Ensure this matches your AuctionProduct table name
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        amountPaid: {
            type: sequelize_1.DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        status: {
            type: sequelize_1.DataTypes.ENUM("pending", "confirmed"),
            defaultValue: "pending",
        },
    }, {
        sequelize,
        modelName: 'ShowInterest',
        timestamps: true,
        paranoid: false,
        tableName: 'show_interests',
    });
};
exports.initModel = initModel;
exports.default = ShowInterest;
//# sourceMappingURL=showinterest.js.map