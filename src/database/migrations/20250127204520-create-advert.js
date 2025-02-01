'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('adverts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      categoryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'sub_categories',
          key: 'id',
        },
        onDelete: 'RESTRICT',
      },
      productId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      media_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      clicks: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      status: {
        allowNull: false,
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
      },
      adminNote: {
        allowNull: true,
        type: Sequelize.TEXT
      },
      showOnHomepage: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false, // Default to false (not on homepage)
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
    await queryInterface.dropTable('adverts');
  }
};