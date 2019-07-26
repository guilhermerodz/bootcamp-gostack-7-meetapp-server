import * as Yup from 'yup';
import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string()
        .max(200, 'Your name can not exceed 200 characters!')
        .required('Name is required.'),
      email: Yup.string()
        .max(100, 'Your email can not exceed 100 characters!')
        .required('Email is required.'),
      password: Yup.string()
        .required('Password is required')
        .min(6, 'Your password must have at least 6 characters!')
        .max(25, 'Your password can not exceed 25 characters!')
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists)
      return res
        .status(400)
        .json({ error: 'This e-mail is already registered!' });

    const { id, name, email } = await User.create(req.body);

    return res.json({
      id,
      name,
      email
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().max(200, 'Your name can not exceed 200 characters!'),
      email: Yup.string().max(100, 'Your email can not exceed 100 characters!'),
      oldPassword: Yup.string(),
      password: Yup.string()
        .min(6, 'Your password must have at least 6 characters!')
        .max(25, 'Your password can not exceed 25 characters!')
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required('New password is required!') : field
        ),
      confirmPassword: Yup.string()
        .min(6, 'Your password must have at least 6 characters!')
        .max(25, 'Your password can not exceed 25 characters!')
        .when('password', (password, field) =>
          password
            ? field
                .required('Please confirm your password!')
                .oneOf([Yup.ref('password')], 'The new passwords do not match.')
            : field
        )
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const { email, oldPassword, avatar_id } = req.body;

    const user = await User.findByPk(req.userId);

    // Prevents duplicating e-mails
    if (email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });

      if (emailExists)
        return res
          .status(400)
          .json({ error: 'This e-mail is already being used!' });
    }

    // Prevents using another file type that is not a profile picture
    if (avatar_id) {
      const image = await File.findByPk(avatar_id);
      if (!image) return res.status(400).json({ error: 'Avatar not found' });
      if (image.type !== 'avatar')
        return res
          .status(400)
          .json({ error: 'Your avatar must be a profile picture' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword)))
      return res.status(401).json({ error: 'Password does not match' });

    await user.update(req.body);

    const { id, name, avatar } = await User.findByPk(req.userId, {
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json({
      id,
      name,
      email,
      avatar
    });
  }
}

export default new UserController();
