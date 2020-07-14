import Sequelize, { Model } from 'sequelize';

class FichaAluno extends Model {
  static init(sequelize) {
    super.init({}, { sequelize, tableName: 'ficha_aluno' });
    return this;
  }

  static associate(models) {
    this.hasMany(models.FichaAlunoExercicio, { as: 'ficha' });
    this.belongsToMany(models.Exercicio, {
      through: models.FichaAlunoExercicio,
      as: 'exercicios',
    });
    this.belongsTo(models.Modalidade, {
      foreignKey: 'modalidade_id',
      as: 'modalidade',
    });
    this.belongsTo(models.Usuario, {
      foreignKey: 'aluno_id',
      as: 'aluno',
    });
    this.belongsTo(models.Usuario, {
      foreignKey: 'professor_id',
      as: 'professor',
    });
  }
}

export default FichaAluno;
