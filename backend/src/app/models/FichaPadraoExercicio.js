import Sequelize, { Model } from 'sequelize';

class FichaPadraoExercicio extends Model {
  static init(sequelize) {
    super.init(
      {
        obs_execucao: Sequelize.STRING,
      },
      { sequelize, tableName: 'ficha_padrao_exercicio' }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Treino, {
      foreignKey: 'treino_id',
    });

    this.belongsTo(models.FichaPadrao, {
      foreignKey: 'ficha_padrao_id',
      as: 'fichaPadrao',
    });

    this.belongsTo(models.Exercicio, {
      foreignKey: 'exercicio_id',
    });
  }
}

export default FichaPadraoExercicio;
