import * as Yup from 'yup';
import Grupo from '../models/Grupo';
import Exercicio from '../models/Exercicio';

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
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
    });

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

    if (req.body.descricao) {
      const grupoEncontrado = await Grupo.findOne({
        where: { descricao: req.body.descricao },
      });

      if (grupoEncontrado) {
        validacao.error.push({
          name: 'descricao',
          message: 'Já existe um grupo com a descrição informada.',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const grupo = await Grupo.create(req.body);

    return res.json(grupo);
  }

  async update(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
    });

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

    const { descricao } = req.body;

    const grupo = await Grupo.findByPk(req.params.id);
    if (!grupo) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Grupo não encontrado.',
      });
    } else {
      if (descricao) {
        if (!(descricao === grupo.descricao)) {
          const grupoExists = await Grupo.findOne({
            where: { descricao },
          });

          if (grupoExists) {
            validacao.error.push({
              name: 'descricao',
              message: 'Já existe um grupo com a descrição informada.',
            });
          }
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    return res.json(await grupo.update(req.body));
  }

  async delete(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const grupo = await Grupo.findOne({
      where: { id: req.params.id },
    });

    if (!grupo) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Grupo não encontrado',
      });
    } else {
      const exercicios = await Exercicio.findAll({
        where: { grupoExercicio_id: req.params.id },
      });
      if (exercicios.length) {
        validacao.error.push({
          name: 'param /:id',
          message: 'Grupo possui exercícios vinculados',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    await grupo.destroy();

    return res.send();
  }
}
export default new GrupoController();
