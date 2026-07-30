'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		await queryInterface.addIndex("products", ["categoryId", "status"], {
			name: "products_category_id_status_idx",
		});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.removeIndex("products", "products_category_id_status_idx");
	},
};
