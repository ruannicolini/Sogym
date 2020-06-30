import Sequelize, { Model } from 'sequelize';

class FichaPadrao extends Model {
  static init(sequelize) {
    super.init(
      {
        descricao: Sequelize.STRING,
        ativo: Sequelize.STRING,
      },
      { sequelize, tableName: 'ficha_padrao' }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Exercicio, {
      through: 'ficha_padrao_exercicio',
      as: 'exercicios',
    });

    this.belongsTo(models.Modalidade, {
      foreignKey: 'modalidade_id',
      as: 'modalidade',
    });

    this.belongsTo(models.Usuario, {
      foreignKey: 'professor_id',
      as: 'professor',
    });
  }
}

export default FichaPadrao;
