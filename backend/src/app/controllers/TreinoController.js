import * as Yup from 'yup';
import Treino from '../models/Treino';

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
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const treinoEncontrado = await Treino.findOne({
      where: { descricao: req.body.descricao },
    });

    if (treinoEncontrado) {
      return res.status(400).json({ error: 'Treino já existe.' });
    }

    const { descricao } = await Treino.create(req.body);

    return res.json({ descricao });
  }

  async update(req, res) {
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { descricao } = req.body;

    const treino = await Treino.findByPk(req.params.id);
    if (!treino) {
      return res.status(400).json({ error: 'Treino não encontrado.' });
    }

    if (!(descricao === treino.descricao)) {
      const treinoExists = await Treino.findOne({
        where: { descricao },
      });

      if (treinoExists) {
        return res.status(400).json({
          error: 'Já existe um treino com a descrição informada.',
        });
      }
    }

    await treino.update(req.body);
    return res.json({ descricao });
  }

  async delete(req, res) {
    if (!req.params.id) {
      res.status(400).json('Parametro id treino não recebido');
    }

    const treino = await Treino.findOne({
      where: { id: req.params.id },
    });

    if (!treino) {
      res.status(400).json('Treino não encontrado');
    }

    await treino.destroy();

    return res.send();
  }
}
export default new TreinoController();
