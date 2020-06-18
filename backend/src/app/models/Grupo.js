import Sequelize, { Model } from 'sequelize';

class Grupo extends Model {
  static init(sequelize) {
    super.init({ descricao: Sequelize.STRING }, { sequelize });
    return this;
  }
}

export default Grupo;
