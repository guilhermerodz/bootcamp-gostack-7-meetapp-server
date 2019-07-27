import { format, parseISO } from 'date-fns';
import us from 'date-fns/locale/en-US';
import Mail from '../../lib/Mail';

const formatDate = d =>
  format(parseISO(d), "MMMM DD YYYY at H:mm A''", { locale: us });

class SubscriptionMail {
  get key() {
    return 'SubscriptionMail';
  }

  async handle({ data }) {
    const { meetup, banner, title, avatar, subName, subEmail } = data;

    console.log('Tentando enviar e-mail...');
    await Mail.sendMail({
      to: `${meetup.owner.name} <${meetup.owner.email}>`,
      subject: `New subscription in your meetup - ${meetup.title}`,
      template: 'subscription',
      context: {
        ownerName: meetup.owner.name,
        bannerURL: banner ? banner.url : null,
        meetupTitle: title,
        meetupDate: formatDate(meetup.date),
        subAvatar: avatar ? avatar.url : null,
        subName,
        subEmail,
        subDate: formatDate(new Date()),
        subCount: meetup.subscribers.length
      }
    });
    console.log('Adicionado à fila');
  }
}

export default new SubscriptionMail();
