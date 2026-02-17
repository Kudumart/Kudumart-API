// migrations/seeders/AdminSeeder.js
'use strict';
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const saltRounds = 10;
    
    // Create the admin
    const adminId = uuidv4();
    const superadminRoleId = await queryInterface.rawSelect('roles', {
      where: { name: 'superadmin' }
    }, ['id']);

    await queryInterface.bulkInsert('admins', [{
      id: adminId,
      name: 'Administrator',
      email: "admin@kudumart.com",
      password: await bcrypt.hash("Password", saltRounds),
      roleId: superadminRoleId, // Assigning the role
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});

    // Get the role and permissions IDs
    const superadminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'superadmin' }
    }, ['id']);

    const permissions = await queryInterface.sequelize.query(
      'SELECT id FROM permissions'
    );

    const rolePermissions = permissions[0].map(permission => ({
      id: uuidv4(),
      roleId: superadminRole,
      permissionId: permission.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // Insert into role_permissions table
    return queryInterface.bulkInsert('role_permissions', rolePermissions);
  },

  async down(queryInterface) {
    // Remove all role_permissions for the superadmin role
    const superadminRole = await queryInterface.rawSelect('roles', {
      where: { name: 'superadmin' }
    }, ['id']);

    return queryInterface.bulkDelete('role_permissions', { roleId: superadminRole }, {});
  }
};
