import Sequelize from 'sequelize';
import databaseconfig from '../config/database';
import Perfil from '../app/models/Perfil';
import Usuario from '../app/models/Usuario';
import Grupo from '../app/models/Grupo';
import File from '../app/models/File';
import Patologia from '../app/models/Patologia';
import Equipamento from '../app/models/Equipamento';
import Modalidade from '../app/models/Modalidade';
import Treino from '../app/models/Treino';
import Exercicio from '../app/models/Exercicio';
import FichaPadrao from '../app/models/FichaPadrao';
import FichaPadraoExercicio from '../app/models/FichaPadraoExercicio';

const models = [
  File,
  Perfil,
  Usuario,
  Patologia,
  Grupo,
  Modalidade,
  Treino,
  FichaPadrao,
  Equipamento,
  Exercicio,
  FichaPadraoExercicio,
];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseconfig);
    models.map((model) => model.init(this.connection));
    models.map(
      (model) => model.associate && model.associate(this.connection.models)
    );
  }
}

export default new Database();
