//Imports 
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');

//Routes

module.exports = {
    create: function(req, res) {

        // Params
    var annonce = req.body.idAnnonce;
    var qtitePanier = req.body.q;
    var orderDate = req.body.date;
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    if (annonce == null) {
        return res.status(422).json({ 'error': 'missing parameters' });
    }

      asyncLib.waterfall([
        function(done) {
          var newCommande = models.Commande.create({
            idUser: userId,
            idAnnonce: annonce,
            orderDateTime : orderDate,
            isRecup : false,
            qtite : qtitePanier
          })
          .then(function(newCommande) {
            done(newCommande);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': err });
          });
        }
      ], function(newCommande) {
        if (newCommande) {
          return res.status(201).json({
            'CommandeId': newCommande.id
          });
        } else {
          return res.status(500).json({ 'error': 'cannot add annonce' });3570
        }
      });
  },
  getCommandesByUser: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    models.Commande.findAll({
      attributes: ['id', 'idAnnonce', 'orderDateTime', 'isRecup', 'qtite'],
      where: { idUser : userId }
    }).then(function(commandes) {
      if (commandes) {
        res.status(201).json(commandes);
      } else {
        res.status(404).json({ 'error': 'commandes not found' });
      }
    }).catch(function(err) {
      res.status(500).json({ 'error': 'cannot fetch commandes' });
    });
  },
  getCommandesByResto: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var todayStart = new Date();
    var todayEnd = new Date();
    todayStart.setHours(5);
    todayStart.setMinutes(0);
    todayEnd.setHours(23);
    todayEnd.setMinutes(59);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

      models.Annonce.findOne({
        attributes: ['id'],
        where: { idRestoUser : userId}
      }).then(function(annonce) {
        if (annonce) {
          models.Commande.findAll({
            attributes: ['id', 'idUser', 'orderDateTime', 'isRecup', 'qtite'],
            where: { 
              idAnnonce : annonce["id"],
              orderDateTime: { between: [todayStart, todayEnd]},
             }
          }).then(function(commandes) {
            if (commandes) {
              res.status(201).json(commandes);
            } else {
              res.status(404).json({ 'error': 'commandes not found' });
            }
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot fetch commandes' });
          });
        } else {
          res.status(404).json({ 'error': 'annonce not found' });
        }
      }).catch(function(err) {
        res.status(500).json({ 'error': 'cannot fetch annonce' });
      });
  },
  getAllCommandes: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    models.Commande.findAll({
      attributes: ['id', 'idUser', 'idAnnonce', 'orderDateTime']
    }).then(function(commandes) {
      if (commandes) {
        res.status(201).json(commandes);
      } else {
        res.status(404).json({ 'error': 'commandes not found' });
      }
    }).catch(function(err) {
      res.status(500).json({ 'error': 'cannot fetch commandes' });
    });
  }
}