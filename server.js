//Imports
var express = require('express');
var bodyParser = require('body-parser');
var apiRouter   = require('./apiRouter').router;
var cors = require('cors');
var port = process.env.PORT || 8080;
var multer =  require('multer');
var path = require('path');


//Instantiate server
var server = express();


//UploadImg
var multer  = require('multer');
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './uploads');
    },
    filename: (req, file, cb) => {
      console.log(file);
      var filetype = 'jpg';
      if(file.mimetype === 'image/gif') {
        filetype = 'gif';
      }
      if(file.mimetype === 'image/png') {
        filetype = 'png';
      }
      if(file.mimetype === 'image/jpeg') {
        filetype = 'jpg';
      }
      cb(null, 'image-' + Date.now() + '.' + filetype);
    }
});
var upload = multer({storage: storage});
var router = express();
router.post('/upload',upload.single('file'),function(req, res, next) {
      console.log(req.file);
      if(!req.file) {
        res.status(500);
        return next(err);
      }
      res.json(req.file.filename);
});
server.use('/uploads', express.static(__dirname + '/uploads'));


//Body Parser conf
server.use(bodyParser.urlencoded({extended : true}));
server.use(bodyParser.json());


//Configures routes
server.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bienvenue sur lAPI listoo</h1>');
});

server.get('/reset/:token', function(req, res) {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).sendFile(path.join(__dirname + '/reset.html'));
});
server.use(cors());


server.use('/api/', apiRouter);
server.use('/apiImg/', router);

//Launch server
server.listen(port, function(){
    console.log('server listening');
});