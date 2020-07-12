import * as Yup from 'yup';
import Treino from '../models/Treino';
import FichaPadraoExercicio from '../models/FichaPadraoExercicio';

class TreinoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const treinos = await Treino.findAll({
      order: ['descricao'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(treinos);
  }

  async store(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
    });

    const { descricao } = req.body;

    try {
      const vb = await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      err.inner.forEach((e) => {
        validacao.error.push({
          name: e.path,
          message: e.message,
        });
      });
    }

    if (descricao) {
      const treinoEncontrado = await Treino.findOne({
        where: { descricao },
      });

      if (treinoEncontrado) {
        validacao.error.push({
          name: 'descricao',
          message: 'Já existe um treino com a descrição informada.',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    return res.json(await Treino.create(req.body));
  }

  async update(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
    });

    const { descricao } = req.body;

    try {
      const vb = await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      err.inner.forEach((e) => {
        validacao.error.push({
          name: e.path,
          message: e.message,
        });
      });
    }

    const treino = await Treino.findByPk(req.params.id);
    if (!treino) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Treino não encontrado.',
      });
    } else {
      if (descricao) {
        if (!(descricao === treino.descricao)) {
          const treinoExists = await Treino.findOne({
            where: { descricao },
          });

          if (treinoExists) {
            validacao.error.push({
              name: 'descricao',
              message: 'Já existe um treino com a descrição informada.',
            });
          }
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    return res.json(await treino.update(req.body));
  }

  async delete(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const treino = await Treino.findOne({
      where: { id: req.params.id },
    });

    if (!treino) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Treino não encontrado',
      });
    } else {
      const qtdFp = await FichaPadraoExercicio.count({
        where: { treino_id: req.params.id },
      });

      if (qtdFp > 0) {
        validacao.error.push({
          name: 'param /:id',
          message:
            'Treino já associado a ficha de exercícios. Não é possível excluir!',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    await treino.destroy();

    return res.send();
  }
}
export default new TreinoController();
