import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';

import { storeSchema, updateSchema } from '../validations/User';

class UserController {
  async store(req, res) {
    try {
      await storeSchema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists)
      return res
        .status(400)
        .json({ error: 'This e-mail is already registered!' });

    const { id, name, email } = await User.create(req.body);

    await Notification.create({
      user: id,
      content: `Welcome to Meetapp!`,
      redirects: `/tutorial`
    });

    return res.json({
      id,
      name,
      email
    });
  }

  async update(req, res) {
    try {
      await updateSchema.validate(req.body);
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
