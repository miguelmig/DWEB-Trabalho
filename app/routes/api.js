var express = require('express');
var router = express.Router();
var posts = require('../controllers/posts');
var users = require('../controllers/users');
var url = require('url');

// User Api
router.get('/user/:userid', (req, res) => {
    var userid = req.params.userid;
    users.getById(userid)
    .then(data => {
        res.jsonp(data);
    })
    .catch(err => {
        res.status(500).jsonp(err);
    });
})

router.post('/user/', (req, res) => {
    users.add(req.body)
    .then(data => res.redirect('/'))
    .catch(err => res.status(500).jsonp(err));
})

router.get('/user/:userid/posts', (req, res) => {
    var userid = req.params.userid;
    posts.getByUser(userid)
    .then(data => res.jsonp(data))
    .catch(err => res.status(500).jsonp(err));
})

router.post('/post', (req, res) => {
    posts.add(req.body)
        .then(data => res.jsonp(data))
        .catch(err => res.status(500).jsonp(err));
})

router.post('/post/:postid', (req, res) => {
    var postid = req.params.postid;
    posts.getById(postid)
    .then(data => res.jsonp(data))
    .catch(err => res.status(500).jsonp(err));
})


router.get('/posts', function(req, res, next) 
{
    console.log(req.query)
    if(req.query['tag'])
    {
        posts.getByTag(req.query.tag)
        .then(data => res.jsonp(data))
        .catch(err => res.status(500).jsonp(err));
    }
    else
    {
        var start = 0;
        if(req.query['start'])
            start = parseInteger(req.query.start);

        var limit = 25; // Only show 25 publications at a time
        if(req.query['limit'])
            limit = parseInteger(req.query.limit);


        posts.getRecent(start, limit)
        .then(data => res.jsonp(data))
        .catch(err => res.jsonp(err));
    }

});

module.exports = router;
