'use strict';

const schema = 'catalog';
const timestamps = (Sequelize) => ({
  createdAt: { type: Sequelize.DATE, allowNull: false },
  updatedAt: { type: Sequelize.DATE, allowNull: false },
});

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.STRING, allowNull: false },
      ...timestamps(Sequelize),
    }, { schema });

    await queryInterface.createTable('products', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      name: { type: Sequelize.STRING, allowNull: false },
      price: { type: Sequelize.FLOAT, allowNull: false },
      images: { type: Sequelize.ARRAY(Sequelize.STRING), allowNull: false },
      discount: { type: Sequelize.FLOAT, allowNull: false },
      quantity: { type: Sequelize.INTEGER, allowNull: false },
      sellerId: { type: Sequelize.UUID, allowNull: false },
      categoryId: { type: Sequelize.UUID, allowNull: false },
      expiryDate: { type: Sequelize.DATE, allowNull: false },
      isAvailable: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      ...timestamps(Sequelize),
    }, { schema });

    await queryInterface.createTable('reviews', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      userId: { type: Sequelize.UUID, allowNull: false },
      productId: { type: Sequelize.UUID, allowNull: false },
      feedBack: { type: Sequelize.STRING, allowNull: false },
      ratings: { type: Sequelize.FLOAT, allowNull: false },
      ...timestamps(Sequelize),
    }, { schema });

    await queryInterface.createTable('wishes', {
      id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
      userId: { type: Sequelize.UUID, allowNull: false },
      productId: { type: Sequelize.UUID, allowNull: false },
      ...timestamps(Sequelize),
    }, { schema });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('wishes', { schema });
    await queryInterface.dropTable('reviews', { schema });
    await queryInterface.dropTable('products', { schema });
    await queryInterface.dropTable('categories', { schema });
  },
};
