"use strict";

const { v4: uuidv4 } = require("uuid");

const REFERRAL_PERMISSIONS = [
	{
		name: "view-referrals",
		description: "Can view referral programmes, agents, referrals, and reports",
	},
	{
		name: "manage-referrals",
		description: "Can configure and manage referral programmes and operations",
	},
];

/** @type {import("sequelize-cli").Migration} */
module.exports = {
	async up(queryInterface) {
		for (const permission of REFERRAL_PERMISSIONS) {
			const existing = await queryInterface.sequelize.query(
				"SELECT id FROM permissions WHERE name = :name LIMIT 1",
				{
					replacements: { name: permission.name },
					type: queryInterface.sequelize.QueryTypes.SELECT,
				},
			);

			if (!existing.length) {
				await queryInterface.bulkInsert("permissions", [
					{
						id: uuidv4(),
						...permission,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				]);
			}
		}

		const [superadmin] = await queryInterface.sequelize.query(
			"SELECT id FROM roles WHERE name = 'superadmin' LIMIT 1",
			{ type: queryInterface.sequelize.QueryTypes.SELECT },
		);

		if (!superadmin) return;

		for (const permission of REFERRAL_PERMISSIONS) {
			const [record] = await queryInterface.sequelize.query(
				"SELECT id FROM permissions WHERE name = :name LIMIT 1",
				{
					replacements: { name: permission.name },
					type: queryInterface.sequelize.QueryTypes.SELECT,
				},
			);

			if (!record) continue;

			const existingAssignment = await queryInterface.sequelize.query(
				`SELECT id FROM role_permissions
				 WHERE roleId = :roleId AND permissionId = :permissionId LIMIT 1`,
				{
					replacements: {
						roleId: superadmin.id,
						permissionId: record.id,
					},
					type: queryInterface.sequelize.QueryTypes.SELECT,
				},
			);

			if (!existingAssignment.length) {
				await queryInterface.bulkInsert("role_permissions", [
					{
						id: uuidv4(),
						roleId: superadmin.id,
						permissionId: record.id,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				]);
			}
		}
	},

	async down(queryInterface) {
		const names = REFERRAL_PERMISSIONS.map(({ name }) => name);
		await queryInterface.sequelize.query(
			`DELETE rp FROM role_permissions rp
			 INNER JOIN permissions p ON p.id = rp.permissionId
			 WHERE p.name IN (:names)`,
			{ replacements: { names } },
		);
		await queryInterface.sequelize.query(
			"DELETE FROM permissions WHERE name IN (:names)",
			{ replacements: { names } },
		);
	},
};
