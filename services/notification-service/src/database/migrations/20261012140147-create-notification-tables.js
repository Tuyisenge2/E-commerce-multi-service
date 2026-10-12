'use strict';

const schema = 'notifications';
const timestamps = (Sequelize) => ({
  createdAt: { type: Sequelize.DATE, allowNull: false },
  updatedAt: { type: Sequelize.DATE, allowNull: false },
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('notifications', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      message: { type: Sequelize.STRING, allowNull: false },
      unread: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      userId: { type: Sequelize.UUID, allowNull: false },
      ...timestamps(Sequelize),
    }, { schema });

    await queryInterface.createTable('messages', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      senderId: { type: Sequelize.UUID, allowNull: false },
      message: { type: Sequelize.STRING, allowNull: false },
      ...timestamps(Sequelize),
    }, { schema });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('messages', { schema });
    await queryInterface.dropTable('notifications', { schema });
  },
};
