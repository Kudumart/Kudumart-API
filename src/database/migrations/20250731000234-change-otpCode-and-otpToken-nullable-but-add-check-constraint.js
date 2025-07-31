"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
		await queryInterface.changeColumn("otps", "otpCode", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		await queryInterface.changeColumn("otps", "otpToken", {
			type: Sequelize.STRING,
			allowNull: true,
		});
		await queryInterface.changeColumn("otps", "expiresAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});
		await queryInterface.changeColumn("otps", "otpTokenExpiresAt", {
			type: Sequelize.DATE,
			allowNull: true,
		});

		await queryInterface.sequelize.query(`
    ALTER TABLE otps 
    ADD CONSTRAINT check_otp_fields_not_both_null 
    CHECK (
        otpCode IS NOT NULL OR otpToken IS NOT NULL
    )
`);

		await queryInterface.sequelize.query(`
    ALTER TABLE otps 
    ADD CONSTRAINT check_expires_fields_not_both_null 
    CHECK (
        expiresAt IS NOT NULL OR otpTokenExpiresAt IS NOT NULL
    )
`);
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.changeColumn("otps", "otpCode", {
			type: Sequelize.STRING,
			allowNull: false,
		});
		await queryInterface.changeColumn("otps", "otpToken", {
			type: Sequelize.STRING,
			allowNull: false,
		});
		await queryInterface.sequelize.query(`
            ALTER TABLE otps 
            DROP CONSTRAINT check_otp_fields_not_both_null
        `);
		await queryInterface.sequelize.query(`
            ALTER TABLE otps 
            DROP CONSTRAINT check_expires_fields_not_both_null
        `);
	},
};
