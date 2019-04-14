'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
        let migrations = [];
        migrations.push(queryInterface.removeColumn('Annonces','startHour'));
        migrations.push(queryInterface.removeColumn('Annonces','endHour'));
       migrations.push(queryInterface.addColumn(
        'Commandes',
        'qtite',
        {
          type: Sequelize.INTEGER,
          allowNull: false
        }
      ));
      migrations.push(queryInterface.addColumn(
        'Commandes',
        'isRecup',
        {
          type: Sequelize.BOOLEAN,
          allowNull: false
        }
      ));
      return Promise.all(migrations);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
  }
};
