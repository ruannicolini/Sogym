import Sequelize, { Model } from 'sequelize';

class Treino extends Model {
  static init(sequelize) {
    super.init({ descricao: Sequelize.STRING }, { sequelize });
    return this;
  }
}

export default Treino;
