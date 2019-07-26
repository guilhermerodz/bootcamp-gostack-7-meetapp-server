const date = new Date();

const subscribers = [...Array(101).keys()].filter(n => n !== 0);

module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert(
      'meetups',
      [
        {
          id: 1,
          title: 'Sky Trip',
          description:
            'Restart your life from scratch. Come meet your real friends!\nWe have to meet on the floor first.',
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
          description: 'Come relax and be close to nature!',
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
          description: 'Bridge traffic block day!',
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
          description: 'Who will win?',
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
          description:
            'Look at the sky tonight, all of the stars have a reason...',
          location: 'Avenida Ipiranga, 1900 - República, São Paulo',
          date: '2030-08-01T18:00:00.000Z',
          owner_id: 57,
          banner_id: 5,
          updated_at: date,
          created_at: date,
          canceled_at: null,
          subscribers
        }
      ],
      {}
    ),
  down: queryInterface => queryInterface.bulkDelete('meetups', null, {})
};
