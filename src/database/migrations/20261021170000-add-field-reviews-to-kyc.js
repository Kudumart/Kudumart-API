'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('kycs', 'reviewStatus', {
      type: Sequelize.ENUM('pending', 'changes_requested', 'approved'),
      allowNull: false,
      defaultValue: 'pending',
    });
    await queryInterface.addColumn('kycs', 'fieldReviews', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: {},
    });
    await queryInterface.sequelize.query(
      "UPDATE kycs SET reviewStatus = CASE WHEN isVerified = 1 THEN 'approved' WHEN adminNote IS NOT NULL THEN 'changes_requested' ELSE 'pending' END"
    );
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('kycs', 'fieldReviews');
    await queryInterface.removeColumn('kycs', 'reviewStatus');
  },
};
