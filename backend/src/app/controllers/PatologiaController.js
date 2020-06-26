import * as Yup from 'yup';
import Patologia from '../models/Patologia';

class PatologiaController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const patologias = await Patologia.findAll({
      order: ['descricao'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(patologias);
  }

  async store(req, res) {
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const patologiaEncontrada = await Patologia.findOne({
      where: { descricao: req.body.descricao },
    });

    if (patologiaEncontrada) {
      return res.status(400).json({ error: 'Patologia already exists.' });
    }

    const { descricao } = await Patologia.create(req.body);
    return res.json({ descricao });
  }

  async update(req, res) {}

  async delete(req, res) {}
}
export default new PatologiaController();
