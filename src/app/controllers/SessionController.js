import jwt from 'jsonwebtoken';

import User from '../models/User';
import File from '../models/File';
import authConfig from '../../config/auth';

import schema from '../validations/Session';

class SessionController {
  async store(req, res) {
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation fails' });

    const { email, password } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    if (!user)
      return res.status(401).json({ error: 'E-mail is not registered' });

    if (!(await user.checkPassword(password)))
      return res.status(401).json({ error: 'Password does not match' });

    const { id, name, avatar } = user;

    return res.json({
      user: {
        id,
        name,
        email,
        avatar
      },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn
      })
    });
  }
}

export default new SessionController();
