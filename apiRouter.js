var express      = require('express');
var usersCtrl    = require('./routes/userCtrl');
var annoncesCtrl    = require('./routes/annonceCtrl');
var commandesCtrl    = require('./routes/commandeCtrl');

// Router
exports.router = (function() {
    var apiRouter = express.Router();
    var router = express();
  
    // Users routes
    apiRouter.route('/users/registerUser/').post(usersCtrl.registerUser);
    apiRouter.route('/users/registerResto/').post(usersCtrl.registerResto);
    apiRouter.route('/users/loginUser/').post(usersCtrl.loginUser);
    apiRouter.route('/users/loginResto/').post(usersCtrl.loginResto);
    apiRouter.route('/users/me/').get(usersCtrl.getProfile);
    apiRouter.route('/users/me/').put(usersCtrl.updateProfile);
    apiRouter.route('/users/resetPwd/').put(usersCtrl.updatePwd);
    apiRouter.route('/users/sendMail/').post(usersCtrl.sendMail);

    //Annonces routes
    apiRouter.route('/annonce/create/').post(annoncesCtrl.create);
    apiRouter.route('/getAnnonce/').get(annoncesCtrl.getAnnonce);
    apiRouter.route('/annonce/update/').put(annoncesCtrl.updateAnnonce);
    apiRouter.route('/annonce/updateState/').put(annoncesCtrl.updateState);
    apiRouter.route('/annonce/updateImg/').put(annoncesCtrl.updateImg);
    

    //Commandes routes
    apiRouter.route('/commande/create/').post(commandesCtrl.create);
    apiRouter.route('/commandes/user/').get(commandesCtrl.getCommandesByUser);
    apiRouter.route('/commandes/resto/').get(commandesCtrl.getCommandesByResto);
    apiRouter.route('/commandes/').get(commandesCtrl.getAllCommandes);
  
    return apiRouter;
  })();