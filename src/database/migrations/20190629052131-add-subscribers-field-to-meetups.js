module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('meetups', 'subscribers', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('meetups', 'subscribers');
  }
};
