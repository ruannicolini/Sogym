'use strict';

// comando para executar todas seed add = yarn sequelize db:seed:all
// desfazer todas = yarn sequelize db:seed:undo:all

module.exports = {
  up: (queryInterface, Sequelize) => {
    let dataC = new Date();
    return queryInterface.bulkInsert(
      'perfil',
      [
        { descricao: 'Admin', created_at: dataC, updated_at: dataC },
        { descricao: 'Professor', created_at: dataC, updated_at: dataC },
        { descricao: 'Aluno', created_at: dataC, updated_at: dataC },
      ],
      {}
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('perfil', null, {});
  },
};
