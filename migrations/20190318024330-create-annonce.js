'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Annonces', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idRestoUser: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {
          model: 'Users',
          key: 'id',
        }
      },
      desc: {
        type: Sequelize.STRING,
        allowNull: false
      },
      piUrl: {
        type: Sequelize.STRING
      },
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      startHour: {
        type: Sequelize.TIME,
        allowNull: false
      },
      endHour: {
        type: Sequelize.TIME,
        allowNull: false
      },
      qtite: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Annonces');
  }
};