'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscription_plans', 'isFeeWaived', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      after: 'price',
    });
  },
  async down(queryInterface) {
    await queryInterface.removeColumn('subscription_plans', 'isFeeWaived');
  },
};
