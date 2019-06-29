import { Op } from 'sequelize';
import { startOfHour, addHours, parseISO } from 'date-fns';

import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

class SubscribedController {
  async index(req, res) {
    const meetups = await Meetup.findAll({
      where: { subscribers: { [Op.contains]: [req.userId] } },
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
        }
      ]
    });

    return res.json(meetups);
  }

  async store(req, res) {
    const meetup = await Meetup.findOne({ where: { id: req.params.id } });

    if (!meetup)
      return res.status(400).json({ error: 'Meetup does not exists' });

    if (meetup.past)
      return res.status(400).json({ error: 'Meetup is already finished' });

    if (req.userId === meetup.owner_id)
      return res
        .status(400)
        .json({ error: "The meetup owner can't subscribe" });

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

    const subscribers = await meetup.update({
      subscribers: [req.userId, ...meetup.subscribers]
    });

    return res.json(subscribers);
  }
}

export default new SubscribedController();
