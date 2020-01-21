var express = require('express');
var router = express.Router();
var axios = require('axios');
var url = require('url');
var bcrypt = require('bcryptjs')

var config = require('../config/env.js');
var passport = require('passport');
var apihelper = require('../helpers/api_url.js');

/* GET home page. */
function renderUserPage(res, username) {

}

router.get('/posts', verificaAutenticao, function(req,res) {
	axios.get(getAPIURL('api/posts' + url.parse(req.url).query))
	.then(response => {
		res.render('posts-page', {posts: response.data});
	})
	.catch(err => res.render('error', {error: err}));
});

router.get('/', function(req, res, next) {
	if(req.isAuthenticated())
	{
		renderUserPage(res, req.user.username);
	}
	else
	{
		res.render('index', { title: 'Homepage' });
	}
});

router.get('/register', function(req,res) {
  	res.render('register', {title: 'Registar'});
});

router.post('/register', function(req, res) {
	var hash = bcrypt.hashSync(req.body.password, 10);
    axios.post(apihelper.getAPIURL('user/'), {
        id: req.body.id,
        username: req.body.username,
		password: hash,
		full_name: req.body.full_name,
		course: req.body.course,
		subscribed_tags: []
    })
    .then(dados => res.redirect('/'))
    .catch(err => res.render('error', {error: err}));
})

router.get('/login', function(req, res) {
  	res.render('login', {title: 'Login'});
});

router.post('/login', passport.authenticate('local', {
		successRedirect: "/",
		failureRedirect: "/login"
	})
);


router.get('/main', function (req, res) {
	res.render('main_page');
})


function verificaAutenticao(req, res, next) {
	if(req.isAuthenticated())
	{
		next();
	}
	else
	{
		res.redirect('/login');
	}

}

module.exports = router;
