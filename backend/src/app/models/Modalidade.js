import Sequelize, { Model } from 'sequelize';

class Modalidade extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING, valor: Sequelize.DOUBLE },
      { sequelize, tableName: 'modalidade' }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Usuario, {
      through: 'professor_modalidade',
      as: 'professores',
    });
  }
}

export default Modalidade;
