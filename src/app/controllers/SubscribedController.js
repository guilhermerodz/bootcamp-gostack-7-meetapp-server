import Meetup from '../models/Meetup';

class SubscribedController {
  async show(req, res) {
    const { id } = req.params;

    const { subscribers } = await Meetup.findByPk(id, {
      attributes: ['subscribers']
    });

    if (!subscribers)
      return res.status(400).json({ error: 'Meetup does not exists' });

    const subscribed = !!subscribers.find(user_id => user_id === req.userId);

    return res.json(subscribed);
  }
}

export default new SubscribedController();
