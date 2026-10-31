'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_subscription_offers', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      vendorId: { type: Sequelize.UUID, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      subscriptionPlanId: { type: Sequelize.UUID, allowNull: false, references: { model: 'subscription_plans', key: 'id' }, onDelete: 'CASCADE' },
      specialPrice: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
      reason: { type: Sequelize.STRING(255), allowNull: false },
      expiresAt: { type: Sequelize.DATE, allowNull: true },
      isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      redeemedAt: { type: Sequelize.DATE, allowNull: true },
      createdBy: { type: Sequelize.UUID, allowNull: true, references: { model: 'admins', key: 'id' }, onDelete: 'SET NULL' },
      createdAt: { type: Sequelize.DATE, allowNull: false },
      updatedAt: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex('vendor_subscription_offers', ['vendorId', 'subscriptionPlanId', 'isActive'], { name: 'vendor_subscription_offer_lookup' });
    await queryInterface.addIndex('vendor_subscription_offers', ['expiresAt'], { name: 'vendor_subscription_offer_expiry' });
  },
  async down(queryInterface) {
    await queryInterface.dropTable('vendor_subscription_offers');
  },
};
