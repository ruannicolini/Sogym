import * as Yup from 'yup';
import Sequelize, { Op } from 'sequelize';

import Usuario from '../models/Usuario';
import File from '../models/File';
import Perfil from '../models/Perfil';
import Patologia from '../models/Patologia';
import Modalidade from '../models/Modalidade';
import FichaPadrao from '../models/FichaPadrao';

import Database from '../../database';

class UsuarioController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nome', 'telefone', 'email', 'perfil_id'],

      include: [
        {
          model: Perfil,
          as: 'perfis',
        },
        {
          model: File,
          as: 'file',
          attributes: ['nome', 'path', 'url'],
        },
        {
          model: Patologia,
          as: 'patologias',
          where: Sequelize.literal(
            ' "perfis->usuario_perfil"."perfil_id" in (' +
              process.env.ALUNO +
              ') '
          ),
          required: false,
          attributes: ['id', 'descricao'],
          through: { attributes: [] },
        },
        {
          model: Modalidade,
          as: 'modalidadesEnsino',
          where: Sequelize.literal(
            ' "perfis->usuario_perfil"."perfil_id" in (' +
              process.env.PROFESSOR +
              ') '
          ),
          required: false,
          attributes: ['id', 'descricao'],
          through: { attributes: [] },
        },
      ],
      order: ['nome'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(usuarios);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required('Campo nome requerido'),
      telefone: Yup.string().required('Campo telefone requerido'),
      email: Yup.string().email().required('Campo email requerido'),
      password: Yup.string()
        .required('Campo password requerido')
        .min(6, 'Campo password possui menos de 6 digitos'),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required('Campo confirmPassword requerido')
              .oneOf(
                [Yup.ref('password')],
                'Campo confirmPassword deve ser igual ao campo password'
              )
          : field
      ),
      perfis: Yup.array().required('Array numérico perfis requerido'),
      patologias: Yup.array().when(['perfis'], (perfis, field) =>
        perfis.indexOf(parseInt(process.env.ALUNO)) != -1
          ? field.defined('Array numérico patologias não definido')
          : field
      ),
      modalidadesEnsino: Yup.array().when('perfis', (perfis, field) =>
        perfis.indexOf(parseInt(process.env.PROFESSOR)) != -1
          ? field.defined('Array numérico modalidadesEnsino não definido')
          : field
      ),
    });

    try {
      const vb = await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      const validacao = { error: '' };
      validacao.error = [];
      err.inner.forEach((e) => {
        validacao.error.push({
          name: e.path,
          message: e.message,
        });
      });
      return res.status(400).json(validacao);
    }

    const usuarioExiste = await Usuario.findOne({
      where: { email: req.body.email },
    });

    if (usuarioExiste) {
      return res.status(400).json({ error: 'Usuario já existe!' });
    }

    const {
      perfis,
      patologias,
      modalidadesEnsino,
      file_id,
      ...data
    } = req.body;

    if (file_id) {
      const file = await File.findByPk(file_id);
      if (!file) {
        return res.status(400).json({ error: 'File Informado não localizado' });
      }
    }

    if (perfis && perfis.length > 0) {
      for (const item of perfis) {
        const perfilTeste = await Perfil.findByPk(item);
        if (!perfilTeste) {
          return res
            .status(400)
            .json({ error: 'Perfil Informado não localizado' });
        }
      }
    }

    if (modalidadesEnsino && modalidadesEnsino.length > 0) {
      for (const item of modalidadesEnsino) {
        const modTeste = await Modalidade.findByPk(item);
        if (!modTeste) {
          return res
            .status(400)
            .json({ error: 'Modalidade Informada não localizada' });
        }
      }
    }

    if (patologias && patologias.length > 0) {
      for (const item of patologias) {
        const patTeste = await Patologia.findByPk(item);
        if (!patTeste) {
          return res
            .status(400)
            .json({ error: 'Patologia Informada não localizada' });
        }
      }
    }

    const usuarioCriado = await Usuario.create(data);
    if (perfis && perfis.length > 0) {
      usuarioCriado.setPerfis(perfis);
    }
    if (patologias && patologias.length > 0) {
      usuarioCriado.setPatologias(patologias);
    }
    if (modalidadesEnsino && modalidadesEnsino.length > 0) {
      usuarioCriado.setModalidadesEnsino(modalidadesEnsino);
    }

    return res.json(usuarioCriado);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required('Campo nome requerido'),
      telefone: Yup.string().required('Campo telefone requerido'),
      email: Yup.string().email().required('Campo email requerido'),
      password: Yup.string()
        .required('Campo password requerido')
        .min(6, 'Campo password possui menos de 6 digitos'),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required('Campo confirmPassword requerido')
              .oneOf(
                [Yup.ref('password')],
                'Campo confirmPassword deve ser igual ao campo password'
              )
          : field
      ),
      perfis: Yup.array().required('Array numérico perfis requerido'),
      patologias: Yup.array().when(['perfis'], (perfis, field) =>
        perfis.indexOf(parseInt(process.env.ALUNO)) != -1
          ? field.defined('Array numérico patologias não definido')
          : field
      ),
      modalidadesEnsino: Yup.array().when('perfis', (perfis, field) =>
        perfis.indexOf(parseInt(process.env.PROFESSOR)) != -1
          ? field.defined('Array numérico modalidadesEnsino não definido')
          : field
      ),
    });

    try {
      const vb = await schema.validate(req.body, { abortEarly: false });
    } catch (err) {
      const validacao = { error: '' };
      validacao.error = [];
      err.inner.forEach((e) => {
        validacao.error.push({
          name: e.path,
          message: e.message,
        });
      });
      return res.status(400).json(validacao);
    }

    const {
      email,
      oldPassword,
      patologias,
      modalidadesEnsino,
      perfis,
      file_id,
    } = req.body;

    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(400).json({ error: 'Usuario não encontrado' });
    }

    if (!(email === usuario.email)) {
      const userExists = await Usuario.findOne({ where: { email } });
      if (userExists) {
        return res
          .status(400)
          .json({ error: 'Email já vinculado a um usuário.' });
      }
    }

    if (oldPassword && !(await usuario.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Senha não confirmada!' });
    }

    if (file_id) {
      const file = await File.findByPk(file_id);
      if (!file) {
        return res.status(400).json({ error: 'File Informado não localizado' });
      }
    }

    const { id, nome, password } = await usuario.update(req.body);

    if (perfis && perfis.length > 0) {
      usuario.setPerfis(perfis);
    }
    if (patologias && patologias.length > 0) {
      usuario.setPatologias(patologias);
    }
    if (modalidadesEnsino && modalidadesEnsino.length > 0) {
      usuario.setModalidadesEnsino(modalidadesEnsino);
    }

    return res.json({
      usuario: {
        id,
        nome,
        email,
        password,
      },
    });
  }

  async delete(req, res) {
    const usuario = await Usuario.findOne({
      where: { id: req.params.id },
    });

    if (!usuario) {
      return res.status(400).json('Usuario não encontrado!');
    }

    const fps = await FichaPadrao.findOne({
      where: { professor_id: req.params.id },
    });

    if (fps) {
      return res
        .status(400)
        .json('Usuário possui ficha padrão definida. não é possível excluir!');
    }

    const t = await Database.connection.transaction();
    try {
      const patologias = await usuario.getPatologias();
      await usuario.removePatologias(patologias, { transaction: t });

      const modalidadesEnsino = await usuario.getModalidadesEnsino();
      await usuario.removeModalidadesEnsino(modalidadesEnsino, {
        transaction: t,
      });

      const perfis = await usuario.getPerfis();
      await usuario.removePerfis(perfis, { transaction: t });

      await usuario.destroy({ transaction: t });
      await t.commit();
    } catch (error) {
      await t.rollback();
      return res.status(500).send();
    }

    return res.send();
  }
}

export default new UsuarioController();
