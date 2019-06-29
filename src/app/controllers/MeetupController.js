import * as Yup from 'yup';
import { isBefore, isAfter, format, parseISO } from 'date-fns';

import Sequelize, { Model } from 'sequelize';

import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required()
        .max(55),
      description: Yup.string()
        .required()
        .max(650),
      location: Yup.string()
        .required()
        .max(100),
      date: Yup.date().required()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const owner_id = req.userId;
    const { title, description, location, date } = req.body;

    /**
     * Check for past dates
     */
    if (isBefore(parseISO(date), new Date()))
      return res.status(400).json({ error: 'Past dates are not allowed' });

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      owner_id
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().max(55),
      description: Yup.string().max(650),
      location: Yup.string().max(100),
      date: Yup.date(),
      banner_id: Yup.number()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup)
      return res.status(400).json({ error: 'Meetup does not exists' });

    if (req.userId !== meetup.owner_id)
      return res.status(400).json({ error: 'Not allowed' });

    const { title, description, location, date, banner_id } = req.body;

    /**
     * Check for past dates
     */
    if (isBefore(parseISO(date), new Date()))
      return res.status(400).json({ error: 'Past dates are not allowed' });

    const { id } = await meetup.update(req.body);

    return res.json({
      id,
      title,
      description,
      location,
      date,
      banner_id
    });
  }
}

export default new MeetupController();
