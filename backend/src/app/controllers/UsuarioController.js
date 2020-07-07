import * as Yup from 'yup';
import Sequelize, { Op } from 'sequelize';

import Usuario from '../models/Usuario';
import File from '../models/File';
import Perfil from '../models/Perfil';
import Patologia from '../models/Patologia';
import Modalidade from '../models/Modalidade';

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
      nome: Yup.string().required(),
      telefone: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      perfis: Yup.array().required(),
      patologias: Yup.array().when(['perfis'], (perfis, field) =>
        perfis.indexOf(parseInt(process.env.ALUNO)) != -1
          ? field.defined()
          : field
      ),
      modalidadesEnsino: Yup.array().when('perfis', (perfis, field) =>
        perfis.indexOf(parseInt(process.env.PROFESSOR)) != -1
          ? field.defined()
          : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const usuarioExiste = await Usuario.findOne({
      where: { email: req.body.email },
    });

    if (usuarioExiste) {
      return res.status(400).json({ error: 'Usuario already exists.' });
    }

    const { perfis, patologias, modalidadesEnsino, ...data } = req.body;

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
      nome: Yup.string().required(),
      telefone: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      perfis: Yup.array().required(),
      patologias: Yup.array().when(['perfis'], (perfis, field) =>
        perfis.indexOf(parseInt(process.env.ALUNO)) != -1
          ? field.defined()
          : field
      ),
      modalidadesEnsino: Yup.array().when('perfis', (perfis, field) =>
        perfis.indexOf(parseInt(process.env.PROFESSOR)) != -1
          ? field.defined()
          : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const {
      email,
      oldPassword,
      patologias,
      modalidadesEnsino,
      perfis,
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
      res.status(400).json('Usuario não encontrado!');
    }

    await usuario.destroy();

    return res.send();
  }
}

export default new UsuarioController();
