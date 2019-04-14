'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
    
    let migrations = [];
    migrations.push(queryInterface.addColumn(
      'Annonces',
      'startHour',
      {
        type: Sequelize.DATE,
        allowNull: false
      }
    ));
   migrations.push(queryInterface.addColumn(
     'Annonces',
     'endHour',
     {
       type: Sequelize.DATE,
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
