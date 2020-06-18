import { Router } from 'express';
import TreinoController from './app/controllers/TreinoController';
import PatologiaController from './app/controllers/PatologiaController';

const routes = new Router();

routes.get('/', (req, res) => {
  return res.json({ mensagem: 'ok ok ok!' });
});

routes.get('/treino', TreinoController.index);
routes.post('/treino', TreinoController.store);

routes.get('/patologia', PatologiaController.index);
routes.post('/patologia', PatologiaController.store);

export default routes;
