import Sequelize, { Model } from 'sequelize';

class Perfil extends Model {
  static init(sequelize) {
    super.init(
      { descricao: Sequelize.STRING },
      { sequelize, tableName: 'perfil' }
    );
    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Usuario, {
      through: 'usuario_perfil',
      as: 'usuarios',
      otherKey: {
        name: 'usuario_id',
        allowNull: false,
      },
      foreignKey: {
        name: 'perfil_id',
        allowNull: false,
      },
    });
  }
}

export default Perfil;
