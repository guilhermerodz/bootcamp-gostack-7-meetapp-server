import { isBefore, subHours } from 'date-fns';
import Sequelize, { Model } from 'sequelize';

class Meetup extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
        owner_id: Sequelize.INTEGER,
        banner_id: Sequelize.INTEGER,
        canceled_at: Sequelize.DATE,
        subscribers: {
          type: Sequelize.STRING,
          get() {
            return this.getDataValue('subscribers').split(';');
          },
          set(subs) {
            this.setDataValue('subscribers', subs.join(';'));
          }
        },
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(this.date, new Date());
          }
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2));
          }
        }
      },
      {
        sequelize
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'banner_id', as: 'banner' });
  }
}

export default Meetup;
