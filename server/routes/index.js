const express = require('express');
const router = express.Router();

const api = require("../utills/api");
const setUp  = require("../www/setup").initilizeSetup;


(async () => {

  const obj = new setUp();
  await api.setup();

  obj['initilizeSetup']();


})();

router.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    next();
});

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Exprexxo' });
});


router.get('/v1/*', api.serve());
router.post('/v1/*', api.serve());
router.put('/v1/*', api.serve());

module.exports = router;

module.exports = router;
