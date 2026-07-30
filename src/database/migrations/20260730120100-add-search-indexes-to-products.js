'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addIndex("products", ["status", "views"], {
			name: "products_status_views_idx",
		});
		await queryInterface.addIndex("products", ["name"], {
			name: "products_name_idx",
		});
		await queryInterface.addIndex("sub_categories", ["name"], {
			name: "sub_categories_name_idx",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeIndex("products", "products_status_views_idx");
		await queryInterface.removeIndex("products", "products_name_idx");
		await queryInterface.removeIndex("sub_categories", "sub_categories_name_idx");
	},
};
