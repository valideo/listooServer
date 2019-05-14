//Imports 
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');

//Routes

module.exports = {
    create: function(req, res) {

        // Params
    var desc    = req.body.desc;
    var piUrl    = req.body.piUrl;
    var price    = req.body.price;
    var startHour    = req.body.startHour;
    var endHour    = req.body.endHour;
    var qtite    = req.body.qtite;
    var isActive    = req.body.isActive;

    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    if (price == null || startHour == null || endHour == null || qtite == null) {
        return res.status(422).json({ 'error': 'missing parameters' });
    }

      asyncLib.waterfall([
        function(done) {
          models.Annonce.findOne({
            attributes: ['id'],
            where: { idRestoUser: userId }
          })
          .then(function(annonceFound) {
            done(null, annonceFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify annonce' });
            
          });
        },
        function(annonceFound, done) {
          if (!annonceFound) {
            done(null, annonceFound);
          } else {
            return res.status(409).json({ 'error': 'materiel already exist' });
          }
        },
        function(annonceFound, done) {
          var newAnnonce = models.Annonce.create({
            idRestoUser: userId,
            desc: desc,
            piUrl: piUrl,
            price: price,
            startHour: startHour,
            endHour: endHour,
            qtite: qtite,
            isActive: isActive
          })
          .then(function(newAnnonce) {
            done(newAnnonce);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': err });
          });
        }
      ], function(newAnnonce) {
        if (newAnnonce) {
          return res.status(201).json({
            'AnnonceId': newAnnonce.id
          });
        } else {
          return res.status(500).json({ 'error': 'cannot add annonce' });
        }
      });
  },
  getAnnonce: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    models.Annonce.findOne({
      attributes: ['id', 'idRestoUser', 'desc', 'piUrl', 'price', 'startHour', 'endHour', 'qtite', 'isActive', 'updatedAt'],
      where: { idRestoUser: userId }
    }).then(function(annonce) {
      if (annonce) {
        res.status(201).json(annonce);
      } else {
        res.status(404).json({ 'error': 'annonce not found' });
      }
    }).catch(function(err) {
      res.status(500).json({ 'error': 'cannot fetch annonce' });
    });
  }, getAnnonceById: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var annonceId = req.params.id;

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    models.Annonce.findOne({
      attributes: ['id', 'idRestoUser', 'desc', 'piUrl', 'price', 'startHour', 'endHour', 'qtite', 'isActive', 'updatedAt'],
      where: { id: annonceId }
    }).then(function(annonce) {
      if (annonce) {
        res.status(201).json(annonce);
      } else {
        res.status(404).json({ 'error': 'annonce not found' });
      }
    }).catch(function(err) {
      res.status(500).json({ 'error': 'cannot fetch annonce' });
    });
  }, getAnnonceByResto: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
    var annonceId = req.params.id;

    var todayStart = new Date();
    var todayEnd = new Date();
    todayStart.setHours(5);
    todayStart.setMinutes(0);
    todayEnd.setHours(23);
    todayEnd.setMinutes(59);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    models.Annonce.findOne({
      attributes: ['id', 'idRestoUser', 'desc', 'piUrl', 'price', 'startHour', 'endHour', 'qtite', 'isActive', 'updatedAt'],
      where: { 
        idRestoUser: annonceId,
        isActive: true,
        startHour: { gt: todayStart},
        endHour : {lt: todayEnd}
       }
    }).then(function(annonce) {
      if (annonce) {
        res.status(201).json(annonce);
      } else {
        res.status(404).json({ 'error': 'annonce not found' });
      }
    }).catch(function(err) {
      res.status(500).json({ 'error': 'cannot fetch annonce' });
    });
  },
  getAllAnnonces: function(req, res) {
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

    models.Annonce.findAll({
      attributes: ['id', 'idRestoUser', 'desc', 'piUrl', 'price', 'startHour', 'endHour', 'qtite', 'isActive', 'updatedAt'],
      where: { 
        isActive: true,
        startHour: { gt: todayStart},
        endHour : {lt: todayEnd}
      }
    }).then(function(annonce) {
      if (annonce) {
        res.status(201).json(annonce);
      } else {
        res.status(404).json({ 'error': 'annonces not found' });
      }
    }).catch(function(err) {
      res.status(500).json({ 'error': 'cannot fetch annonces' });
    });
  },updateAnnonce: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    // Params
    var desc = req.body.desc;
    var price = req.body.price;
    var qtite = req.body.qtite;
    var startHour = req.body.startHour;
    var endHour = req.body.endHour;

    asyncLib.waterfall([
      function(done) {
        models.Annonce.findOne({
          attributes: ['id'],
          where: { idRestoUser: userId }
        }).then(function (annonceFound) {
          done(null, annonceFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify annonceFound' });
        });
      },
      function(annonceFound, done) {
        if(annonceFound) {
          annonceFound.update({
            desc: (desc ? desc : annonceFound.desc),
            price: (price ? price : annonceFound.price),
            qtite: (qtite ? qtite : annonceFound.qtite),
            startHour: (startHour ? startHour : annonceFound.startHour),
            endHour: (endHour ? endHour : annonceFound.endHour)
          }).then(function() {
            done(annonceFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot update annonce' });
          });
        } else {
          res.status(404).json({ 'error': 'annonce not found' });
        }
      },
    ], function(annonceFound) {
      if (annonceFound) {
        return res.status(201).json(annonceFound);
      } else {
        return res.status(500).json({ 'error': 'cannot update annonce' });
      }
    });
  },updateState: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    // Params
    var isActive = req.body.isActive;

    asyncLib.waterfall([
      function(done) {
        models.Annonce.findOne({
          attributes: ['id'],
          where: { idRestoUser: userId }
        }).then(function (annonceFound) {
          done(null, annonceFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify annonceFound' });
        });
      },
      function(annonceFound, done) {
        if(annonceFound) {
          annonceFound.update({
            isActive: isActive
          }).then(function() {
            done(annonceFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot update annonce' });
          });
        } else {
          res.status(404).json({ 'error': 'annonce not found' });
        }
      },
    ], function(annonceFound) {
      if (annonceFound) {
        return res.status(201).json(annonceFound);
      } else {
        return res.status(500).json({ 'error': 'cannot update annonce' });
      }
    });
  },updateImg: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);

    if (userId < 0)
      return res.status(400).json({ 'error': 'wrong token' });

    // Params
    var imgUrl = req.body.imgUrl;

    asyncLib.waterfall([
      function(done) {
        models.Annonce.findOne({
          attributes: ['id'],
          where: { idRestoUser: userId }
        }).then(function (annonceFound) {
          done(null, annonceFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify annonceFound' });
        });
      },
      function(annonceFound, done) {
        if(annonceFound) {
          annonceFound.update({
            piUrl: imgUrl
          }).then(function() {
            done(annonceFound);
          }).catch(function(err) {
            res.status(500).json({ 'error': 'cannot update annonce' });
          });
        } else {
          res.status(404).json({ 'error': 'annonce not found' });
        }
      },
    ], function(annonceFound) {
      if (annonceFound) {
        return res.status(201).json(annonceFound);
      } else {
        return res.status(500).json({ 'error': 'cannot update annonce' });
      }
    });
  }
}