'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		// Drop foreign key constraint on installment_plans.vendorId if it exists.
		// Products can be created by Admins (admins table) or vendors (users table),
		// so vendorId cannot enforce a strict foreign key to the users table.
		try {
			await queryInterface.removeConstraint('installment_plans', 'installment_plans_ibfk_3');
		} catch (e) {
			// Ignore if constraint name differs or already removed
		}

		try {
			await queryInterface.sequelize.query(`
				SET @fk_name = (
					SELECT CONSTRAINT_NAME
					FROM information_schema.KEY_COLUMN_USAGE
					WHERE TABLE_SCHEMA = DATABASE()
						AND TABLE_NAME = 'installment_plans'
						AND COLUMN_NAME = 'vendorId'
						AND REFERENCED_TABLE_NAME IS NOT NULL
					LIMIT 1
				);
				SET @sql = IF(@fk_name IS NOT NULL, CONCAT('ALTER TABLE installment_plans DROP FOREIGN KEY ', @fk_name), 'SELECT 1');
				PREPARE stmt FROM @sql;
				EXECUTE stmt;
				DEALLOCATE PREPARE stmt;
			`);
		} catch (e) {
			// Non-fatal if raw drop fails
		}

		try {
			await queryInterface.changeColumn('installment_plans', 'vendorId', {
				type: Sequelize.UUID,
				allowNull: true,
			});
		} catch (e) {
			// Non-fatal
		}
	},

	async down(queryInterface, Sequelize) {
		// No-op rollback to avoid re-introducing constraint failure
	},
};
