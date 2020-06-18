import Sequelize, { Model } from 'sequelize';

// modalidade, grupoExercicio, Equipamento

class Exercicio extends Model {
  static init(sequelize) {
    super.init({ descricao: Sequelize.STRING }, { sequelize });
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

    this.belongsTo(models.Equipamento, {
      foreignKey: 'equipamento_id',
      as: 'equipamento',
    });
  }
}

export default Exercicio;
