import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario';
import authConfig from '../../../src/config/auth';

class ProfessorController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const professores = await Usuario.findAll({
      where: { perfil_id: process.env.PROFESSOR },
      order: ['nome'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(professores);
  }

  async store(req, res) {
    console.log('teste');
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      telefone: Yup.string().required(),
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

    req.body.perfil_id = process.env.PROFESSOR;

    const professorCriado = await Usuario.create(req.body);

    return res.json(professorCriado);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      telefone: Yup.string().required(),
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

    const { email, oldPassword } = req.body;

    const professor = await Usuario.findByPk(req.params.id);

    if (!professor) {
      return res.status(400).json({ error: 'Usuario not found' });
    }

    if (!(professor.perfil_id == process.env.PROFESSOR)) {
      return res.status(401).json({ error: 'User is not a Professor' });
    }

    if (!(email === professor.email)) {
      const userExists = await Usuario.findOne({ where: { email } });
      if (userExists) {
        return res
          .status(400)
          .json({ error: 'Email já vinculado a um usuário.' });
      }
    }

    if (oldPassword && !(await professor.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, nome, password } = await professor.update(req.body);

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
    if (!req.params.id) {
      res.status(400).json('id professor not found');
    }

    const usuario = await Usuario.findOne({
      where: { id: req.params.id },
    });

    if (!usuario) {
      res.status(400).json('Usuario not found');
    }

    if (!(usuario.perfil_id == process.env.PROFESSOR)) {
      return res.status(401).json({ error: 'User is not a Professor' });
    }

    await usuario.destroy();

    return res.send();
  }
}

export default new ProfessorController();
