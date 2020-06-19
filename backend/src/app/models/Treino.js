import Sequelize, { Model } from 'sequelize';

class Treino extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING },
      { sequelize, freezeTableName: true }
    );
    return this;
  }
}

export default Treino;
