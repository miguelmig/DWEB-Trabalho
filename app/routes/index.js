var express = require('express');
var router = express.Router();
var axios = require('axios');
var url = require('url');
var bcrypt = require('bcryptjs');

var postsController = require('../controllers/posts');

var config = require('../config/env.js');
var passport = require('passport');
var {getAPIURL} = require('../helpers/api_url.js');

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

/* GET home page. */
function renderUserPage(res, user) {
	axios.get(getAPIURL('posts') + '&tag=random')
	.then(response => {
		console.dir(response.data);
		res.render('main/main_page',
		{
			title: 'Página principal', 
			user: user, 
			posts: response.data
		});
	})
	.catch(err => res.render('error', {error: err}));
}

router.get('/posts', verificaAutenticao, function(req,res) {
	axios.get(getAPIURL('posts' + url.parse(req.url).query))
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
	}), function(req,res) {
			if (req.body.remember) {
				req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // Cookie expires after 30 days
			} 
			else {
				req.session.cookie.expires = false; // Cookie expires at end of session
			}
			res.redirect('/');
	}
);


router.get('/main', function (req, res) {
	
})


router.post('/post', verificaAutenticao, upload.array('files'), function (req, res) {
	console.log("Post front-page: ");
	console.dir(req.body);
	var tags = JSON.parse( req.body.tags )
	tags = tags.map((tag_dict) => tag_dict['value']);
	axios.post(getAPIURL('post/'), {
		user_id: req.user.id,
        title: req.body.title,
		tags: tags,
		content: req.body.content,
		files: req.files,
    })
    .then(data => res.redirect('/'))
    .catch(err => res.render('error', {error: err}));
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
