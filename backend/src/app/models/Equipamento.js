import Sequelize, { Model } from 'sequelize';

class Equipamento extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING },
      { sequelize, tableName: 'equipamento' }
    );
    return this;
  }
}

export default Equipamento;
