import * as Yup from 'yup';
import FichaAluno from '../models/FichaAluno';
import Modalidade from '../models/Modalidade';
import Usuario from '../models/Usuario';
import Treino from '../models/Treino';
import FichaAlunoExercicio from '../models/FichaAlunoExercicio';
import Exercicio from '../models/Exercicio';
import Grupo from '../models/Grupo';
import Equipamento from '../models/Equipamento';

import Database from '../../database';

class FichaAlunoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;
    const fichas = await FichaAluno.findAll({
      where: { aluno_id: req.params.id },
      attributes: ['id', 'created_at'],
      include: [
        {
          model: Modalidade,
          as: 'modalidade',
          attributes: ['id', 'descricao'],
        },
        {
          model: Usuario,
          as: 'aluno',
          attributes: ['id', 'nome'],
        },
        {
          model: Usuario,
          as: 'professor',
          attributes: ['id', 'nome'],
        },
        {
          model: FichaAlunoExercicio,
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
      order: ['created_at'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });
    return res.json(fichas);
  }

  async store(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      aluno_id: Yup.number().required('Campo aluno_id requerido'),
      modalidade_id: Yup.number().required('Campo modalidade_id requerido'),
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

    if (req.body.aluno_id) {
      const aluno = await Usuario.findOne({
        where: { id: req.body.aluno_id },
      });
      if (!aluno) {
        validacao.error.push({
          name: 'aluno_id',
          message: 'Aluno não localizado.',
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
      validacao.error.push({
        name: 'professor_id',
        message:
          'Não é necessário definir o campo professor_id. Este campo é localizado pelo token logado.',
      });
    } else {
      req.body.professor_id = req.usuarioId;
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
              name: 'token',
              message: 'Usuário logado não é um professor!',
            });
          } else {
            //validar se usuario é professor desta modalidade
          }
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
    req.body.ativo = true;
    const fichaCriada = await FichaAluno.create(req.body);
    for (const item of req.body.ficha) {
      for (const exerc of item.exercicios) {
        const fpe = {
          ficha_aluno_id: fichaCriada.id,
          treino_id: item.treino_id,
          exercicio_id: exerc.exercicio_id,
          obs_execucao: exerc.obs_execucao,
        };
        FichaAlunoExercicio.create(fpe);
      }
    }
    return res.json({ id: fichaCriada.id });
  }

  async update(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      aluno_id: Yup.number().required('Campo aluno_id requerido'),
      modalidade_id: Yup.number().required('Campo modalidade_id requerido'),
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

    if (req.body.professor_id) {
      validacao.error.push({
        name: 'professor_id',
        message:
          'Não é necessário definir o campo professor_id. Este campo é localizado pelo token logado.',
      });
    }

    const faEncontrada = await FichaAluno.findByPk(req.params.id, {
      include: [{ model: Exercicio, as: 'exercicios' }],
    });

    if (!faEncontrada) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Ficha aluno não encontrada',
      });
    } else {
      if (faEncontrada.professor_id != req.usuarioId) {
        validacao.error.push({
          name: 'token',
          message:
            'Para alterar a ficha é necessário logar como o usuário que a criou',
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
          ficha_aluno_id: faEncontrada.id,
          treino_id: item.treino_id,
          exercicio_id: exerc.exercicio_id,
          obs_execucao: exerc.obs_execucao,
        };
        listaExercicio.push(fpe);
      }
    }

    const t = await Database.connection.transaction();
    try {
      const exct = await faEncontrada.getExercicios();
      await faEncontrada.removeExercicios(exct, { transaction: t });
      listaExercicio.map((v) => {
        FichaAlunoExercicio.create(v, { transaction: t });
      });
      await faEncontrada.update(req.body, { transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      return res.status(500).send();
    }
    return res.json({ id: faEncontrada.id });
  }

  async delete(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const fa = await FichaAluno.findOne({
      where: { id: req.params.id },
    });

    if (!fa) {
      validacao.error.push({
        name: 'token',
        message: 'Ficha aluno não encontrada',
      });
    } else {
      if (fa.professor_id != req.usuarioId) {
        validacao.error.push({
          name: 'professor_id',
          message:
            'Para excluir a ficha é necessário logar como o usuário que a criou',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const t = await Database.connection.transaction();
    try {
      const exct = await fa.getExercicios();
      await fa.removeExercicios(exct, { transaction: t });
      await fa.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      return res.status(500).send();
    }
    return res.send();
  }
}

export default new FichaAlunoController();
