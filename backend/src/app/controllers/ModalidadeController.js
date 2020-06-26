import * as Yup from 'yup';
import Modalidade from '../models/Modalidade';

class ModalidadeController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const qtdRegPag = 20;

    const modalidades = await Modalidade.findAll({
      order: ['descricao'],
      limit: qtdRegPag,
      offset: (page - 1) * qtdRegPag,
    });

    return res.json(modalidades);
  }

  async store(req, res) {
    const validador = {
      descricao: Yup.string().required(),
      valor: Yup.number().required().positive('Informe um número positivo.'),
    };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const modalidadeEncontrada = await Modalidade.findOne({
      where: { descricao: req.body.descricao },
    });

    if (modalidadeEncontrada) {
      return res.status(400).json({ error: 'Modalidade already exists.' });
    }

    const { descricao } = await Modalidade.create(req.body);
    return res.json({ descricao });
  }

  async update(req, res) {}

  async delete(req, res) {}
}
export default new ModalidadeController();
