import { Router } from 'express';
import TreinoController from './app/controllers/TreinoController';
import GrupoController from './app/controllers/GrupoController';
import EquipamentoController from './app/controllers/EquipamentoController';
import PatologiaController from './app/controllers/PatologiaController';
import ModalidadeController from './app/controllers/ModalidadeController';
import ExercicioController from './app/controllers/ExercicioController';
import UsuarioController from './app/controllers/UsuarioController';
import SessionController from './app/controllers/SessionController';

const routes = new Router();

// routes.post('/session', SessionController.store);

routes.get('/usuario', UsuarioController.index);
routes.post('/usuario', UsuarioController.store);

routes.get('/grupo', GrupoController.index);
routes.post('/grupo', GrupoController.store);

routes.get('/treino', TreinoController.index);
routes.post('/treino', TreinoController.store);

routes.get('/equipamento', EquipamentoController.index);
routes.post('/equipamento', EquipamentoController.store);

routes.get('/patologia', PatologiaController.index);
routes.post('/patologia', PatologiaController.store);

routes.get('/modalidade', ModalidadeController.index);
routes.post('/modalidade', ModalidadeController.store);

routes.get('/exercicio', ExercicioController.index);
routes.post('/exercicio', ExercicioController.store);

export default routes;
