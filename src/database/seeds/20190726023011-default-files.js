const date = new Date();

module.exports = {
  up: queryInterface =>
    queryInterface.bulkInsert(
      'files',
      [
        {
          id: 1,
          name: 'purple_sky.png',
          path: 'default/purple_sky.png',
          type: 'banner',
          created_at: date,
          updated_at: date
        },
        {
          id: 2,
          name: 'green_land.png',
          path: 'default/green_land.png',
          type: 'banner',
          created_at: date,
          updated_at: date
        },
        {
          id: 3,
          name: 'bridge.jpg',
          path: 'default/bridge.jpg',
          type: 'banner',
          created_at: date,
          updated_at: date
        },
        {
          id: 4,
          name: 'road_and_mountains.png',
          path: 'default/road_and_mountains.png',
          type: 'banner',
          created_at: date,
          updated_at: date
        },
        {
          id: 5,
          name: 'trees_and_purple_sky.png',
          path: 'default/trees_and_purple_sky.png',
          type: 'banner',
          created_at: date,
          updated_at: date
        }
      ],
      {}
    ),
  down: queryInterface => queryInterface.bulkDelete('files', null, {})
};
