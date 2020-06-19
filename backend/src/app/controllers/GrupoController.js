import * as Yup from 'yup';
import Grupo from '../models/Grupo';

class GrupoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const grupos = await Grupo.findAll({
      order: ['descricao'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(grupos);
  }

  async store(req, res) {
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const grupoEncontrado = await Grupo.findOne({
      where: { descricao: req.body.descricao },
    });

    if (grupoEncontrado) {
      return res.status(400).json({ error: 'Grupo already exists.' });
    }

    const { descricao } = await Grupo.create(req.body);
    return res.json({ descricao });
  }
}
export default new GrupoController();
