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

	// Permissions
	VIEW_PERMISSION: "view-permission",
	CREATE_PERMISSION: "create-permission",
	UPDATE_PERMISSION: "update-permission",
	DELETE_PERMISSION: "delete-permission",

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
} as const;
