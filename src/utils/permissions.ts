export const PERMISSIONS = {
	// Profile
	UPDATE_PROFILE: "update-profile",
	UPDATE_PASSWORD: "update-password",

	// Sub Admin
	VIEW_SUBADMIN: "view-subadmin",
	CREATE_SUBADMIN: "create-subadmin",
	UPDATE_SUBADMIN: "update-subadmin",
	DELETE_SUBADMIN: "delete-subadmin",
	ACTIVATE_DEACTIVATE_SUBADMIN: "activateanddeactivate-subadmin",
	RESEND_LOGIN_SUBADMIN: "resendlogindetails-subadmin",

	// Roles
	VIEW_ROLE: "view-role",
	CREATE_ROLE: "create-role",
	UPDATE_ROLE: "update-role",
	VIEW_ROLE_PERMISSIONS: "view-role-permissions",
	ASSIGN_ROLE_PERMISSIONS: "assign-role-permissions",
	DELETE_ROLE_PERMISSIONS: "delete-role-permissions",

	// Permissions (read-only — create/update/delete managed via migrations only)
	VIEW_PERMISSION: "view-permission",

	// Users
	VIEW_CUSTOMERS: "view-customers",
	MANAGE_CUSTOMERS: "manage-customers",
	VIEW_VENDORS: "view-vendors",

	// Products
	VIEW_PRODUCTS: "view-products",
	MANAGE_PRODUCTS: "manage-products",

	// Services
	VIEW_SERVICES: "view-services",
	MANAGE_SERVICES: "manage-services",

	// Stores
	VIEW_STORES: "view-stores",
	MANAGE_STORES: "manage-stores",

	// Orders
	VIEW_ORDERS: "view-orders",
	MANAGE_ORDERS: "manage-orders",

	// Transactions
	VIEW_TRANSACTIONS: "view-transactions",

	// Withdrawals
	VIEW_WITHDRAWALS: "view-withdrawals",
	MANAGE_WITHDRAWALS: "manage-withdrawals",

	// Pages (FAQs, Banners, Testimonials)
	VIEW_PAGES: "view-pages",
	MANAGE_PAGES: "manage-pages",

	// Jobs
	VIEW_JOBS: "view-jobs",
	MANAGE_JOBS: "manage-jobs",

	// Adverts
	VIEW_ADVERTS: "view-adverts",
	MANAGE_ADVERTS: "manage-adverts",

	// KYC
	VIEW_KYC: "view-kyc",
	MANAGE_KYC: "manage-kyc",

	// Referrals
	VIEW_REFERRALS: "view-referrals",
	MANAGE_REFERRALS: "manage-referrals",
} as const;

/**
 * Human-readable descriptions for each permission.
 * This is the single source of truth — update descriptions here.
 * To apply changes to the database, write a migration that reads these values.
 */
export const PERMISSION_DESCRIPTIONS: Record<string, string> = {
	// Profile
	"update-profile": "Can update their own admin profile details",
	"update-password": "Can change their own admin account password",

	// Sub Admin
	"view-subadmin": "Can view the list of sub-admins",
	"create-subadmin": "Can create new sub-admin accounts",
	"update-subadmin": "Can edit existing sub-admin account details",
	"delete-subadmin": "Can permanently delete a sub-admin account",
	"activateanddeactivate-subadmin": "Can activate or deactivate a sub-admin account",
	"resendlogindetails-subadmin": "Can resend login credentials to a sub-admin",

	// Roles
	"view-role": "Can view all roles and their details",
	"create-role": "Can create new roles",
	"update-role": "Can edit existing role names and details",
	"view-role-permissions": "Can view permissions assigned to a role",
	"assign-role-permissions": "Can assign permissions to a role",
	"delete-role-permissions": "Can remove permissions from a role",

	// Permissions
	"view-permission": "Can view the full list of system permissions",

	// Users
	"view-customers": "Can view all customer accounts",
	"manage-customers": "Can edit, suspend, or manage customer accounts",
	"view-vendors": "Can view all vendor accounts",

	// Products
	"view-products": "Can view all products on the platform",
	"manage-products": "Can create, edit, publish, or delete products",

	// Services
	"view-services": "Can view all services listed on the platform",
	"manage-services": "Can create, edit, publish, or delete services",

	// Stores
	"view-stores": "Can view all vendor stores",
	"manage-stores": "Can create, edit, or delete stores",

	// Orders
	"view-orders": "Can view all customer orders",
	"manage-orders": "Can update order statuses and manage order details",

	// Transactions
	"view-transactions": "Can view all payment transactions on the platform",

	// Withdrawals
	"view-withdrawals": "Can view all vendor withdrawal requests",
	"manage-withdrawals": "Can approve or reject vendor withdrawal requests",

	// Pages
	"view-pages": "Can view CMS pages including FAQs, banners, and testimonials",
	"manage-pages": "Can create, edit, or delete CMS pages",

	// Jobs
	"view-jobs": "Can view all job listings",
	"manage-jobs": "Can create, edit, or delete job listings",

	// Adverts
	"view-adverts": "Can view all adverts on the platform",
	"manage-adverts": "Can create, edit, approve, or delete adverts",

	// KYC
	"view-kyc": "Can view vendor KYC submissions",
	"manage-kyc": "Can approve or reject vendor KYC submissions",

	// Referrals
	"view-referrals":
		"Can view referral programmes, agents, referrals, and reports",
	"manage-referrals":
		"Can configure and manage referral programmes and operations",
};
