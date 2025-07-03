"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Banner.ts
const sequelize_1 = require("sequelize");
class Banner extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
    }
}
const initModel = (sequelize) => {
    Banner.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        image: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        sequelize,
        modelName: "Banner",
        timestamps: true,
        paranoid: false,
        tableName: "banners"
    });
};
exports.initModel = initModel;
exports.default = Banner;
//# sourceMappingURL=banner.js.map