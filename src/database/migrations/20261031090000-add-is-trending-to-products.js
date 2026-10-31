'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'isTrending', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addIndex('products', ['isTrending', 'status'], {
      name: 'products_trending_status_idx',
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('products', 'products_trending_status_idx');
    await queryInterface.removeColumn('products', 'isTrending');
  },
};
