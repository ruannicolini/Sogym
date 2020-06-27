import Sequelize, { Model } from 'sequelize';

class Equipamento extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING },
      { sequelize, tableName: 'equipamento' }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'file_id', as: 'file' });
    this.belongsToMany(models.Exercicio, {
      through: 'equipamento_exercicio',
      as: 'exercicios',
    });
  }
}

export default Equipamento;
