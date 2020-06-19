import { Router } from 'express';
import TreinoController from './app/controllers/TreinoController';
import GrupoController from './app/controllers/GrupoController';
import EquipamentoController from './app/controllers/EquipamentoController';
import PatologiaController from './app/controllers/PatologiaController';
import ModalidadeController from './app/controllers/ModalidadeController';

const routes = new Router();

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

export default routes;
