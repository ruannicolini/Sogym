import * as Yup from 'yup';
import Equipamento from '../models/Equipamento';
import Exercicio from '../models/Exercicio';

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
      return res.status(400).json({ error: 'Equipamento já existe.' });
    }

    const { descricao } = await Equipamento.create(req.body);
    return res.json({ descricao });
  }

  async update(req, res) {
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { descricao } = req.body;

    const equipamento = await Equipamento.findByPk(req.params.id);
    if (!equipamento) {
      return res.status(400).json({ error: 'Equipamento não encontrado.' });
    }

    if (!(descricao === equipamento.descricao)) {
      const equipamentoExists = await Equipamento.findOne({
        where: { descricao },
      });

      if (equipamentoExists) {
        return res.status(400).json({
          error: 'Já existe um equipamento com a descrição informada.',
        });
      }
    }

    await equipamento.update(req.body);
    return res.json({ descricao });
  }

  async delete(req, res) {
    if (!req.params.id) {
      res.status(400).json('parametro id Equipamento não recebido');
    }

    const equipamento = await Equipamento.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Exercicio,
          as: 'exercicios',
          through: { attributes: [] },
        },
      ],
    });

    if (!equipamento) {
      res.status(400).json('Equipamento não encontrado');
    }

    if (equipamento.exercicios.length) {
      res.status(400).json('Equipamento possui exercícios vinculados');
    }

    await equipamento.destroy();

    return res.send();
  }
}
export default new EquipamentoController();
