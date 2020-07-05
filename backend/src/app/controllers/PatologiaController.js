import * as Yup from 'yup';
import Patologia from '../models/Patologia';
import Usuario from '../models/Usuario';

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
      return res.status(400).json({ error: 'Patologia já existe.' });
    }

    const { descricao } = await Patologia.create(req.body);
    return res.json({ descricao });
  }

  async update(req, res) {
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { descricao } = req.body;

    const patologia = await Patologia.findByPk(req.params.id);
    if (!patologia) {
      return res.status(400).json({ error: 'Patologia não encontrada.' });
    }

    if (!(descricao === patologia.descricao)) {
      const patologiaExists = await Patologia.findOne({
        where: { descricao },
      });

      if (patologiaExists) {
        return res.status(400).json({
          error: 'Já existe uma patologia com a descrição informada.',
        });
      }
    }

    await patologia.update(req.body);
    return res.json({ descricao });
  }

  async delete(req, res) {
    const patologia = await Patologia.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Usuario,
          as: 'incidentes',
          through: { attributes: [] },
        },
      ],
    });

    if (!patologia) {
      res.status(400).json('Patologia não encontrada');
    }

    if (patologia.incidentes.length) {
      res.status(400).json('Patologia esta associada a usuários');
    }

    await patologia.destroy();

    return res.send();
  }
}
export default new PatologiaController();
