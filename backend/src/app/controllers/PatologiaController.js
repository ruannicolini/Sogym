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
      const patologiaEncontrada = await Patologia.findOne({
        where: { descricao },
      });

      if (patologiaEncontrada) {
        validacao.error.push({
          name: 'descricao',
          message: 'Patologia já existe.',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    return res.json(await Patologia.create(req.body));
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

    const patologia = await Patologia.findByPk(req.params.id);
    if (!patologia) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Patologia não encontrada.',
      });
    } else {
      if (descricao) {
        if (!(descricao === patologia.descricao)) {
          const patologiaExists = await Patologia.findOne({
            where: { descricao },
          });

          if (patologiaExists) {
            validacao.error.push({
              name: 'descricao',
              message: 'Já existe uma patologia com a descrição informada.',
            });
          }
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    return res.json(await patologia.update(req.body));
  }

  async delete(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

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
      validacao.error.push({
        name: 'param /:id',
        message: 'Patologia não encontrada.',
      });
    } else {
      if (patologia.incidentes) {
        if (patologia.incidentes.length) {
          validacao.error.push({
            name: 'param /:id',
            message: 'Patologia esta associada a usuários.',
          });
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    await patologia.destroy();

    return res.send();
  }
}
export default new PatologiaController();
