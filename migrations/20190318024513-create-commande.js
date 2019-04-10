'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Commandes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      idUser: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {
          model: 'Users',
          key: 'id',
        }
      },
      idAnnonce: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references : {
          model: 'Annonces',
          key: 'id',
        }
      },
      orderDateTime: {
        type: Sequelize.DATE,
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
    return queryInterface.dropTable('Commandes');
  }
};