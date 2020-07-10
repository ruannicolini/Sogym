import * as Yup from 'yup';
import FichaPadrao from '../models/FichaPadrao';
import Modalidade from '../models/Modalidade';
import Usuario from '../models/Usuario';
import Treino from '../models/Treino';
import FichaPadraoExercicio from '../models/FichaPadraoExercicio';
import Exercicio from '../models/Exercicio';
import Grupo from '../models/Grupo';
import Equipamento from '../models/Equipamento';

import Database from '../../database';

class FichaPadraoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const fichas = await FichaPadrao.findAll({
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
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
      modalidade_id: Yup.number().required('Campo modalidade_id requerido'),
      professor_id: Yup.number().required('Campo professor_id requerido'),
      ficha: Yup.array().required('Campo ficha requerido'),
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
      const fpEncontrada = await FichaPadrao.findOne({
        where: { descricao: req.body.descricao },
      });

      if (fpEncontrada) {
        validacao.error.push({
          name: 'descricao',
          message: 'Já existe uma ficha padrão com a descrição informada.',
        });
      }
    }

    if (req.body.modalidade_id) {
      const modalidade = await Modalidade.findOne({
        where: { id: req.body.modalidade_id },
      });

      if (!modalidade) {
        validacao.error.push({
          name: 'modalidade_id',
          message: 'Modalidade não localizada.',
        });
      }
    }

    if (req.body.professor_id) {
      const professor = await Usuario.findOne({
        where: { id: req.body.professor_id },
      });

      if (!professor) {
        validacao.error.push({
          name: 'professor_id',
          message: 'Professor não localizado',
        });
      } else {
        const perfisUsuario = await professor.getPerfis();

        var isProf = false;
        await perfisUsuario.forEach((v) => {
          if (v.id == process.env.PROFESSOR) {
            isProf = true;
          }
        });

        if (!isProf) {
          validacao.error.push({
            name: 'param /:id',
            message: 'Usuário localizado não é um professor!',
          });
        }
      }
    }

    if (req.body.ficha) {
      for (const item of req.body.ficha) {
        if (item.treino_id) {
          const treino = await Treino.findByPk(item.treino_id);
          if (!treino) {
            validacao.error.push({
              name: 'treino_id',
              message: 'Treino COD ' + item.treino_id + 'não localizado',
            });
          }
        } else {
          validacao.error.push({
            name: 'treino_id',
            message: 'Campo treino_id não informado em item do array ficha',
          });
        }

        if (item.exercicios) {
          for (const exerc of item.exercicios) {
            if (exerc.exercicio_id) {
              const exercicio = await Exercicio.findByPk(exerc.exercicio_id);
              if (!exercicio) {
                validacao.error.push({
                  name: 'exercicio_id',
                  message:
                    'Exercicio COD ' + exerc.exercicio_id + ' não localizado',
                });
              }
            } else {
              validacao.error.push({
                name: 'exercicio_id',
                message:
                  'Campo exercicio_id não informado dentro do array ficha->exercicios',
              });
            }
          }
        } else {
          validacao.error.push({
            name: 'exercicios',
            message: 'array exercicios não informado em item do array ficha',
          });
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const fichaCriada = await FichaPadrao.create(req.body);

    for (const item of req.body.ficha) {
      for (const exerc of item.exercicios) {
        const fpe = {
          ficha_padrao_id: fichaCriada.id,
          treino_id: item.treino_id,
          exercicio_id: exerc.exercicio_id,
          obs_execucao: exerc.obs_execucao,
        };
        FichaPadraoExercicio.create(fpe);
      }
    }

    return res.json({ id: fichaCriada.id, descricao: fichaCriada.descricao });
  }

  async update(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
      modalidade_id: Yup.number().required('Campo modalidade_id requerido'),
      professor_id: Yup.number().required('Campo professor_id requerido'),
      ficha: Yup.array().required('Campo ficha requerido'),
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

    const fpEncontrada = await FichaPadrao.findByPk(req.params.id, {
      include: [{ model: Exercicio, as: 'exercicios' }],
    });
    if (!fpEncontrada) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Ficha padrão não encontrada',
      });
    }

    const { descricao } = req.body;

    console.log(descricao);

    if (descricao) {
      console.log(fpEncontrada.descricao);
      if (!(descricao === fpEncontrada.descricao)) {
        const fpExists = await FichaPadrao.findOne({
          where: { descricao },
        });

        if (fpExists) {
          validacao.error.push({
            name: 'descricao',
            message: 'Já existe uma ficha padrão com a descrição informada.',
          });
        }
      }
    }

    if (req.body.modalidade_id) {
      const modalidade = await Modalidade.findOne({
        where: { id: req.body.modalidade_id },
      });

      if (!modalidade) {
        validacao.error.push({
          name: 'modalidade_id',
          message: 'Modalidade não localizada.',
        });
      }
    }

    if (req.body.professor_id) {
      const professor = await Usuario.findOne({
        where: { id: req.body.professor_id },
      });

      if (!professor) {
        validacao.error.push({
          name: 'professor_id',
          message: 'Professor não localizado',
        });
      } else {
        const perfisUsuario = await professor.getPerfis();

        var isProf = false;
        await perfisUsuario.forEach((v) => {
          if (v.id == process.env.PROFESSOR) {
            isProf = true;
          }
        });

        if (!isProf) {
          validacao.error.push({
            name: 'param /:id',
            message: 'Usuário localizado não é um professor!',
          });
        }
      }
    }

    if (req.body.ficha) {
      for (const item of req.body.ficha) {
        if (item.treino_id) {
          const treino = await Treino.findByPk(item.treino_id);
          if (!treino) {
            validacao.error.push({
              name: 'treino_id',
              message: 'Treino COD ' + item.treino_id + 'não localizado',
            });
          }
        } else {
          validacao.error.push({
            name: 'treino_id',
            message: 'Campo treino_id não informado em item do array ficha',
          });
        }

        if (item.exercicios) {
          for (const exerc of item.exercicios) {
            if (exerc.exercicio_id) {
              const exercicio = await Exercicio.findByPk(exerc.exercicio_id);
              if (!exercicio) {
                validacao.error.push({
                  name: 'exercicio_id',
                  message:
                    'Exercicio COD ' + exerc.exercicio_id + ' não localizado',
                });
              }
            } else {
              validacao.error.push({
                name: 'exercicio_id',
                message:
                  'Campo exercicio_id não informado dentro do array ficha->exercicios',
              });
            }
          }
        } else {
          validacao.error.push({
            name: 'exercicios',
            message: 'array exercicios não informado em item do array ficha',
          });
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const listaExercicio = [];
    for (const item of req.body.ficha) {
      for (const exerc of item.exercicios) {
        const fpe = {
          ficha_padrao_id: fpEncontrada.id,
          treino_id: item.treino_id,
          exercicio_id: exerc.exercicio_id,
          obs_execucao: exerc.obs_execucao,
        };

        listaExercicio.push(fpe);
      }
    }

    const t = await Database.connection.transaction();
    try {
      const exct = await fpEncontrada.getExercicios();
      await fpEncontrada.removeExercicios(exct, { transaction: t });
      listaExercicio.map((v) => {
        FichaPadraoExercicio.create(v, { transaction: t });
      });
      await fpEncontrada.update(req.body, { transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      return res.status(500).send();
    }

    return res.json({ id: fpEncontrada.id, descricao: descricao });
  }

  async delete(req, res) {
    const fp = await FichaPadrao.findOne({
      where: { id: req.params.id },
    });

    if (!fp) {
      res.status(400).json('Ficha padrão não encontrado');
    }

    const t = await Database.connection.transaction();
    try {
      const exct = await fp.getExercicios();
      await fp.removeExercicios(exct, { transaction: t });
      await fp.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      return res.status(500).send();
    }

    return res.send();
  }
}

export default new FichaPadraoController();
