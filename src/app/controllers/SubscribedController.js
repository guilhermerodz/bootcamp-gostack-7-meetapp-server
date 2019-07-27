import { Op } from 'sequelize';
import { startOfHour, addHours, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

import SubscriptionMail from '../jobs/SubscriptionMail';
import Queue from '../../lib/Queue';

class SubscribedController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: {
        subscribers: { [Op.contains]: [req.userId] }
      },
      attributes: ['id', 'title', 'description', 'location', 'date'],
      order: ['date'],
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

    return res.json(meetups.filter(m => !m.past));
  }

  async show(req, res) {
    const { id } = req.params;

    const { subscribers } = await Meetup.findByPk(id, {
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        }
      ],
      attributes: ['subscribers']
    });

    if (!subscribers)
      return res.status(400).json({ error: 'Meetup does not exists' });

    /**
     * Pagination
     */
    const perPage = 10;
    const { page = 1 } = req.query;

    const offset = (page - 1) * perPage;
    const [from, to] = [offset, offset + perPage];

    const allSubscribers = await User.findAll({
      where: {
        [Op.or]: subscribers.slice(from, to).map(user_id => ({
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

    return res.json({ subscribers: allSubscribers });
  }

  async store(req, res) {
    const meetup = await Meetup.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url']
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!meetup)
      return res.status(400).json({ error: 'Meetup does not exists' });

    if (meetup.past)
      return res.status(400).json({ error: 'Meetup is already finished' });

    // if (req.userId === meetup.owner_id)
    //   return res
    //     .status(400)
    //     .json({ error: "The meetup owner can't subscribe" });

    if (meetup.subscribers.includes(req.userId))
      return res.status(400).json({ error: 'Already subscribed' });

    /**
     * Check for meetups at the same time
     */
    const hourStart = startOfHour(Number(meetup.date));
    const minimumMeetupHours = 2;

    const conflictMeetups = await Meetup.findOne({
      where: {
        subscribers: { [Op.contains]: [req.userId] },
        date: {
          [Op.between]: [hourStart, addHours(hourStart, minimumMeetupHours)]
        }
      },
      attributes: ['id', 'title', 'location', 'date']
    });

    if (conflictMeetups)
      return res.status(400).json({
        error: 'You are already subscribed to a meetup at the same time',
        conflict: conflictMeetups
      });

    const { title, description, location, date, banner } = await meetup.update({
      subscribers: [req.userId, ...meetup.subscribers]
    });

    const { avatar, name: subName, email: subEmail } = await User.findOne({
      where: { id: req.userId },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url']
        }
      ]
    });

    await Queue.add(SubscriptionMail.key, {
      meetup,
      banner,
      title,
      avatar,
      subName,
      subEmail
    });

    return res.json({
      title,
      description,
      location,
      date,
      banner
    });
  }

  async delete(req, res) {
    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup)
      return res.status(400).json({ error: 'This meetup does not exists!' });

    if (meetup.past)
      return res
        .status(400)
        .json({ error: 'You can not unsubscribe a finished meetup!' });

    if (!meetup.subscribers.includes(req.userId))
      return res.status(400).json({ error: 'You are not subscribed!' });

    const removeFromSubs = subs => {
      subs.splice(subs.indexOf(req.userId), 1);
      return subs;
    };
    const subscribers = removeFromSubs(meetup.subscribers);

    await meetup.update({ subscribers });

    return res.send();
  }
}

export default new SubscribedController();
