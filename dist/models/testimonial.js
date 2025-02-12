"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Testimonial.ts
const sequelize_1 = require("sequelize");
class Testimonial extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
    }
}
const initModel = (sequelize) => {
    Testimonial.init({
        id: {
            type: sequelize_1.DataTypes.UUID,
            defaultValue: sequelize_1.DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
        },
        name: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true,
        },
        position: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        photo: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: "Testimonial",
        timestamps: true,
        paranoid: false,
        tableName: "testimonials"
    });
};
exports.initModel = initModel;
exports.default = Testimonial;
//# sourceMappingURL=testimonial.js.map