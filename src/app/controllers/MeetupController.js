import { Op } from 'sequelize';
import * as Yup from 'yup';
import { isBefore, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class MeetupController {
  async index(req, res) {
    const meetups = await Meetup.findAll({ where: { owner_id: req.userId } });

    return res.json(meetups);
  }

  async show(req, res) {
    const { id } = req.params;

    const meetup = await Meetup.findByPk(id, {
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    if (!meetup)
      return res.status(400).json({ error: 'Meetup does not exists' });

    const {
      title,
      description,
      location,
      date,
      owner_id,
      past,
      cancelable,
      banner
    } = meetup;

    const subscribers = await User.findAll({
      where: {
        [Op.or]: meetup.subscribers.slice(0, 20).map(user_id => ({
          id: user_id
        }))
      },
      attributes: ['id', 'name'],
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json({
      title,
      description,
      location,
      date,
      owner_id,
      past,
      cancelable,
      banner,
      subscribers
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string()
        .required('Title can not be empty!')
        .max(55, 'Title can not exceed 55 characters.'),
      description: Yup.string()
        .required('Description can not be empty!')
        .max(650, 'Description must have a maximum of 650 characters.'),
      location: Yup.string()
        .required('Location can not be empty!')
        .max(150, 'Location can not exceed 150 characters!'),
      date: Yup.date('Invalid date!').required('Date can not be empty.'),
      banner_id: Yup.number().required('You must set a banner for the meetup!')
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

    const { title, description, location, date, banner_id } = req.body;

    /**
     * Prevents using another file type that is not a banner
     */
    const image = await File.findByPk(banner_id);
    if (!image) return res.status(400).json({ error: 'Banner not found' });
    if (image.type !== 'banner')
      return res.status(400).json({ error: 'Your picture must be a banner' });

    /**
     * Check for past dates
     */
    if (isBefore(parseISO(date), new Date()))
      return res
        .status(400)
        .json({ error: 'You can not created an meetup to a passed date!' });

    const meetup = await Meetup.create({
      title,
      description,
      location,
      date,
      owner_id: req.userId,
      banner_id
    });

    return res.json(meetup);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().max(55, 'Title can not exceed 55 characters.'),
      description: Yup.string().max(
        650,
        'Description must have a maximum of 650 characters.'
      ),
      location: Yup.string().max(
        150,
        'Location can not exceed 150 characters!'
      ),
      date: Yup.date(),
      banner_id: Yup.number(),
      subscribers: Yup.array(Yup.number('Subscribers must be an array of IDs!'))
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: err.errors });
    }

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
     * Prevents using another file type that is not a banner
     */
    if (banner_id && banner_id !== meetup.banner_id) {
      const image = await File.findByPk(banner_id);
      if (!image) return res.status(400).json({ error: 'Image not found' });
      if (image.type !== 'banner')
        return res.status(400).json({ error: 'Your picture must be a banner' });
    }

    /**
     * Check for past dates
     */
    if (date && isBefore(parseISO(date), new Date()))
      return res.status(400).json({ error: 'Past dates are not allowed' });

    await meetup.update(req.body);

    const {
      id,
      title,
      description,
      location,
      banner,
      subscribers
    } = await Meetup.findByPk(req.params.id, {
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    return res.json({
      id,
      title,
      description,
      location,
      date,
      banner,
      subscribers
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup)
      return res.status(400).json({ error: 'This meetup does not exists!' });

    if (meetup.past)
      return res
        .status(400)
        .json({ error: 'You can not delete a finished meetup!' });

    if (req.userId !== meetup.owner_id)
      return res
        .status(400)
        .json({ error: 'You are not the owner of this meetup!' });

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
