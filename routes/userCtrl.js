//Imports 

var bcrypt = require('bcrypt');
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');
const nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');

// Constants
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{6,15}$/;

//Routes

module.exports = {
    registerUser: function(req, res) {

            // Params
        var email    = req.body.email;
        var fName = req.body.fName;
        var sName = req.body.sName;
        var tel = req.body.tel;
        var city = req.body.city;
        var zip = req.body.zip;
        var address = req.body.address;
        var age = req.body.age;
        var password = req.body.password;

        if (email == null || password == null || fName == null || sName == null || tel == null || city == null || zip == null || address == null || age == null) {
            return res.status(400).json({ 'error': 'missing parameters' });
          }
      
          if (!EMAIL_REGEX.test(email)) {
            return res.status(400).json({ 'error': 'email is not valid' });
          }
      
          if (!PASSWORD_REGEX.test(password)) {
            return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
          }

          asyncLib.waterfall([
            function(done) {
              models.User.findOne({
                attributes: ['email'],
                where: { email: email }
              })
              .then(function(userFound) {
                done(null, userFound);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': err });

                    });
            },
            function(userFound, done) {
              if (!userFound) {
                bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
                  done(null, userFound, bcryptedPassword);
                });
              } else {
                return res.status(409).json({ 'error': 'user already exist' });
              }
            },
            function(userFound, bcryptedPassword, done) {
              var newUser = models.User.create({
                isResto: false,
                email: email,
                password: bcryptedPassword,
                sName: sName,
                fName: fName,
                address: address,
                city: city,
                zip: zip,
                tel: tel,
                age: age,
                restoName: null,
                restoType: null
              })
              .then(function(newUser) {
                done(newUser);
              })
              .catch(function(err) {
                return res.status(500).json({ 'error': 'cannot add user' });
              });
            }
          ], function(newUser) {
            if (newUser) {
              return res.status(201).json({
                'userId': newUser.id
              });
            } else {
              return res.status(500).json({ 'error': 'cannot add user' });
            }
          });
    },
    updatePwd: function(req, res) {
    // Getting auth header
    var headerAuth  = req.headers['authorization'];
    var userId      = jwtUtils.getUserId(headerAuth);
        // Params
    var password = req.body.password;
  
      if (!PASSWORD_REGEX.test(password)) {
        return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
      }

      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            attributes: ['id'],
            where: { id: userId }
          })
          .then(function(userFound) {
            done(null, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        },
        function(userFound, done) {
          if (userFound) {
            bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
              done(null, userFound, bcryptedPassword);
            });
          } else {
            return res.status(404).json({ 'error': 'user not found' });
          }
        },
        function(userFound, bcryptedPassword, done) {
          userFound.update({
            password: (password ? bcryptedPassword : userFound.bcryptedPassword),
          })
          .then(function(newUser) {
            done(userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'cannot update user' });
          });
        }
      ], function(userFound) {
        if (userFound) {
          return res.status(201).json({
            'userId': userFound.id
          });
        } else {
          return res.status(500).json({ 'error': 'cannot update user' });
        }
      });
      },registerResto: function(req, res) {

      // Params
  var email    = req.body.email;
  var fName = req.body.fName;
  var sName = req.body.sName;
  var tel = req.body.tel;
  var city = req.body.city;
  var zip = req.body.zip;
  var address = req.body.address;
  var password = req.body.password;
  var restoName = req.body.restoName;
  var restoType = req.body.restoType;

  if (email == null || password == null || fName == null || sName == null || tel == null || city == null || zip == null || address == null || restoName == null || restoType == null) {
      return res.status(400).json({ 'error': 'missing parameters' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ 'error': 'email is not valid' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({ 'error': 'password invalid (must length 4 - 8 and include 1 number at least)' });
    }

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['email'],
          where: { email: email }
        })
        .then(function(userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'unable to verify user' });
        });
      },
      function(userFound, done) {
        if (!userFound) {
          bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
            done(null, userFound, bcryptedPassword);
          });
        } else {
          return res.status(409).json({ 'error': 'user already exist' });
        }
      },
      function(userFound, bcryptedPassword, done) {
        var newUser = models.User.create({
          isResto: true,
          email: email,
          password: bcryptedPassword,
          sName: sName,
          fName: fName,
          address: address,
          city: city,
          zip: zip,
          tel: tel,
          age: null,
          restoName: restoName,
          restoType: restoType
        })
        .then(function(newUser) {
          done(newUser);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'cannot add user' });
        });
      }
    ], function(newUser) {
      if (newUser) {
        return res.status(201).json({
          'userId': newUser.id
        });
      } else {
        return res.status(500).json({ 'error': 'cannot add user' });
      }
    });
},loginUser: function(req, res) {
    
      // Params
      var email    = req.body.email;
      var password = req.body.password;
  
      if (email == null ||  password == null || email == "" ||  password == "") {
        return res.status(400).json({ 'error': 'missing parameters' });
      }
  
      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            where: { email: email, isResto: false }
          })
          .then(function(userFound) {
            done(null, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        },
        function(userFound, done) {
          if (userFound) {
            bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
              done(null, userFound, resBycrypt);
            });
          } else {
            return res.status(404).json({ 'error': 'user not exist in DB' });
          }
        },
        function(userFound, resBycrypt, done) {
          if(resBycrypt) {
            done(userFound);
          } else {
            return res.status(403).json({ 'error': 'invalid password' });
          }
        }
      ], function(userFound) {
        if (userFound) {
          return res.status(201).json({
            'userId': userFound.id,
            'token': jwtUtils.generateTokenForUser(userFound)
          });
        } else {
          return res.status(500).json({ 'error': 'cannot log on user' });
        }
      });
    },loginUserFB: function(req, res) {
    
      // Params
      var email    = req.body.email;
  
      if (email == null  || email == "") {
        return res.status(400).json({ 'error': 'missing parameters' });
      }
  
      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            where: { email: email, isResto: false }
          })
          .then(function(userFound) {
            done(null, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        },
        function(userFound, done) {
          if (userFound) {
            done(userFound)
          } else {
            return res.status(404).json({ 'error': 'user not exist in DB' });
          }
        }
      ], function(userFound) {
        if (userFound) {
          return res.status(201).json({
            'userId': userFound.id,
            'token': jwtUtils.generateTokenForUser(userFound)
          });
        } else {
          return res.status(500).json({ 'error': 'cannot log on user' });
        }
      });
    },loginResto: function(req, res) {
    
      // Params
      var email    = req.body.email;
      var password = req.body.password;
  
      if (email == null ||  password == null || email == "" ||  password == "") {
        return res.status(400).json({ 'error': 'missing parameters' });
      }
  
      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            where: { email: email, isResto: true }
          })
          .then(function(userFound) {
            done(null, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        },
        function(userFound, done) {
          if (userFound) {
            bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
              done(null, userFound, resBycrypt);
            });
          } else {
            return res.status(404).json({ 'error': 'user not exist in DB' });
          }
        },
        function(userFound, resBycrypt, done) {
          if(resBycrypt) {
            done(userFound);
          } else {
            return res.status(403).json({ 'error': 'invalid password' });
          }
        }
      ], function(userFound) {
        if (userFound) {
          return res.status(201).json({
            'userId': userFound.id,
            'token': jwtUtils.generateTokenForUser(userFound)
          });
        } else {
          return res.status(500).json({ 'error': 'cannot log on user' });
        }
      });
    },getProfile: function(req, res) {
      // Getting auth header
      var headerAuth  = req.headers['authorization'];
      var userId      = jwtUtils.getUserId(headerAuth);
  
      if (userId < 0)
        return res.status(400).json({ 'error': 'wrong token' });
  
      models.User.findOne({
        attributes: [ 'id', 'email', 'sName', 'fName', 'address', 'city', 'zip', 'tel', 'age', 'restoName', 'restoType' ],
        where: { id: userId }
      }).then(function(user) {
        if (user) {
          res.status(201).json(user);
        } else {
          res.status(404).json({ 'error': 'user not found' });
        }
      }).catch(function(err) {
        res.status(500).json({ 'error': 'cannot fetch user' });
      });
    },getUser: function(req, res) {
      // Getting auth header
      var headerAuth  = req.headers['authorization'];
      var userId      = jwtUtils.getUserId(headerAuth);

      var userToGet      = req.params.id;
  
      if (userId < 0)
        return res.status(400).json({ 'error': 'wrong token' });
  
      models.User.findOne({
        attributes: [ 'id', 'email', 'sName', 'fName', 'address', 'city', 'zip', 'tel', 'age', 'restoName', 'restoType' ],
        where: { id: userToGet }
      }).then(function(user) {
        if (user) {
          res.status(201).json(user);
        } else {
          res.status(404).json({ 'error': 'user not found' });
        }
      }).catch(function(err) {
        res.status(500).json({ 'error': 'cannot fetch user' });
      });
    },
    updateProfile: function(req, res) {
      // Getting auth header
      var headerAuth  = req.headers['authorization'];
      var userId      = jwtUtils.getUserId(headerAuth);
  
      // Params
      var email = req.body.email;
      var sName = req.body.sName;
      var fName = req.body.fName;
      var address = req.body.address;
      var city = req.body.city;
      var zip = req.body.zip;
      var tel = req.body.tel;
      var age = req.body.age;
      var restoName = req.body.restoName;
      var restoType = req.body.restoType;
  
      asyncLib.waterfall([
        function(done) {
          models.User.findOne({
            attributes: ['id', 'email'],
            where: { id: userId }
          }).then(function (userFound) {
            done(null, userFound);
          })
          .catch(function(err) {
            return res.status(500).json({ 'error': 'unable to verify user' });
          });
        },
        function(userFound, done) {
          if(userFound) {
            userFound.update({
              email: (email ? email : userFound.email),
              sName: (sName ? sName : userFound.sName),
              fName: (fName ? fName : userFound.fName),
              address: (address ? address : userFound.address),
              city: (city ? city : userFound.city),
              zip: (zip ? zip : userFound.zip),
              tel: (tel ? tel : userFound.tel),
              age: (age ? age : userFound.age),
              restoName: (restoName ? restoName : userFound.restoName),
              restoType: (restoType ? restoType : userFound.restoType),
            }).then(function() {
              done(userFound);
            }).catch(function(err) {
              res.status(500).json({ 'error': 'cannot update user' });
            });
          } else {
            res.status(404).json({ 'error': 'user not found' });
          }
        },
      ], function(userFound) {
        if (userFound) {
          return res.status(201).json(userFound);
        } else {
          return res.status(500).json({ 'error': 'cannot update user profile' });
        }
      });
    },sendMail: function(req, res) {
      var email = req.body.email;
      let transporter = nodemailer.createTransport(smtpTransport({
        host: "ssl0.ovh.net",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "valentin@valideoc.com", // generated ethereal user
          pass: "Val2407entin"// generated ethereal password
        }
      }));
      models.User.findOne({
        attributes: [ 'id', 'email', 'sName', 'fName'],
        where: { email: email }
      }).then(function(user) {
        if (user) {
          var token = jwtUtils.generateTokenForUser(user);
          var mailOptions = {
            from: '"Listoo" <noreply@listoo.com>', // sender address
            to: user.email, // list of receivers
            subject: "Réinitialisation de mot de passe Listoo", // Subject line
            text: "Lien pour réinitialiser votre mot de passe : http://5.51.150.55:8080/reset/"+token, // plain text body
          };
          transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              res.status(500).json({ 'error': 'Impossible' });
              console.log(error);
            } else {
              res.status(201).json("Message envoyé");
            }
          });
        } else {
          res.status(404).json({ 'error': 'user not found' });
        }
      }).catch(function(err) {
        console.log(err);
        res.status(500).json({ 'error': 'cannot fetch user' });
      });
    }
  }
