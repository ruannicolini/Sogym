import Sequelize, { Model } from 'sequelize';

class Patologia extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING },
      { sequelize, tableName: 'patologia' }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Usuario, {
      through: 'usuario_pat',
      as: 'incidentes',
      // OBS = Houve problemas com a nomeclatura utilizada pelo sequelize em seus join internos de associação, por isso especifiquei otherKey e foreignKey nas 2 tabelas
      otherKey: {
        name: 'usuario_id',
        allowNull: false,
      },
      foreignKey: {
        name: 'patologia_id',
        allowNull: false,
      },
    });
  }
}

export default Patologia;
