var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// router.get('/status', function(req, res, next) {
//   res.render('partials/status');
// });

// router.get('/demand', function(req, res, next) {
//   console.log("calling demand route");
//   res.render('partials/demand');
// });

router.get('/partials/:name', function(req, res, next){
  var name = req.params.name;
  console.log('router /partials/:name', name)

  res.render('partials/' + name);
});

router.get('/partials/routes', function(req, res, next){
  res.render('partials/routes');
});

router.get('/routeEditor', function(req, res, next){
  console.log("returning routeEditor")
  res.render('routeEditor');
});

router.get('/maker', function(req, res, next){
  console.log("returning componentMaker")
  res.render('maker');
});

router.get('/numberPad', function(req, res, next){
  console.log("returning numberPad")
  res.render('numberPad');
});

router.get('/partials/uploader', function(req, res, next){
  res.render('uploader');
});


// router.get('/operations', function(req, res, next){
//   res.render('/partials/operations');
// });

// router.get('/workcenters', function(req, res, next){
//   console.log("this is the request", req)

//   res.render('/partials/workcenters');
// });

// router.get('/products', function(req, res, next){

//   res.render('/partials/products');
// });

// router.get('/templates/alerts', function(req, res, next){
//   //console.log("this is the request", req)
//   console.log("/alerts route")
//   res.render('/partials/workcenters');
// });



// exports.partials = function (req, res) {
//   var name = req.params.name;
//   res.render('partials/' + name);
// };

module.exports = router;
