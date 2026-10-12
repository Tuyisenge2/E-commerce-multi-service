'use strict';

const schema = 'payments';
const timestamps = (Sequelize) => ({
  createdAt: { type: Sequelize.DATE, allowNull: false },
  updatedAt: { type: Sequelize.DATE, allowNull: false },
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('payments', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      payerId: { type: Sequelize.UUID, allowNull: false },
      paymentMethod: { type: Sequelize.STRING, allowNull: false },
      paymentId: { type: Sequelize.STRING, allowNull: false },
      sessionId: { type: Sequelize.STRING, allowNull: true },
      orderId: { type: Sequelize.STRING, allowNull: true },
      status: { type: Sequelize.STRING, allowNull: false, defaultValue: 'SUCCESSFUL' },
      phoneNumber: { type: Sequelize.STRING, allowNull: true },
      ...timestamps(Sequelize),
    }, { schema });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('payments', { schema });
  },
};
