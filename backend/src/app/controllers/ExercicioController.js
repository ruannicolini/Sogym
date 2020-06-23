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
      return res.status(400).json({ error: 'Exercicio already exists.' });
    }

    console.log('1');
    const exerc = await Exercicio.create(req.body);
    console.log('2');
    if (equipamentos && equipamentos.length > 0) {
      console.log('3');
      exerc.setEquipamentos(equipamentos);
    }
    console.log('4');

    return res.json({ exerc });
  }
}
export default new ExercicioController();
