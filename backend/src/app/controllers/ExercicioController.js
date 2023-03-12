import * as Yup from 'yup';
import Exercicio from '../models/Exercicio';
import Modalidade from '../models/Modalidade';
import Equipamento from '../models/Equipamento';
import Grupo from '../models/Grupo';

class ExercicioController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const exercicios = await Exercicio.findAll({
      order: ['descricao'],
      include: [
        {
          model: Grupo,
          as: 'grupo',
          attributes: ['id', 'descricao'],
        },
        {
          model: Modalidade,
          as: 'modalidade',
          attributes: ['id', 'descricao'],
        },
        {
          model: Equipamento,
          as: 'equipamentos',
          attributes: ['id', 'descricao'],
          through: { attributes: [] },
        },
      ],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(exercicios);
  }

  async store(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
      modalidade_id: Yup.number().required('Campo modalidade_id requerido'),
      grupoExercicio_id: Yup.number().required(
        'Campo grupoExercicio_id requerido'
      ),
      equipamentos: Yup.array().defined('Campo equipamentos não definido'),
    });

    const {
      modalidade_id,
      grupoExercicio_id,
      equipamentos,
      descricao,
    } = req.body;

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

    if (modalidade_id) {
      const modalidade = await Modalidade.findOne({
        where: { id: modalidade_id },
      });

      if (!modalidade) {
        validacao.error.push({
          name: 'modalidade_id',
          message: 'Modalidade Informada não localizada',
        });
      }
    }

    if (grupoExercicio_id) {
      const grupo = await Grupo.findOne({
        where: { id: grupoExercicio_id },
      });

      if (!grupo) {
        validacao.error.push({
          name: 'grupoExercicio_id',
          message: 'Grupo Informado não localizado.',
        });
      }
    }

    if (descricao) {
      const exercicioEncontrado = await Exercicio.findOne({
        where: { descricao },
      });

      if (exercicioEncontrado) {
        validacao.error.push({
          name: 'descricao',
          message: 'Já existe um exercício com a descrição informada.',
        });
      }
    }

    if (equipamentos) {
      for (const item of equipamentos) {
        const eqTeste = await Equipamento.findByPk(item);
        if (!eqTeste) {
          validacao.error.push({
            name: 'equipamentos',
            message: 'Equipamento COD ' + item + ' não localizado!',
          });
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const exerc = await Exercicio.create(req.body);

    if (equipamentos && equipamentos.length > 0) {
      exerc.setEquipamentos(equipamentos);
    }

    // return with associations
    const exercicioRetorno = await Exercicio.findOne({
      include: [
        {
          model: Grupo,
          as: 'grupo',
          attributes: ['id', 'descricao'],
        },
        {
          model: Modalidade,
          as: 'modalidade',
          attributes: ['id', 'descricao'],
        },
        {
          model: Equipamento,
          as: 'equipamentos',
          attributes: ['id', 'descricao'],
          through: { attributes: [] },
        },
      ],
      where: { id: exerc.id },
    });

    if (equipamentos && equipamentos.length > 0) {
      exercicioRetorno.setEquipamentos(equipamentos);
    }

    return res.json(exercicioRetorno);
  }

  async update(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
      modalidade_id: Yup.number().required('Campo modalidade_id requerido'),
      grupoExercicio_id: Yup.number().required(
        'Campo grupoExercicio_id requerido'
      ),
      equipamentos: Yup.array().defined('Campo equipamentos não definido'),
    });

    const {
      descricao,
      modalidade_id,
      grupoExercicio_id,
      equipamentos,
    } = req.body;

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

    const exercicio = await Exercicio.findByPk(req.params.id);
    if (!exercicio) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Exercicio não encontrado.',
      });
    } else {
      if (descricao) {
        if (!(descricao === exercicio.descricao)) {
          const exercicioExists = await Exercicio.findOne({
            where: { descricao },
          });

          if (exercicioExists) {
            validacao.error.push({
              name: 'descricao',
              message: 'Já existe um exercicio com a descrição informada.',
            });
          }
        }
      }
    }

    if (modalidade_id) {
      const modalidade = await Modalidade.findOne({
        where: { id: modalidade_id },
      });

      if (!modalidade) {
        validacao.error.push({
          name: 'modalidade_id',
          message: 'Modalidade Informada não localizada',
        });
      }
    }

    if (grupoExercicio_id) {
      const grupo = await Grupo.findOne({
        where: { id: grupoExercicio_id },
      });

      if (!grupo) {
        validacao.error.push({
          name: 'grupoExercicio_id',
          message: 'Grupo Informado não localizado.',
        });
      }
    }

    if (equipamentos) {
      for (const item of equipamentos) {
        const eqTeste = await Equipamento.findByPk(item);
        if (!eqTeste) {
          validacao.error.push({
            name: 'equipamentos',
            message: 'Equipamento COD ' + item + ' não localizado!',
          });
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const exerc = await exercicio.update(req.body);
    if (equipamentos && equipamentos.length > 0) {
      await exerc.setEquipamentos(equipamentos);
    }

    // return with associations
    const exercicioRetorno = await Exercicio.findOne({
      include: [
        {
          model: Grupo,
          as: 'grupo',
          attributes: ['id', 'descricao'],
        },
        {
          model: Modalidade,
          as: 'modalidade',
          attributes: ['id', 'descricao'],
        },
        {
          model: Equipamento,
          as: 'equipamentos',
          attributes: ['id', 'descricao'],
          through: { attributes: [] },
        },
      ],
      where: { id: exerc.id },
    });

    if (equipamentos && equipamentos.length > 0) {
      await exercicioRetorno.setEquipamentos(equipamentos);
    }

    return res.json(exercicioRetorno);

  }

  async delete(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const exercicio = await Exercicio.findOne({
      where: { id: req.params.id },
    });

    if (!exercicio) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Exercicio ' + req.params.id + ' não encontrado!',
      });
    } else {
      const fps = await exercicio.getFichasPadrao();
      if (fps && fps.length > 0) {
        validacao.error.push({
          name: 'param /:id',
          message: 'Exercicio consta em ficha padrão. não é possível excluir!',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    await exercicio.destroy();

    return res.send({});
  }
}
export default new ExercicioController();
