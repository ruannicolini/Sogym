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
      return res.status(400).json({ error: 'Treino already exists.' });
    }

    const { descricao } = await Treino.create(req.body);

    return res.json({ descricao });
  }

  async update(req, res) {}

  async delete(req, res) {}
}
export default new TreinoController();
