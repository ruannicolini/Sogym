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
    });
  }
}

export default Patologia;
