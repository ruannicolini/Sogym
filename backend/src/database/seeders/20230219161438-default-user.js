'use strict';

// comando para executar todas seed add = yarn sequelize db:seed:all
// desfazer todas = yarn sequelize db:seed:undo:all

module.exports = {
  up: (queryInterface, Sequelize) => {
    let dataC = new Date();
    return queryInterface.bulkInsert(
      'usuario',
      [
        { email: 'sogym@sogym.com', nome: 'sogyn', password_hash: '$2a$08$ZBhWt6gNkfGB0reL6aE2EOW0BR1.qxfPDQzYrA9cPeFWtmARnsu1S', telefone: '123', created_at: dataC, updated_at: dataC, perfil_id: 1 }
      ],
      {}
    );
  }
};
