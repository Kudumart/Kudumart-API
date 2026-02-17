// migrations/YYYYMMDDHHMMSS-create-vendor-subscriptions.js
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vendor_subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      vendorId: {
        type: Sequelize.UUID,
        allowNull: false,
        // Assuming there's a reference to a vendors table
      },
      subscriptionPlanId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subscription_plans',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add foreign key constraint for subscriptionPlanId
    await queryInterface.addConstraint('vendor_subscriptions', {
      fields: ['subscriptionPlanId'],
      type: 'foreign key',
      name: 'fk_subscription_plan_id',
      references: {
        table: 'subscription_plans',
        field: 'id',
      },
      onDelete: 'RESTRICT', // Prevent deletion if referenced in vendor_subscriptions
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('vendor_subscriptions');
  },
};
