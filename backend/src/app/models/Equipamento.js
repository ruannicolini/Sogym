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
    this.belongsToMany(models.Exercicio, {
      through: 'equipamento_exercicio',
      as: 'exercicios',
      foreignKey: 'exercicio_id',
    });
  }
}

export default Equipamento;
