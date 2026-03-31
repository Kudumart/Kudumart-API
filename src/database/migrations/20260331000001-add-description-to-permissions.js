'use strict';

// Descriptions sourced from src/utils/permissions.ts → PERMISSION_DESCRIPTIONS
// To update a description: update the constants file first, then write a new migration
const descriptions = {
	"update-profile": "Can update their own admin profile details",
	"update-password": "Can change their own admin account password",
	"view-subadmin": "Can view the list of sub-admins",
	"create-subadmin": "Can create new sub-admin accounts",
	"update-subadmin": "Can edit existing sub-admin account details",
	"delete-subadmin": "Can permanently delete a sub-admin account",
	"activateanddeactivate-subadmin": "Can activate or deactivate a sub-admin account",
	"resendlogindetails-subadmin": "Can resend login credentials to a sub-admin",
	"view-role": "Can view all roles and their details",
	"create-role": "Can create new roles",
	"update-role": "Can edit existing role names and details",
	"view-role-permissions": "Can view permissions assigned to a role",
	"assign-role-permissions": "Can assign permissions to a role",
	"delete-role-permissions": "Can remove permissions from a role",
	"view-permission": "Can view the full list of system permissions",
	"view-customers": "Can view all customer accounts",
	"manage-customers": "Can edit, suspend, or manage customer accounts",
	"view-vendors": "Can view all vendor accounts",
	"view-products": "Can view all products on the platform",
	"manage-products": "Can create, edit, publish, or delete products",
	"view-services": "Can view all services listed on the platform",
	"manage-services": "Can create, edit, publish, or delete services",
	"view-stores": "Can view all vendor stores",
	"manage-stores": "Can create, edit, or delete stores",
	"view-orders": "Can view all customer orders",
	"manage-orders": "Can update order statuses and manage order details",
	"view-transactions": "Can view all payment transactions on the platform",
	"view-withdrawals": "Can view all vendor withdrawal requests",
	"manage-withdrawals": "Can approve or reject vendor withdrawal requests",
	"view-pages": "Can view CMS pages including FAQs, banners, and testimonials",
	"manage-pages": "Can create, edit, or delete CMS pages",
	"view-jobs": "Can view all job listings",
	"manage-jobs": "Can create, edit, or delete job listings",
	"view-adverts": "Can view all adverts on the platform",
	"manage-adverts": "Can create, edit, approve, or delete adverts",
	"view-kyc": "Can view vendor KYC submissions",
	"manage-kyc": "Can approve or reject vendor KYC submissions",
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addColumn('permissions', 'description', {
			type: Sequelize.STRING,
			allowNull: true,
			after: 'name',
		});

		for (const [name, description] of Object.entries(descriptions)) {
			await queryInterface.sequelize.query(
				`UPDATE permissions SET description = :description WHERE name = :name`,
				{ replacements: { description, name } }
			);
		}
	},

	async down(queryInterface) {
		await queryInterface.removeColumn('permissions', 'description');
	},
};
