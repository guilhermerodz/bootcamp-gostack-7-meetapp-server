const date = new Date();

const subscribers = [...Array(101).keys()].filter(n => n !== 0);

const description =
  'Lorem ipsum sit amet, consectetur adipiscing elit. Curabitur scelerisque rhoncus nibh, pellentesque efficitur urna gravida ac.\nCras id ipsum dolor. Nullam a lorem quis dui scelerisque fermentum nec a risus. Integer placerat id ligula id dignissim.\n';

const data = [
  {
    id: 1,
    title: 'Sky Trip',
    description,
    location: 'Avenida Ipiranga, 1900 - República, São Paulo',
    date: '2030-08-01T18:00:00.000Z',
    owner_id: 1,
    banner_id: 1,
    updated_at: date,
    created_at: date,
    canceled_at: null,
    subscribers
  },
  {
    id: 2,
    title: 'Green Land',
    description,
    location: 'Avenida Ipiranga, 1900 - República, São Paulo',
    date: '2030-08-01T18:00:00.000Z',
    owner_id: 89,
    banner_id: 2,
    updated_at: date,
    created_at: date,
    canceled_at: null,
    subscribers
  },
  {
    id: 3,
    title: 'Intercept the Bridge',
    description,
    location: 'Avenida Ipiranga, 1900 - República, São Paulo',
    date: '2030-08-01T18:00:00.000Z',
    owner_id: 23,
    banner_id: 3,
    updated_at: date,
    created_at: date,
    canceled_at: null,
    subscribers
  },
  {
    id: 4,
    title: 'Climb the mountains',
    description,
    location: 'Avenida Ipiranga, 1900 - República, São Paulo',
    date: '2030-08-01T18:00:00.000Z',
    owner_id: 42,
    banner_id: 4,
    updated_at: date,
    created_at: date,
    canceled_at: null,
    subscribers
  },
  {
    id: 5,
    title: 'Nature look',
    description,
    location: 'Avenida Ipiranga, 1900 - República, São Paulo',
    date: '2030-08-01T18:00:00.000Z',
    owner_id: 57,
    banner_id: 5,
    updated_at: date,
    created_at: date,
    canceled_at: null,
    subscribers
  }
];

module.exports = {
  up: async queryInterface => {
    await queryInterface.bulkInsert('meetups', data, {});
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "meetups_id_seq" RESTART WITH ${data.length + 1}`
    );
  },
  down: queryInterface => queryInterface.bulkDelete('meetups', null, {})
};
