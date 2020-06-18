import Sequelize, { Model } from 'sequelize';

class Patologia extends Model {
  static init(sequelize) {
    super.init({ descricao: Sequelize.STRING }, { sequelize });
    return this;
  }
}

export default Patologia;
