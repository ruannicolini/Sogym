import * as Yup from 'yup';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';
import Usuario from '../models/Usuario';
import authConfig from '../../../src/config/auth';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { email, password } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (!(await usuario.checkPassword(password))) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }

    const { id, name } = usuario;

    return res.json({
      user: {
        id,
        name,
        email,
      },
      token: jwt.sign({ id, name, email }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }

  async validateToken(req, res) {

    const token = req.get("Authorization").replace("Bearer ","");

    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    const email = decoded.email;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const { id, nome } = usuario;

    return res.json({
      id,
      nome,
      email,
      token: token,
    });

  }

  async getUsuario(req, res) {

    const token = req.get("Authorization").replace("Bearer ","");

    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    const email = decoded.email;

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    const { id, nome } = usuario;

    return res.json({
      id,
      nome,
      email,
      token: token,
    });

  }

}

export default new SessionController();
