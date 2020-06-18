'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('usuario', 'perfil_id', {
      type: Sequelize.INTEGER,
      references: { model: 'perfil', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn('usuario', 'perfil_id');
  },
};
