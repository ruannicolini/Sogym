import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';
import TreinoController from './app/controllers/TreinoController';
import GrupoController from './app/controllers/GrupoController';
import EquipamentoController from './app/controllers/EquipamentoController';
import PatologiaController from './app/controllers/PatologiaController';
import ModalidadeController from './app/controllers/ModalidadeController';
import ExercicioController from './app/controllers/ExercicioController';
import UsuarioController from './app/controllers/UsuarioController';
import ProfessorController from './app/controllers/ProfessorController';
import AlunoController from './app/controllers/AlunoController';
import FileController from './app/controllers/FileController';
import FichaPadraoController from './app/controllers/FichaPadraoController';
import FichaAlunoController from './app/controllers/FichaAlunoController';
import SessionController from './app/controllers/SessionController';
import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/session', SessionController.store);
routes.post('/validateToken', SessionController.validateToken);
routes.get('/session', SessionController.getUsuario);

routes.use(authMiddlewares);

routes.get('/usuario', UsuarioController.index);
routes.get('/usuario', UsuarioController.index);
routes.post('/usuario', UsuarioController.store);
routes.put('/usuario/:id', UsuarioController.update);
routes.delete('/usuario/:id', UsuarioController.delete);

routes.get('/aluno', AlunoController.index);
routes.post('/aluno', AlunoController.store);
routes.put('/aluno/:id', AlunoController.update);
routes.delete('/aluno/:id', AlunoController.delete);

routes.get('/professor', ProfessorController.index);
routes.post('/professor', ProfessorController.store);
routes.put('/professor/:id', ProfessorController.update);
routes.delete('/professor/:id', ProfessorController.delete);

routes.post('/file', upload.single('file'), FileController.store);

routes.get('/equipamento', EquipamentoController.index);
routes.post('/equipamento', EquipamentoController.store);
routes.put('/equipamento/:id', EquipamentoController.update);
routes.delete('/equipamento/:id', EquipamentoController.delete);

routes.get('/patologia', PatologiaController.index);
routes.post('/patologia', PatologiaController.store);
routes.put('/patologia/:id', PatologiaController.update);
routes.delete('/patologia/:id', PatologiaController.delete);

routes.get('/grupo', GrupoController.index);
routes.post('/grupo', GrupoController.store);
routes.put('/grupo/:id', GrupoController.update);
routes.delete('/grupo/:id', GrupoController.delete);

routes.get('/treino', TreinoController.index);
routes.post('/treino', TreinoController.store);
routes.put('/treino/:id', TreinoController.update);
routes.delete('/treino/:id', TreinoController.delete);

routes.get('/exercicio', ExercicioController.index);
routes.post('/exercicio', ExercicioController.store);
routes.put('/exercicio/:id', ExercicioController.update);
routes.delete('/exercicio/:id', ExercicioController.delete);

routes.get('/modalidade', ModalidadeController.index);
routes.post('/modalidade', ModalidadeController.store);
routes.put('/modalidade/:id', ModalidadeController.update);
routes.delete('/modalidade/:id', ModalidadeController.delete);

routes.get('/ficha_padrao', FichaPadraoController.index);
routes.post('/ficha_padrao', FichaPadraoController.store);
routes.put('/ficha_padrao/:id', FichaPadraoController.update);
routes.delete('/ficha_padrao/:id', FichaPadraoController.delete);

routes.get('/ficha_aluno/:id', FichaAlunoController.index);
routes.post('/ficha_aluno', FichaAlunoController.store);
routes.put('/ficha_aluno/:id', FichaAlunoController.update);
routes.delete('/ficha_aluno/:id', FichaAlunoController.delete);

export default routes;
