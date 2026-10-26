'use strict';

const { v4: uuidv4 } = require('uuid');
const PERMISSION = 'manage-vendor-subscriptions';

module.exports = {
  async up(queryInterface) {
    const rows = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE name = ? LIMIT 1',
      { replacements: [PERMISSION], type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    let permissionId = rows[0]?.id;
    if (!permissionId) {
      permissionId = uuidv4();
      await queryInterface.bulkInsert('permissions', [{
        id: permissionId,
        name: PERMISSION,
        description: 'Can create or revoke vendor-specific subscription offers and fee waivers',
        createdAt: new Date(),
        updatedAt: new Date(),
      }]);
    }

    const roles = await queryInterface.sequelize.query(
      "SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1",
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    if (!roles.length) return;
    const assignments = await queryInterface.sequelize.query(
      'SELECT id FROM role_permissions WHERE roleId = ? AND permissionId = ? LIMIT 1',
      { replacements: [roles[0].id, permissionId], type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    if (!assignments.length) {
      await queryInterface.bulkInsert('role_permissions', [{
        id: uuidv4(), roleId: roles[0].id, permissionId, createdAt: new Date(), updatedAt: new Date(),
      }]);
    }
  },

  async down(queryInterface) {
    const rows = await queryInterface.sequelize.query(
      'SELECT id FROM permissions WHERE name = ? LIMIT 1',
      { replacements: [PERMISSION], type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    if (!rows.length) return;
    await queryInterface.bulkDelete('role_permissions', { permissionId: rows[0].id });
    await queryInterface.bulkDelete('permissions', { id: rows[0].id });
  },
};
