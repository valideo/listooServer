'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    isResto: DataTypes.BOOLEAN,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    sName: DataTypes.STRING,
    fName: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    zip: DataTypes.STRING,
    tel: DataTypes.STRING,
    age: DataTypes.INTEGER,
    restoName: DataTypes.STRING,
    restoType: DataTypes.STRING
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    models.User.hasMany(models.Annonce);
    models.User.hasMany(models.Commande);
  };
  return User;
};