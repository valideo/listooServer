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

    var todayStart = new Date();
    var todayEnd = new Date();
    todayStart.setHours(0);
    todayStart.setMinutes(1);
    todayEnd.setHours(23);
    todayEnd.setMinutes(59);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    models.Commande.findAll({
      attributes: ['id', 'idAnnonce', 'orderDateTime', 'isRecup', 'qtite'],
      where: {
         idUser : userId,
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
  },

  getCommandesByResto: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var todayStart = new Date();
    var todayEnd = new Date();
    todayStart.setHours(0);
    todayStart.setMinutes(1);
    todayEnd.setHours(23);
    todayEnd.setMinutes(59);

    // if (userId < 0)
    //   return res.status(400).json({ 'error': 'wrong token' });

    models.Annonce.findOne({
      attributes: ['id'],
      where: { idRestoUser: userId }
    }).then(function (annonce) {
      if (annonce) {
        models.Commande.findAll({
          attributes: ['id', 'idUser', 'orderDateTime', 'isRecup', 'qtite'],
          where: {
            idAnnonce: annonce["id"],
            orderDateTime: { between: [todayStart, todayEnd] },
          }
        }).then(function (commandes) {
          if (commandes) {
            res.status(201).json(commandes);
          } else {
            res.status(404).json({ 'error': 'commandes not found' });
          }
        }).catch(function (err) {
          res.status(500).json({ 'error': 'cannot fetch commandes' });
        });
      } else {
        res.status(404).json({ 'error': 'annonce not found' });
      }
    }).catch(function (err) {
      res.status(500).json({ 'error': 'cannot fetch annonce' });
    });
  },

  getCommandesByAnnonce: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var annonceId = req.params.id;
    var todayStart = new Date();
    var todayEnd = new Date();
    todayStart.setHours(0);
    todayStart.setMinutes(1);
    todayEnd.setHours(23);
    todayEnd.setMinutes(59);

    // if (userId < 0)
    //   return res.status(400).json({ 'error': 'wrong token' });

    models.Commande.findAll({
      attributes: ['id', 'idUser', 'orderDateTime', 'isRecup', 'qtite'],
      where: {
        idAnnonce : annonceId,
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
  },

  getAllCommandes: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    models.Commande.findAll({
      attributes: ['id', 'idUser', 'idAnnonce', 'orderDateTime', 'qtite', 'isRecup']
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

  updateState: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    // Params
    var isRecup = req.body.isRecup;
    var orderId = req.body.orderId

    asyncLib.waterfall([
      function(done) {
        models.Commande.findOne({
          attributes: ['id'],
          where: { id: orderId }
        }).then(function (commandeFound) {
          done(null, commandeFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify commandeFound' });
        });
      },
      function(commandeFound, done) {
        if(commandeFound) {
          commandeFound.update({
            isRecup: isRecup
          }).then(function() {
            done(commandeFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot update commande' });
          });
        } else {
          res.status(404).json({ 'error': 'commande not found' });
        }
      },
    ], function(commandeFound) {
      if (commandeFound) {
        return res.status(201).json(commandeFound);
      } else {
        return res.status(500).json({ 'error': 'cannot update commande' });
      }
    });
  },

  getAllCommandesAdmin: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId !== -100)
      return res.status(400).json({ 'error': 'wrong Admin token' });

    models.Commande.findAll({
      attributes: ['id', 'idUser', 'idAnnonce', 'orderDateTime', 'qtite', 'isRecup']
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

  getAllNewCommandesAdmin: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId !== -100)
      return res.status(400).json({ 'error': 'wrong Admin token' });

    var todayStart = new Date();
    var todayEnd = new Date();
    todayStart.setHours(0);
    todayStart.setMinutes(1);
    todayEnd.setHours(23);
    todayEnd.setMinutes(59);

    models.Commande.findAll({
      attributes: ['id', 'idUser', 'idAnnonce', 'orderDateTime', 'qtite', 'isRecup'],
      where : {
        createdAt: {between: [todayStart, todayEnd]}
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
  },

  getCommandesByUserAdmin: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var idToCheck   = req.params.id;

    if (userId !== -100)
      return res.status(400).json({ 'error': 'wrong Admintoken' });

    models.Commande.findAll({
      attributes: ['id', 'idAnnonce', 'orderDateTime', 'isRecup', 'qtite'],
      where: {
         idUser : idToCheck
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
  },

  getCommandesByAnnonceAdmin: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var annonceId = req.params.id;

    if (userId !== -100)
      return res.status(400).json({ 'error': 'wrong token' });

    models.Commande.findAll({
      attributes: ['id', 'idUser', 'orderDateTime', 'isRecup', 'qtite'],
      where: {
        idAnnonce : annonceId,
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
  }
}