import * as Yup from 'yup';
import Sequelize, { Op } from 'sequelize';
import Equipamento from '../models/Equipamento';
import Exercicio from '../models/Exercicio';
import File from '../models/File';

class EquipamentoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const equipamentos = await Equipamento.findAll({
      order: ['descricao'],
      include: [
        {
          model: File,
          as: 'file',
          attributes: ['nome', 'path', 'url'],
        },
      ],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(equipamentos);
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

      // const equipamentoEncontrado = await Equipamento.findOne({
      //   where: { descricao: req.body.descricao },
      // });
      const equipamentoEncontrado = await Equipamento.findOne({
        where: {
          $and: Sequelize.where(Sequelize.fn('lower', Sequelize.col('descricao')), Sequelize.fn('lower', req.body.descricao))
        },
      });

      if (equipamentoEncontrado) {
        validacao.error.push({
          name: 'descricao',
          message: 'Já existe um equipamento com a descrição informada.',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const equipamento = await Equipamento.create(req.body);

    return res.json(equipamento);
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

    const equipamento = await Equipamento.findByPk(req.params.id);
    if (!equipamento) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Equipamento não encontrado.',
      });
    } else {
      if (descricao) {
        if (!(descricao === equipamento.descricao)) {
          const equipamentoExists = await Equipamento.findOne({
            where: { descricao },
          });

          if (equipamentoExists) {
            validacao.error.push({
              name: 'descricao',
              message: 'Já existe um equipamento com a descrição informada.',
            });
          }
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    return res.json(await equipamento.update(req.body));
  }

  async delete(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

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
      validacao.error.push({
        name: 'param /:id',
        message: 'Equipamento não encontrado.',
      });
    } else {
      if (equipamento.exercicios.length) {
        validacao.error.push({
          name: 'param /:id',
          message: 'Equipamento possui exercícios vinculados',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    await equipamento.destroy();

    return res.send();
  }
}
export default new EquipamentoController();
