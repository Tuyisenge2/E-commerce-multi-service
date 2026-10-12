'use strict';

const schema = 'orders';
const timestamps = (Sequelize) => ({
  createdAt: { type: Sequelize.DATE, allowNull: false },
  updatedAt: { type: Sequelize.DATE, allowNull: false },
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      buyerId: { type: Sequelize.UUID, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'canceled', 'delivered'), allowNull: false, defaultValue: 'pending' },
      ...timestamps(Sequelize),
    }, { schema });

    await queryInterface.createTable('sales', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      orderId: { type: Sequelize.UUID, allowNull: false },
      buyerId: { type: Sequelize.UUID, allowNull: false },
      productId: { type: Sequelize.UUID, allowNull: false },
      status: { type: Sequelize.ENUM('pending', 'canceled', 'delivered'), allowNull: false, defaultValue: 'pending' },
      deliveryDate: { type: Sequelize.DATE, allowNull: false },
      quantitySold: { type: Sequelize.INTEGER, allowNull: false },
      ...timestamps(Sequelize),
    }, { schema });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('sales', { schema });
    await queryInterface.dropTable('orders', { schema });
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "orders"."enum_orders_status";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "orders"."enum_sales_status";');
  },
};
