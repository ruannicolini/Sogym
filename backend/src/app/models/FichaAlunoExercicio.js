import Sequelize, { Model } from 'sequelize';

class FichaAlunoExercicio extends Model {
  static init(sequelize) {
    super.init(
      {
        obs_execucao: Sequelize.STRING,
      },
      { sequelize, tableName: 'ficha_aluno_exercicio' }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Treino, {
      foreignKey: 'treino_id',
    });
    this.belongsTo(models.FichaAluno, {
      foreignKey: 'ficha_aluno_id',
      as: 'fichaAluno',
    });
    this.belongsTo(models.Exercicio, {
      foreignKey: 'exercicio_id',
    });
  }
}

export default FichaAlunoExercicio;
