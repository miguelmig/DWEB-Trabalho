var express = require('express');
var router = express.Router();
var axios = require('axios');
var url = require('url');
var bcrypt = require('bcryptjs')

var config = require('../config/env.js');
var passport = require('passport');
var apihelper = require('../helpers/api_url.js');

/* GET home page. */
function renderUserPage(res, user) {
	res.render('main/main_page', {user: user});
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
		console.log("Authenticated, sending to main page");
		renderUserPage(res, req.user);
	}
	else
	{
		console.log("Not authenticated! Sending to front page");
		res.render('main/main_page', { title: 'Homepage' });
	}
});

router.get('/register', function(req,res) {
  	res.render('authentication/register', {title: 'Registar'});
});

router.post('/register', function(req, res) {
	var hash = bcrypt.hashSync(req.body.password, 10);
    axios.post(apihelper.getAPIURL('user/'), {
		full_name: req.body.full_name,
        id: req.body.id,
		password: hash,
		course: req.body.course,
		subscribed_tags: []
    })
    .then(dados => res.redirect('/'))
    .catch(err => res.render('error', {error: err}));
})

router.get('/login', function(req, res) {
  	res.render('authentication/login', {title: 'Conetar'});
});

router.post('/login', passport.authenticate('local', {
		failureRedirect: "/login"
	}), function (req, res) {
		if (req.body["remember-me"]) {
			req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
		  } else {
			req.session.cookie.expires = false; // Cookie expires at end of session
		  }
		res.redirect('/');
	}
);


router.get('/main', function (req, res) {
	res.render('main/main_page', {title: 'Página principal'});
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
