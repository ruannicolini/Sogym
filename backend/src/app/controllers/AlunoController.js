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
    const perfisUsuario = [];

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

    const { patologias, file_id, email, perfis } = req.body;

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
          name: 'file_id',
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

    if (perfis) {
      validacao.error.push({
        name: 'perfis',
        message:
          'Array numérico perfis definido. Na rotina incluir aluno não é permitido alteração no perfil do usuario.',
      });
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const usuarioCriado = await Usuario.create(req.body);

    perfisUsuario.push([process.env.ALUNO]);
    usuarioCriado.setPerfis(perfisUsuario);

    if (patologias && patologias.length > 0) {
      usuarioCriado.setPatologias(patologias);
    }

    return res.json(usuarioCriado);
  }

  async update(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      nome: Yup.string().required('Campo nome requerido'),
      telefone: Yup.string().required('Campo telefone requerido'),
      email: Yup.string().email().required('Campo email requerido'),
      patologias: Yup.array().defined('Array numérico patologias não definido'),
      oldPassword: Yup.string().min(
        6,
        'Campo oldPassword possui menos de 6 digitos'
      ),
      password: Yup.string()
        .min(6, 'Campo password possui menos de 6 digitos')
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required('Campo oldPassword requerido') : field
        ),

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
    });

    const { email, oldPassword, patologias, perfis } = req.body;

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

    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Usuario ' + req.params.id + ' não encontrado!',
      });
    } else {
      if (email) {
        if (!(email === usuario.email)) {
          const userExists = await Usuario.findOne({ where: { email } });
          if (userExists) {
            validacao.error.push({
              name: 'email',
              message: 'Email já vinculado a um usuário.',
            });
          }
        }
      }

      var isAluno = false;
      const perfisUsuario = await usuario.getPerfis();
      await perfisUsuario.forEach((v) => {
        if (v.id == process.env.ALUNO) {
          isAluno = true;
        }
      });

      if (!isAluno) {
        validacao.error.push({
          name: 'param /:id',
          message: 'Usuário localizado não é um aluno!',
        });
      }

      if (oldPassword && !(await usuario.checkPassword(oldPassword))) {
        validacao.error.push({
          name: 'oldPassword',
          message: 'Campo oldPassword não confere com o Password atual no BD!',
        });
      }

      if (perfis) {
        validacao.error.push({
          name: 'perfis',
          message:
            'Array numérico perfis definido. Na rotina alterar aluno não é permitido alteração no perfil do usuario.',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    const {
      id,
      nome: nomeAtualizado,
      password: passwordAtualizado,
      email: emailAtualizado,
    } = await usuario.update(req.body);

    usuario.setPatologias(patologias);

    return res.json({
      usuario: {
        id,
        nome: nomeAtualizado,
        password: passwordAtualizado,
        email: emailAtualizado,
      },
      // token: jwt.sign({ id }, authConfig.secret, {
      //   expiresIn: authConfig.expiresIn,
      // }),
    });
  }

  async delete(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const usuario = await Usuario.findOne({
      where: { id: req.params.id },
    });

    if (!usuario) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Usuario ' + req.params.id + ' não encontrado!',
      });
    } else {
      const perfisUsuario = await usuario.getPerfis();

      var isAluno = false;
      await perfisUsuario.forEach((v) => {
        if (v.id == process.env.ALUNO) {
          isAluno = true;
        }
      });

      if (perfisUsuario.length > 1) {
        validacao.error.push({
          name: 'param /:id',
          message:
            'Não é possível excluir! Usuario possui mais de um perfil de uso no sistema. Utilize a rotina de exclusão para usuários.',
        });
      }

      if (!isAluno) {
        validacao.error.push({
          name: 'param /:id',
          message: 'Usuário localizado não é um aluno!',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    await usuario.destroy();

    return res.send();
  }
}

export default new AlunoController();
