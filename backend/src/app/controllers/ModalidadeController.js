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
      return res.status(400).json({ error: 'Modalidade já existe.' });
    }

    const modalidade = await Modalidade.create(req.body);
    return res.json(modalidade);
  }

  async update(req, res) {
    const validador = {
      descricao: Yup.string().required(),
      valor: Yup.number().required().positive('Informe um número positivo.'),
    };
    const schema = Yup.object().shape(validador);
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { descricao } = req.body;

    const modalidade = await Modalidade.findByPk(req.params.id);
    if (!modalidade) {
      return res.status(400).json({ error: 'Modalidade não encontrada.' });
    }

    if (!(descricao === modalidade.descricao)) {
      const modalidadeExists = await Modalidade.findOne({
        where: { descricao },
      });

      if (modalidadeExists) {
        return res.status(400).json({
          error: 'Já existe uma modalidade com a descrição informada.',
        });
      }
    }

    return res.json(await modalidade.update(req.body));
  }

  async delete(req, res) {
    const modalidade = await Modalidade.findOne({
      where: { id: req.params.id },
    });

    if (!modalidade) {
      res.status(400).json('Modalidade não encontrado');
    }

    await modalidade.destroy();

    return res.send();
  }
}
export default new ModalidadeController();
