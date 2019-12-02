var express = require('express');
var router = express.Router();
var axios = require('axios');

var lhost = require('../config/env').lhost;

/* GET home page. */
function renderUserPage(username) {

}

router.get('/', function(req, res, next) {
	res.render('index', { title: 'Homepage' });
});

router.get('/register', function(req,res) {
  	res.render('register', {title: 'Registar'});
});

router.get('/login', function(req, res) {
  	res.render('login', {title: 'Login'});
});


router.post('/post', function(req, res) {
	req.body['tags'] = []
	req.body['ficheiro'] = []
	axios.post(lhost + '/api/post', req.body)
		.then(_ => res.redirect('/'))
		.catch(error => res.render('error', { error: error }))
})



module.exports = router;
