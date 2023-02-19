'use strict';

// comando para executar todas seed add = yarn sequelize db:seed:all
// desfazer todas = yarn sequelize db:seed:undo:all

module.exports = {
  up: (queryInterface, Sequelize) => {
    let dataC = new Date();
    return queryInterface.bulkInsert(
      'grupo',
      [
        { descricao: 'Peito', created_at: dataC, updated_at: dataC },
        { descricao: 'Costas', created_at: dataC, updated_at: dataC },
        { descricao: 'Bíceps', created_at: dataC, updated_at: dataC },
        { descricao: 'Tríceps', created_at: dataC, updated_at: dataC },
        { descricao: 'Perna', created_at: dataC, updated_at: dataC },
        { descricao: 'Ombro', created_at: dataC, updated_at: dataC },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('grupo', null, {});
  },
};
