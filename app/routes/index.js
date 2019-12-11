var express = require('express');
var router = express.Router();
var axios = require('axios');
var url = require('url');

var lhost = require('../config/env').lhost;

/* GET home page. */
function renderUserPage(username) {

}


router.get('/posts', function(req,res) {
	axios.get(lhost + '/api/posts?' + url.parse(req.url).query)
	.then(response => {
		res.render('posts-page', {posts: response.data});
	})
	.catch(err => res.render('error', {error: err}));
});



router.get('/', function(req, res, next) {
	res.render('index', { title: 'Homepage' });
});

router.get('/register', function(req,res) {
  	res.render('register', {title: 'Registar'});
});

router.get('/login', function(req, res) {
  	res.render('login', {title: 'Login'});
});




module.exports = router;
