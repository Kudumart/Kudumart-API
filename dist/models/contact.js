"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initModel = void 0;
// models/Contact.ts
const sequelize_1 = require("sequelize");
class Contact extends sequelize_1.Model {
    // Association with User model
    static associate(models) {
    }
}
const initModel = (sequelize) => {
    Contact.init({
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
        phoneNumber: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: sequelize_1.DataTypes.STRING,
            allowNull: true
        },
        message: {
            type: sequelize_1.DataTypes.TEXT,
            allowNull: true
        },
    }, {
        sequelize,
        modelName: "Contact",
        timestamps: true,
        paranoid: false,
        tableName: "contacts"
    });
};
exports.initModel = initModel;
exports.default = Contact;
//# sourceMappingURL=contact.js.map