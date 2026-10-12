'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'roles',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        roleName: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      },
      { schema: 'users' },
    );

    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        userName: { type: Sequelize.STRING, allowNull: false },
        firstName: { type: Sequelize.STRING, allowNull: false },
        lastName: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        confirmPassword: { type: Sequelize.STRING, allowNull: false },
        role: {
          type: Sequelize.UUID,
          allowNull: false,
          references: { model: { tableName: 'roles', schema: 'users' }, key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
        },
        isVerified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        isPasswordExpired: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        lastTimePasswordUpdated: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        isActive: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        gender: { type: Sequelize.STRING, allowNull: true },
        birthDate: { type: Sequelize.DATE, allowNull: true },
        phoneNumber: { type: Sequelize.STRING, allowNull: true },
        preferredLanguage: { type: Sequelize.STRING, allowNull: true },
        preferredCurrency: { type: Sequelize.STRING, allowNull: true },
        profileImage: { type: Sequelize.STRING, allowNull: true },
        addressLine1: { type: Sequelize.STRING, allowNull: true },
        addressLine2: { type: Sequelize.STRING, allowNull: true },
        country: { type: Sequelize.STRING, allowNull: true },
        city: { type: Sequelize.STRING, allowNull: true },
        zipCode: { type: Sequelize.INTEGER, allowNull: true },
        createdAt: { type: Sequelize.DATE, allowNull: false },
        updatedAt: { type: Sequelize.DATE, allowNull: false },
      },
      { schema: 'users' },
    );
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users', { schema: 'users' });
    await queryInterface.dropTable('roles', { schema: 'users' });
  },
};
