'use strict';

// comando para executar todas seed add = yarn sequelize db:seed:all
// desfazer todas = yarn sequelize db:seed:undo:all

module.exports = {
  up: (queryInterface, Sequelize) => {
    let dataC = new Date();
    return queryInterface.bulkInsert(
      'modalidade',
      [
        { descricao: 'Musculaçao', valor: 50, created_at: dataC, updated_at: dataC },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('modalidade', null, {});
  },
};
