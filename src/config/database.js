module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'bootcamp-challenge',
  define: {
    timestamps: true,
    underscored: true,
    underscoredAll: true
  }
};
