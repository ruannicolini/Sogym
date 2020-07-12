import * as Yup from 'yup';
import Modalidade from '../models/Modalidade';
import Exercicio from '../models/Exercicio';

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
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
      valor: Yup.number()
        .required('Campo valor requerido')
        .positive('Informe um número positivo.'),
    });

    const { descricao } = req.body;

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

    if (descricao) {
      const modalidadeEncontrada = await Modalidade.findOne({
        where: { descricao },
      });

      if (modalidadeEncontrada) {
        validacao.error.push({
          name: 'descricao',
          message: 'Modalidade já existe.',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    return res.json(await Modalidade.create(req.body));
  }

  async update(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const schema = Yup.object().shape({
      descricao: Yup.string().required('Campo descricao requerido'),
      valor: Yup.number()
        .required('Campo valor requerido')
        .positive('Informe um número positivo.'),
    });

    const { descricao } = req.body;

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

    const modalidade = await Modalidade.findByPk(req.params.id);
    if (!modalidade) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Modalidade não encontrado.',
      });
    } else {
      if (descricao) {
        if (!(descricao === modalidade.descricao)) {
          const modalidadeExists = await Modalidade.findOne({
            where: { descricao },
          });

          if (modalidadeExists) {
            validacao.error.push({
              name: 'descricao',
              message: 'Já existe uma modalidade com a descrição informada.',
            });
          }
        }
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    return res.json(await modalidade.update(req.body));
  }

  async delete(req, res) {
    const validacao = { error: '' };
    validacao.error = [];

    const modalidade = await Modalidade.findOne({
      where: { id: req.params.id },
    });

    if (!modalidade) {
      validacao.error.push({
        name: 'param /:id',
        message: 'Modalidade não encontrada.',
      });
    } else {
      const profs = modalidade.getProfessores();
      if (profs.length > 0) {
        validacao.error.push({
          name: 'param /:id',
          message:
            'Professores vinculados a modalidade. Não é possível excluir!',
        });
      }

      const qtdExerc = await Exercicio.count({
        where: { modalidade_id: req.params.id },
      });

      if (qtdExerc > 0) {
        validacao.error.push({
          name: 'param /:id',
          message:
            'Exercícios vinculados a modalidade. Não é possível excluir!',
        });
      }
    }

    if (validacao.error.length > 0) {
      return res.status(400).json(validacao);
    }

    await modalidade.destroy();

    return res.send();
  }
}
export default new ModalidadeController();
