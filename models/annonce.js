'use strict';
module.exports = (sequelize, DataTypes) => {
  const Annonce = sequelize.define('Annonce', {
    idRestoUser: DataTypes.INTEGER,
    desc: DataTypes.STRING,
    piUrl: DataTypes.STRING,
    price: DataTypes.FLOAT,
    startHour: DataTypes.TIME,
    endHour: DataTypes.TIME,
    qtite: DataTypes.INTEGER,
    isActive: DataTypes.BOOLEAN
  }, {});
  Annonce.associate = function(models) {
    // associations can be defined here
    models.Annonce.hasMany(models.Commande);

    models.Annonce.belongsTo(models.User,{
      foreignKey: {
       // allowNull: false
      }
    });

  };
  return Annonce;
};