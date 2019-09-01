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

    try {
      await schema.validate(req.query);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const where = {
      canceled_at: null
    };

    /**
     * Set a default date
     */
    const { date } = req.query;
    const { to: toDate } = req.query;
    const parsedDate = date ? parseISO(date) : new Date(); // Default is today

    if (toDate === 'all')
      where.date = {
        [Op.gt]: parsedDate
      };
    else
      where.date = {
        [Op.between]: [
          startOfDay(parsedDate),
          endOfDay(toDate ? parseISO(toDate) : parsedDate)
        ]
      };

    /**
     * Order
     */
    const { ordering = 'ASC' } = req.query;

    /**
     * Search Meetup by title
     */
    const { search } = req.query;
    if (search) where.title = { [Op.iLike]: `%${search}%` };

    /**
     * Pagination
     */
    const perPage = 10;
    const { page = 1 } = req.query;

    const meetups = await Meetup.findAll({
      where,
      order: [['date', ordering], ['id', 'DESC']],
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
