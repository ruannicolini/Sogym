'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'ficha_padrao_exercicio',
      'ficha_padrao_id',
      {
        type: Sequelize.INTEGER,
        references: { model: 'ficha_padrao', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: true,
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'ficha_padrao_exercicio',
      'ficha_padrao_id'
    );
  },
};
