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
      return res.status(400).json({ error: 'Grupo já existe.' });
    }

    const { descricao } = await Grupo.create(req.body);
    return res.json({ descricao });
  }

  async update(req, res) {
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { descricao } = req.body;

    const grupo = await Grupo.findByPk(req.params.id);
    if (!grupo) {
      return res.status(400).json({ error: 'Grupo não encontrado.' });
    }

    if (!(descricao === grupo.descricao)) {
      const grupoExists = await Grupo.findOne({
        where: { descricao },
      });

      if (grupoExists) {
        return res.status(400).json({
          error: 'Já existe um grupo com a descrição informada.',
        });
      }
    }

    await grupo.update(req.body);
    return res.json({ descricao });
  }

  async delete(req, res) {
    if (!req.params.id) {
      res.status(400).json('Parametro id grupo não recebido');
    }

    const grupo = await Grupo.findOne({
      where: { id: req.params.id },
    });

    if (!grupo) {
      res.status(400).json('Grupo não encontrado');
    }

    await grupo.destroy();

    return res.send();
  }
}
export default new GrupoController();
