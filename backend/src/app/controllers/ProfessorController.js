import * as Yup from 'yup';
import { Op } from 'sequelize';
import jwt from 'jsonwebtoken';
import File from '../models/File';
import Perfil from '../models/Perfil';
import Usuario from '../models/Usuario';
import Modalidade from '../models/Modalidade';
import authConfig from '../../../src/config/auth';

class ProfessorController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const professores = await Usuario.findAll({
      include: [
        {
          model: Modalidade,
          as: 'modalidadesEnsino',
          attributes: ['id', 'descricao'],
          through: { attributes: [] },
        },
        {
          model: File,
          as: 'file',
          attributes: ['nome', 'path', 'url'],
        },
        {
          model: Perfil,
          as: 'perfis',
          attributes: [],
          through: {
            where: {
              perfil_id: {
                [Op.eq]: process.env.PROFESSOR,
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

    return res.json(professores);
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
      modalidadesEnsino: Yup.array().defined(
        'Array numérico modalidadesEnsino não definido'
      ),
    });

    const { modalidadesEnsino, email } = req.body;

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

    if (modalidadesEnsino && modalidadesEnsino.length > 0) {
      for (const item of req.body.modalidadesEnsino) {
        const modTeste = await Modalidade.findByPk(item);
        if (!modTeste) {
          validacao.error.push({
            name: 'modalidadesEnsino',
            message: 'Modalidade COD ' + item + ' não localizada!',
          });
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const professorCriado = await Usuario.create(req.body);

    perfis.push([process.env.PROFESSOR]);
    professorCriado.setPerfis(perfis);

    if (modalidadesEnsino && modalidadesEnsino.length > 0) {
      professorCriado.setModalidadesEnsino(modalidadesEnsino);
    }

    return res.json(professorCriado);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      nome: Yup.string().required(),
      telefone: Yup.string().required(),
      email: Yup.string().email().required(),
      modalidadesEnsino: Yup.array().defined(),
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

    const { email, oldPassword, modalidadesEnsino } = req.body;

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

    if (modalidadesEnsino && modalidadesEnsino.length > 0) {
      for (const item of req.body.modalidadesEnsino) {
        const modTeste = await Modalidade.findByPk(item);
        if (!modTeste) {
          return res
            .status(400)
            .json({ error: 'Modalidade Informada não localizada' });
        }
      }
    }

    const { id, nome, password, file_id } = await professor.update(req.body);

    professor.setModalidadesEnsino(modalidadesEnsino);

    return res.json({
      usuario: {
        id,
        nome,
        file_id,
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

    if (!(usuario.perfil_id == process.env.PROFESSOR)) {
      return res.status(401).json({ error: 'User is not a Professor' });
    }

    await usuario.destroy();

    return res.send();
  }
}

export default new ProfessorController();
