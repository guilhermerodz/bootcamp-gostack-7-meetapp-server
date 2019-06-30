import * as Yup from 'yup';
import { startOfDay, endOfDay, parseISO } from 'date-fns';

import { Op } from 'sequelize';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class AvailableController {
  async index(req, res) {
    const schema = Yup.object().shape({
      date: Yup.date(),
      page: Yup.number()
    });

    if (!(await schema.isValid(req.query)))
      return res.status(400).json({ error: 'Validation failed' });

    /**
     * Pagination
     */
    const perPage = 10;

    const { date, page = 1 } = req.query;
    const parsedDate = date ? parseISO(date) : new Date(); // Default is today

    const meetups = await Meetup.findAll({
      where: {
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)]
        }
      },
      order: ['date'],
      attributes: ['id', 'title', 'description', 'location', 'date'],
      limit: perPage,
      offset: (page - 1) * perPage,
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json(meetups);
  }
}

export default new AvailableController();
