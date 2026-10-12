'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'tokens',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        token: {
          type: Sequelize.STRING(10000),
          allowNull: false,
          unique: true,
        },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { schema: 'users' },
    );

    await queryInterface.createTable(
      'blacklisted_tokens',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        token: { type: Sequelize.STRING, allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { schema: 'users' },
    );

    await queryInterface.createTable(
      'resetPassword_tokens',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        email: { type: Sequelize.STRING, allowNull: false },
        resetToken: { type: Sequelize.STRING(1000), allowNull: false },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { schema: 'users' },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('resetPassword_tokens', { schema: 'users' });
    await queryInterface.dropTable('blacklisted_tokens', { schema: 'users' });
    await queryInterface.dropTable('tokens', { schema: 'users' });
  },
};
