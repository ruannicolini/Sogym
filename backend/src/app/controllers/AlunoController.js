import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import File from '../models/File';
import Usuario from '../models/Usuario';
import Patologia from '../models/Patologia';
import authConfig from '../../../src/config/auth';

class AlunoController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const usuarios = await Usuario.findAll({
      where: { perfil_id: process.env.ALUNO },
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
      patologias: Yup.array().defined(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
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

    req.body.perfil_id = process.env.ALUNO;
    const { patologias } = req.body;

    const usuarioCriado = await Usuario.create(req.body);
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
      return res.status(401).json({ error: 'User is not a Aluno' });
    }

    await usuario.destroy();

    return res.send();
  }
}

export default new AlunoController();
