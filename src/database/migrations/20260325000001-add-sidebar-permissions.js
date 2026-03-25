'use strict';

const { v4: uuidv4 } = require('uuid');

const NEW_PERMISSIONS = [
  'view-customers',
  'manage-customers',
  'view-vendors',
  'view-products',
  'manage-products',
  'view-services',
  'manage-services',
  'view-stores',
  'manage-stores',
  'view-orders',
  'manage-orders',
  'view-transactions',
  'view-withdrawals',
  'manage-withdrawals',
  'view-pages',
  'manage-pages',
  'view-jobs',
  'manage-jobs',
  'view-adverts',
  'manage-adverts',
  'view-kyc',
  'manage-kyc',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Insert new permissions (skip any that already exist)
    const existingPermissions = await queryInterface.sequelize.query(
      `SELECT name FROM permissions WHERE name IN (${NEW_PERMISSIONS.map(() => '?').join(',')})`,
      { replacements: NEW_PERMISSIONS, type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const existingNames = existingPermissions.map((p) => p.name);
    const toInsert = NEW_PERMISSIONS.filter((name) => !existingNames.includes(name));

    if (toInsert.length > 0) {
      await queryInterface.bulkInsert(
        'permissions',
        toInsert.map((name) => ({
          id: uuidv4(),
          name,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }

    // Assign all new permissions to the superadmin role
    const superadminRole = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!superadminRole.length) return;

    const superadminRoleId = superadminRole[0].id;

    // Fetch the newly inserted permissions
    const permissions = await queryInterface.sequelize.query(
      `SELECT id FROM permissions WHERE name IN (${toInsert.map(() => '?').join(',')})`,
      { replacements: toInsert, type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    if (!permissions.length) return;

    // Filter out any already assigned
    const existingRolePerms = await queryInterface.sequelize.query(
      `SELECT permissionId FROM role_permissions WHERE roleId = ?`,
      { replacements: [superadminRoleId], type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const assignedIds = existingRolePerms.map((rp) => rp.permissionId);
    const toAssign = permissions.filter((p) => !assignedIds.includes(p.id));

    if (toAssign.length > 0) {
      await queryInterface.bulkInsert(
        'role_permissions',
        toAssign.map((p) => ({
          id: uuidv4(),
          roleId: superadminRoleId,
          permissionId: p.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        }))
      );
    }
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(
      `DELETE rp FROM role_permissions rp
       INNER JOIN permissions p ON rp.permissionId = p.id
       WHERE p.name IN (${NEW_PERMISSIONS.map(() => '?').join(',')})`,
      { replacements: NEW_PERMISSIONS }
    );

    await queryInterface.sequelize.query(
      `DELETE FROM permissions WHERE name IN (${NEW_PERMISSIONS.map(() => '?').join(',')})`,
      { replacements: NEW_PERMISSIONS }
    );
  },
};
