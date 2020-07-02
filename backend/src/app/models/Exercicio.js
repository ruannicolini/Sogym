import Sequelize, { Model } from 'sequelize';

class Exercicio extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING, modo_execucao: Sequelize.STRING },
      { sequelize, tableName: 'exercicio' }
    );
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Modalidade, {
      foreignKey: 'modalidade_id',
      as: 'modalidade',
    });

    this.belongsTo(models.Grupo, {
      foreignKey: 'grupoExercicio_id',
      as: 'grupo',
    });

    this.belongsToMany(models.Equipamento, {
      through: 'equipamento_exercicio',
      as: 'Equipamentos',
    });

    this.belongsToMany(models.FichaPadrao, {
      through: models.FichaPadraoExercicio,
      as: 'fichasPadrao',
    });
  }
}

export default Exercicio;
