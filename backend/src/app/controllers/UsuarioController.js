import * as Yup from 'yup';
import Usuario from '../models/Usuario';

class UsuarioController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const usuarios = await Usuario.findAll({
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
      perfil_id: Yup.number().required(),
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

    const usuarioCriado = await Usuario.create(req.body);

    return res.json(usuarioCriado);
  }

  async update(req, res) {}

  async delete(req, res) {}
}

export default new UsuarioController();
