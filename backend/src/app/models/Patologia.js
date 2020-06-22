import Sequelize, { Model } from 'sequelize';

class Patologia extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING },
      { sequelize, tableName: 'patologia' }
    );
    return this;
  }
}

export default Patologia;
