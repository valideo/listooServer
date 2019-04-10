'use strict';
module.exports = (sequelize, DataTypes) => {
  const Commande = sequelize.define('Commande', {
    idUser: DataTypes.INTEGER,
    idAnnonce: DataTypes.INTEGER,
    orderDateTime: DataTypes.DATE
  }, {});
  Commande.associate = function(models) {
    // associations can be defined here

    models.Commande.belongsTo(models.User,{
      foreignKey: {
      //  allowNull: false
      }
    });
    models.Commande.belongsTo(models.Annonce,{
      foreignKey: {
     //   allowNull: false
      }
    });
  };
  return Commande;
};