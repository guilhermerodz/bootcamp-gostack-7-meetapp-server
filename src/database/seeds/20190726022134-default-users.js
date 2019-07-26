const faker = require('faker');

const date = new Date();

const data = [];
for (let id = 1; id <= 100; id += 1) {
  data.push({
    id,
    name: faker.name.findName(),
    email: faker.internet.email(),
    password_hash:
      '$2a$08$SN.Y4pEJM98Exj3tvOqTOOrKvl3jHcVqNwFS.ZXcNlHU6.j/9exzW',
    created_at: date,
    updated_at: date,
    avatar_id: null
  });
}

module.exports = {
  up: async queryInterface => {
    await queryInterface.bulkInsert('users', data, {});
    await queryInterface.sequelize.query(
      `ALTER SEQUENCE "users_id_seq" RESTART WITH ${data.length + 1}`
    );
  },
  down: queryInterface => queryInterface.bulkDelete('users', null, {})
};
