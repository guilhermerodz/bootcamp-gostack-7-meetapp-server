import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({ where: { owner_id: req.userId } });

    return res.json(meetups);
  }

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
      owner_id: req.userId
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().max(55),
      description: Yup.string().max(650),
      location: Yup.string().max(100),
      date: Yup.date(),
      banner_id: Yup.number(),
      subscribers: Yup.array(Yup.number())
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup)
      return res.status(400).json({ error: 'Meetup does not exists' });

    if (meetup.past)
      return res.status(400).json({ error: 'Meetup is already finished' });

    if (req.userId !== meetup.owner_id)
      return res
        .status(400)
        .json({ error: "You're not the owner of this meetup" });

    const { date, banner_id } = req.body;

    /**
     * Prevents using another file type as profile picture
     */
    if (banner_id && banner_id !== meetup.banner_id) {
      const image = await File.findByPk(banner_id);
      if (!image) return res.status(400).json({ error: 'Image not found' });
      if (image.type !== 1)
        return res.status(400).json({ error: 'Your picture must be a banner' });
    }

    /**
     * Check for past dates
     */
    if (date && isBefore(parseISO(date), new Date()))
      return res.status(400).json({ error: 'Past dates are not allowed' });

    const {
      id,
      title,
      description,
      location,
      subscribers
    } = await meetup.update(req.body);

    return res.json({
      id,
      title,
      description,
      location,
      date,
      banner_id,
      subscribers
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup)
      return res.status(400).json({ error: 'Meetup does not exists' });

    if (meetup.past)
      return res.status(400).json({ error: 'Meetup is already finished' });

    if (req.userId !== meetup.owner_id)
      return res
        .status(400)
        .json({ error: "You're not the owner of this meetup" });

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
