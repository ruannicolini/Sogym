import Sequelize, { Model } from 'sequelize';

class Modalidade extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING, valor: Sequelize.DOUBLE },
      { sequelize }
    );
    return this;
  }
}

export default Modalidade;
