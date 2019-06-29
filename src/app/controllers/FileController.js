import * as Yup from 'yup';

import File from '../models/File';

class FileController {
  async store(req, res) {
    const schema = Yup.object().shape({
      type: Yup.number()
        .required()
        .lessThan(2)
        .moreThan(-1)
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const type = Number(req.body.type); // 0=avatar, 1=banner, 2
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
      type
    });

    return res.json(file);
  }
}

export default new FileController();
