"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("kyc_review_events", {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      kycId: { type: Sequelize.UUID, allowNull: false, references: { model: "kycs", key: "id" }, onDelete: "CASCADE" },
      reviewerId: { type: Sequelize.UUID, allowNull: true },
      fieldName: { type: Sequelize.STRING, allowNull: false },
      status: { type: Sequelize.ENUM("pending", "approved", "rejected"), allowNull: false },
      reason: { type: Sequelize.TEXT, allowNull: true },
      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
    });
    await queryInterface.addIndex("kyc_review_events", ["kycId"]);
  },
  async down(queryInterface) { await queryInterface.dropTable("kyc_review_events"); },
};
