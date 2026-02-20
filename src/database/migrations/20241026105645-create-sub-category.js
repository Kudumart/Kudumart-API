'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('sub_categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.UUID,
        references: {
          model: 'categories',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      image: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
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

    // Add foreign key constraint for subscriptionPlanId
    await queryInterface.addConstraint('sub_categories', {
      fields: ['categoryId'],
      type: 'foreign key',
      name: 'fk_category_id',
      references: {
        table: 'categories',
        field: 'id',
      },
      onDelete: 'RESTRICT', // Prevent deletion if referenced in vendor_subscriptions
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('sub_categories');
  }
};