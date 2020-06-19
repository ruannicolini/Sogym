import * as Yup from 'yup';
import Equipamento from '../models/Equipamento';

class EquipamentoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const equipamentos = await Equipamento.findAll({
      order: ['descricao'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(equipamentos);
  }

  async store(req, res) {
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const equipamentoEncontrado = await Equipamento.findOne({
      where: { descricao: req.body.descricao },
    });

    if (equipamentoEncontrado) {
      return res.status(400).json({ error: 'Equipamento already exists.' });
    }

    const { descricao } = await Equipamento.create(req.body);
    return res.json({ descricao });
  }
}
export default new EquipamentoController();
