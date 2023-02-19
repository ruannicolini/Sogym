'use strict';

// comando para executar todas seed add = yarn sequelize db:seed:all
// desfazer todas = yarn sequelize db:seed:undo:all

module.exports = {
  up: (queryInterface, Sequelize) => {
    let dataC = new Date();
    return queryInterface.bulkInsert(
      'treino',
      [
        { descricao: 'A', created_at: dataC, updated_at: dataC },
        { descricao: 'B', created_at: dataC, updated_at: dataC },
        { descricao: 'C', created_at: dataC, updated_at: dataC },
        { descricao: 'D', created_at: dataC, updated_at: dataC },
        { descricao: 'E', created_at: dataC, updated_at: dataC },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('treino', null, {});
  },
};
