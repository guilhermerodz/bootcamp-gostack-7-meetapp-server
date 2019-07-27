import { format, parseISO } from 'date-fns';
import us from 'date-fns/locale/en-US';
import Mail from '../../lib/Mail';

const formatDate = d => format(d, "MMMM dd yyyy' at' H:mm aa", { locale: us });

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, banner, title, avatar, subName, subEmail } = data;

    await Mail.sendMail({
      to: `${meetup.owner.name} <${meetup.owner.email}>`,
      subject: `New subscription in your meetup - ${meetup.title}`,
      template: 'subscription',
      context: {
        ownerName: meetup.owner.name,
        bannerURL: banner ? banner.url : null,
        meetupTitle: title,
        meetupDate: formatDate(parseISO(meetup.date)),
        subAvatar: avatar
          ? avatar.url
          : `https://api.adorable.io/avatar/200/${meetup.owner.name}.png`,
        subName,
        subEmail,
        subDate: formatDate(new Date()),
        subCount: meetup.subscribers.length
      }
    });
  }
}

export default new SubscriptionMail();
