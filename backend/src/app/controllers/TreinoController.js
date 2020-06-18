import * as Yup from 'yup';
import Treino from '../models/Treino';

class TreinoController {
  index(req, res) {
    return res.json({ appointments: 'ok' });
  }

  async store(req, res) {
    const validador = { descricao: Yup.string().required() };
    const schema = Yup.object().shape(validador);

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    console.log('Problema Aqui');

    const userExists = await Treino.findOne({
      where: { descricao: req.body.descricao },
    });

    console.log('3');

    if (treinoEncontrado) {
      return res.status(400).json({ error: 'Treino already exists.' });
    }

    const { descricao } = await Treino.create(req.body);

    return res.json({ descricao });
  }
}
export default new TreinoController();
