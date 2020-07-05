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
          as: 'Equipamentos',
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
    const validador = {
      descricao: Yup.string().required(),
      modalidade_id: Yup.number().required(),
      grupoExercicio_id: Yup.number().required(),
      equipamentos: Yup.array().defined(),
    };

    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { modalidade_id, grupoExercicio_id, equipamentos } = req.body;

    const modalidade = await Modalidade.findOne({
      where: { id: modalidade_id },
    });

    if (!modalidade) {
      return res
        .status(401)
        .json({ error: 'You can only create exercicios with modalidade.' });
    }

    const grupo = await Grupo.findOne({
      where: { id: grupoExercicio_id },
    });

    if (!grupo) {
      return res
        .status(401)
        .json({ error: 'You can only create exercicios with grupo.' });
    }

    const exercicioEncontrado = await Exercicio.findOne({
      where: { descricao: req.body.descricao },
    });

    if (exercicioEncontrado) {
      return res.status(400).json({ error: 'Exercicio já existe.' });
    }

    const exerc = await Exercicio.create(req.body);
    if (equipamentos && equipamentos.length > 0) {
      exerc.setEquipamentos(equipamentos);
    }

    return res.json({ exerc });
  }

  async update(req, res) {
    const validador = {
      descricao: Yup.string().required(),
      modalidade_id: Yup.number().required(),
      grupoExercicio_id: Yup.number().required(),
      equipamentos: Yup.array().defined(),
    };

    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { descricao } = req.body;

    const exercicio = await Exercicio.findByPk(req.params.id);
    if (!exercicio) {
      return res.status(400).json({ error: 'Exercicio não encontrado.' });
    }

    if (!(descricao === exercicio.descricao)) {
      const exercicioExists = await Exercicio.findOne({
        where: { descricao },
      });

      if (exercicioExists) {
        return res.status(400).json({
          error: 'Já existe um exercicio com a descrição informada.',
        });
      }
    }

    await exercicio.update(req.body);
    return res.json(exercicio);
  }

  async delete(req, res) {
    const exercicio = await Exercicio.findOne({
      where: { id: req.params.id },
    });

    if (!exercicio) {
      res.status(400).json('Exercicio não encontrado');
    }

    await exercicio.destroy();

    return res.send();
  }
}
export default new ExercicioController();
