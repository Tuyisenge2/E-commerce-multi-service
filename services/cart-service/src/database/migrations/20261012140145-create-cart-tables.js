'use strict';

const schema = 'cart';
const timestamps = (Sequelize) => ({
  createdAt: { type: Sequelize.DATE, allowNull: false },
  updatedAt: { type: Sequelize.DATE, allowNull: false },
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('carts', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      userId: { type: Sequelize.UUID, allowNull: false },
      products: { type: Sequelize.ARRAY(Sequelize.JSONB), allowNull: true },
      total: { type: Sequelize.FLOAT, allowNull: true },
      ...timestamps(Sequelize),
    }, { schema });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('carts', { schema });
  },
};
