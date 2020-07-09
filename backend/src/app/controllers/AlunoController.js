import * as Yup from 'yup';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import File from '../models/File';
import Perfil from '../models/Perfil';
import Usuario from '../models/Usuario';
import Patologia from '../models/Patologia';
import authConfig from '../../../src/config/auth';

class AlunoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const usuarios = await Usuario.findAll({
      include: [
        {
          model: File,
          as: 'file',
          attributes: ['nome', 'path', 'url'],
        },
        {
          model: Patologia,
          as: 'patologias',
          attributes: ['id', 'descricao'],
          through: { attributes: [] },
        },
        {
          model: Perfil,
          as: 'perfis',
          attributes: [],
          through: {
            where: {
              perfil_id: {
                [Op.eq]: process.env.ALUNO,
              },
            },
            required: true,
            attributes: [],
          },
        },
      ],
      order: ['nome'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(usuarios);
  }

  async store(req, res) {
    const validacao = { error: '' };
    validacao.error = [];
    const perfis = [];

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
      patologias: Yup.array().defined('Array numérico patologias não definido'),
    });

    const { patologias, file_id, email } = req.body;

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

    if (email) {
      const usuarioExiste = await Usuario.findOne({
        where: { email },
      });
      if (usuarioExiste) {
        validacao.error.push({ name: 'email', message: 'Usuário já existe!' });
      }
    }

    if (file_id) {
      const file = await File.findByPk(file_id);
      if (!file) {
        validacao.error.push({
          name: 'file',
          message: 'File Informado não localizado!',
        });
      }
    }

    if (patologias && patologias.length > 0) {
      for (const item of patologias) {
        const patTeste = await Patologia.findByPk(item);
        if (!patTeste) {
          validacao.error.push({
            name: 'patologias',
            message: 'Patologia COD ' + item + ' não localizada!',
          });
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const usuarioCriado = await Usuario.create(req.body);

    perfis.push([process.env.ALUNO]);
    usuarioCriado.setPerfis(perfis);

    if (patologias && patologias.length > 0) {
      usuarioCriado.setPatologias(patologias);
    }

    return res.json(usuarioCriado);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      telefone: Yup.string().required(),
      patologias: Yup.array().defined(),
      email: Yup.string().email().required(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { email, oldPassword, patologias } = req.body;

    const usuario = await Usuario.findByPk(req.params.id);

    if (!usuario) {
      return res.status(400).json({ error: 'Usuario not found' });
    }

    if (!(usuario.perfil_id == process.env.ALUNO)) {
      return res.status(401).json({ error: 'User is not a Aluno' });
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
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, nome, password } = await usuario.update(req.body);
    usuario.setPatologias(patologias);

    return res.json({
      usuario: {
        id,
        nome,
        email,
        password,
      },
      // token: jwt.sign({ id }, authConfig.secret, {
      //   expiresIn: authConfig.expiresIn,
      // }),
    });
  }

  async delete(req, res) {
    const usuario = await Usuario.findOne({
      where: { id: req.params.id },
    });

    if (!usuario) {
      res.status(400).json('Usuario not found');
    }

    if (!(usuario.perfil_id == process.env.ALUNO)) {
      return res.status(401).json({ error: 'Usuário não é um Aluno' });
    }

    await usuario.destroy();

    return res.send();
  }
}

export default new AlunoController();
