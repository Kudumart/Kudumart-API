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
		await queryInterface.createTable("dropshipping_creds", {
			id: {
				type: Sequelize.STRING,
				allowNull: false,
				primaryKey: true,
				defaultValue: Sequelize.UUIDV4,
			},
			accessToken: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			expiresIn: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			expireTime: {
				type: Sequelize.BIGINT,
				allowNull: true,
			},
			refreshToken: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			refreshExpiresIn: {
				type: Sequelize.INTEGER,
				allowNull: true,
			},
			refreshTokenValidTime: {
				type: Sequelize.BIGINT,
				allowNull: true,
			},
			userNick: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			locale: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			accountId: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			vendorId: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			account: {
				type: Sequelize.STRING,
				allowNull: false,
			}, // The user valid aliexpress email account
			accountPlatform: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			sellerId: {
				type: Sequelize.STRING,
				allowNull: true,
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
				defaultValue: Sequelize.NOW,
			},
		});
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
		await queryInterface.dropTable("dropshipping_creds");
	},
};
