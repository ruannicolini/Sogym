import * as Yup from 'yup';
import FichaPadrao from '../models/FichaPadrao';
import Modalidade from '../models/Modalidade';
import Usuario from '../models/Usuario';
import Treino from '../models/Treino';
import FichaPadraoExercicio from '../models/FichaPadraoExercicio';
import Exercicio from '../models/Exercicio';

import Grupo from '../models/Grupo';
import Equipamento from '../models/Equipamento';

class FichaPadraoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const fichas = await FichaPadrao.findAll({
      // const fichas = await FichaPadrao.findByPk(29, {
      attributes: ['id', 'descricao'],
      include: [
        {
          model: Modalidade,
          as: 'modalidade',
          attributes: ['id', 'descricao'],
        },
        {
          model: Usuario,
          as: 'professor',
          attributes: ['id', 'nome'],
        },
        {
          model: FichaPadraoExercicio,
          as: 'ficha',
          attributes: ['obs_execucao'],
          include: [
            {
              model: Exercicio,
              attributes: ['id', 'descricao', 'modo_execucao'],
              include: [
                { model: Grupo, as: 'grupo', attributes: ['id', 'descricao'] },
              ],
            },
            { model: Treino, attributes: ['id', 'descricao'] },
          ],
        },
      ],
      order: ['descricao'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(fichas);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      descricao: Yup.string().required(),
      modalidade_id: Yup.number().required(),
      professor_id: Yup.number().defined(),
      ficha: Yup.array().defined(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }
    console.log('1');
    const fpEncontrada = await FichaPadrao.findOne({
      where: { descricao: req.body.descricao },
    });

    if (fpEncontrada) {
      return res.status(400).json({
        error: 'Já existe uma ficha padrão com a descrição informada.',
      });
    }

    const modalidade = await Modalidade.findOne({
      where: { id: req.body.modalidade_id },
    });

    if (!modalidade) {
      return res.status(400).json({ error: 'Modalidade não localizada' });
    }

    const professor = await Usuario.findOne({
      where: { id: req.body.professor_id, perfil_id: process.env.PROFESSOR },
    });

    if (!professor) {
      return res.status(400).json({ error: 'Professor não localizado' });
    }

    const fichaCriada = await FichaPadrao.create(req.body);

    for (const item of req.body.ficha) {
      const treino = await Treino.findByPk(item.treino_id);

      if (!treino) {
        return res.status(400).json({ error: 'Treino não localizado' });
      }

      for (const exerc of item.exercicios) {
        const exercicio = await Exercicio.findByPk(exerc.exercicio_id);

        if (!exercicio) {
          return res.status(400).json({
            error: 'Exercicio COD ' + exerc.exercicio_id + ' não localizado',
          });
        }

        const fpe = {
          ficha_padrao_id: fichaCriada.id,
          treino_id: item.treino_id,
          exercicio_id: exerc.exercicio_id,
          obs_execucao: exerc.obs_execucao,
        };

        const fichaPadraoExerc = await FichaPadraoExercicio.create(fpe);
      }
    }

    return res.json(fichaCriada.descricao);
  }
}

export default new FichaPadraoController();
