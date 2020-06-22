import Sequelize, { Model } from 'sequelize';

class Treino extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING },
      { sequelize, tableName: 'treino' }
    );
    return this;
  }
}

export default Treino;
