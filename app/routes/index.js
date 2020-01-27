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
function getTagsString(tags)
{
	var tag_string = ""
	for(let i = 0; i < tags.length; i++)
	{
		//tag_string += "&tag=" + tags[i].toLowerCase();
		tag_string += "&tag=" + tags[i].toLowerCase();
	}
	return tag_string
}

function renderUserPage(res, user) {
	tags = getTagsString(user.subscribed_tags)
	axios.get(getAPIURL('posts') + tags)
	.then(response => {
		//console.dir(response.data);
		res.render('main/main_page',
		{
			title: 'Página principal', 
			user: user, 
			posts: response.data
		});
	})
	.catch(err => res.render('error', {error: err}));
}

router.get('/chat', verificaAutenticao, function(req, res, next) {

  res.render('chat', { title: 'Chat Room' });
});

router.get('/posts', verificaAutenticao, function(req,res) {

	axios.get(getAPIURL('posts') + "&" + url.parse(req.url).query)
	.then(response => {
		if (req.query.tag) {
			res.render('main/posts_page', {user: req.user, posts: response.data});
		} else if(req.query.q) {
			res.render('main/posts_page', {user: req.user, posts: response.data,
			searched: req.query.q});
		} else {
			res.render('main/posts_page', {user: req.user, posts: response.data})
		}
	})
	.catch(err => res.render('error', {error: err, message:"----> there was a problem getting the posts"}));
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
		res.render('authentication/index');
	}
});

router.get('/register', function(req,res) {
	if(req.isAuthenticated())
	{
		res.redirect('/');
	}

  	res.render('authentication/register', {title: 'Registar'});
});

router.get('/logout', function(req,res) {
	req.session.destroy();
	res.redirect('/');
});

router.post('/register', function(req, res) {
	var hash = bcrypt.hashSync(req.body.password, 10);
    axios.post(getAPIURL('user/'), {
		full_name: req.body.full_name,
        id: req.body.id,
		password: hash,
		course: req.body.course,
		subscribed_tags: [req.body.course]
    })
    .then(dados => res.redirect('/'))
    .catch(err => {	console.log("cusro = " + req.body.course)
 		if(req.body.course === "")
 			m = "----> you need to select a course"
 		else
 			m ="----> the user already exists"
    	res.render('error', {error: err, message:m })
    });
})

router.get('/login', function(req, res) {
	if(req.isAuthenticated())
	{
		res.redirect('/');
	}

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
	


router.get('/user/:userid', verificaAutenticao, (req, res) => {
	axios.get(getAPIURL('user/' + req.params.userid))
		.then(res1 => {
			var can_edit = req.user.id === req.params.userid
			var user = res1.data[0];
			axios.get(getAPIURL('posts/' + req.params.userid))
				.then(res2 => {
					res.render('main/user_page', {user: req.user, searched_user: user, posts: res2.data, can_edit: can_edit})
				})
				.catch(err => res.render('error', { error: err, message: "----> there was a problem getting your posts" }))
		})
		.catch(err => res.render('error', { error: err, message: "----> there was a problem getting the user" }))
})

router.get('/user/', verificaAutenticao, (req, res) => {
	res.redirect('/user/' + req.user.id);
})

router.put('/user/:userid/subscribed_tags', verificaAutenticao, (req, res) => {
	var tags = JSON.parse( req.body.tags )
	tags = tags.map((tag_dict) => tag_dict['value'].toLowerCase());
	axios.put(getAPIURL("/user/" + req.user.id + "/subscribed_tags"), {tags: tags})
		.then(response => {
			res.jsonp(response.data)
		})
		.catch(err => res.render('error', {error: err}))
}) 

router.post('/user/profile_pic', verificaAutenticao, upload.single('profile_pic'), (req,res) => {
	console.dir(req.file)
	var new_profile_pic = req.file
	axios.put(getAPIURL("/user/" + req.user.id + "/profile_pic"), 
		{ profile_pic: new_profile_pic }
	)
	.then(response => {
		res.redirect('/user/' + req.user.id)
	})
	.catch(err => res.render('error', {error: err, message:"----> there was a problem setting the profile picture "}))
})

router.post('/post/:idpost/comment', verificaAutenticao, (req,res) => {
	axios.post(getAPIURL('post/' + req.params.idpost + "/comment"), {
		from: req.user.id,
		content: req.body.content
	})
	//.then(data => res.redirect('/post/' + req.params.idpost))
	.then(response => res.jsonp(response.data))
	.catch(err => res.render('error', {error: err}))
})

router.delete('/post/:idpost/comment/:idcomment', verificaAutenticao, (req,res) => {
	axios.delete(getAPIURL('post/' + req.params.idpost + "/comment/" + req.params.idcomment))
	.then(response => res.jsonp(response.data))
	.catch(err => res.render('error', {error: err, message: `----> we couldnt delete your comment ${req.params.idcomment} from the post with the id: ${req.params.idpost}`}))
})

router.get('/post/:idpost', verificaAutenticao, (req, res) => {
	axios.get(getAPIURL('post/' + req.params.idpost))
	.then(response => res.render('main/post-page', {p: response.data, user: req.user}))
	.catch(err => res.render('error', {error: err, message: `----> Cant find the post with the id: ${req.params.idpost}`}))
})

router.post('/post', verificaAutenticao, upload.array('files'), function (req, res) {
	console.log("Post front-page: ");
	console.dir(req.body);
	var tags = JSON.parse( req.body.tags )
	tags = tags.map((tag_dict) => tag_dict['value'].toLowerCase());
	axios.post(getAPIURL('post/'), {
		user_id: req.user.id,
        title: req.body.title,
		tags: tags,
		content: req.body.content,
		files: req.files,
    })
    .then(_ => res.redirect('/'))
    .catch(err => res.render('error', {error: err}));
})

router.get('/all', verificaAutenticao, function (req, res) {
	axios.get(getAPIURL(posts()))
})
router.get('/file/:filename', verificaAutenticao, function(req,res) {
	res.download(__dirname + '/../public/ficheiros/' + req.params.filename)
})

function verificaAutenticao(req, res, next) {
	if(req.isAuthenticated())
	{
		next();
	}
	else
	{
		res.redirect('/');
	}

}

module.exports = router;
