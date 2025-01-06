'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('kycs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vendorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      businessName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      contactEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true, // Ensure email is unique
      },
      contactPhoneNumber: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      businessDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      businessLink: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      businessAddress: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      businessRegistrationNumber: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      idVerification: {
        type: Sequelize.JSON, // This could be a URL to the uploaded document
        allowNull: true,
      },
      adminNote: {
        type: Sequelize.TEXT, // This field is for admin's notes or remarks
        allowNull: true,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false, // Default is not verified
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('kycs');
  }
};