import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class Usuario extends Model {
  static init(sequelize) {
    super.init(
      {
        nome: Sequelize.STRING,
        telefone: Sequelize.STRING,
        email: Sequelize.STRING,
        perfil_id: Sequelize.INTEGER,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
      },
      { sequelize, tableName: 'usuario' }
    );

    this.addHook('beforeSave', async (user) => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  static associate(models) {
    this.belongsToMany(models.Patologia, {
      through: 'usuario_pat',
      as: 'patologias',
      // OBS = Houve problemas com a nomeclatura utilizada pelo sequelize em seus join internos de associação, por isso especifiquei otherKey e foreignKey nas 2 tabelas
      otherKey: {
        name: 'patologia_id',
        allowNull: false,
      },
      foreignKey: {
        name: 'usuario_id',
        allowNull: false,
      },
    });

    this.belongsToMany(models.Modalidade, {
      through: 'professor_modalidade',
      as: 'modalidades',
    });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default Usuario;
