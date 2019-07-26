module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('meetups', 'subscribers', {
      type: Sequelize.ARRAY(Sequelize.INTEGER),
      allowNull: false,
      defaultValue: []
    });
  },

  down: queryInterface => {
    return queryInterface.removeColumn('meetups', 'subscribers');
  }
};
