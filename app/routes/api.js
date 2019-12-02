var express = require('express');
var router = express.Router();
var posts = require('../controllers/posts');
var users = require('../controllers/users');
var url = require('url');

const multer = require('multer');
var upload = multer({dest: 'uploads/'});

const Ficheiro = require('../models/file');



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

router.post('/post', upload.array('ficheiro'), (req, res) => {
    console.log("Entrei")
    var promises = [];

    let date = new Date();
    let post = {
        date: date.toISOString(),
        //user_id: req.user.id,
        user_id: 1,
        title: req.body.title,
        tags: req.body.tags,
        content: req.body.content,
        attachments: [],
        comments: [],
    };

    for(let i = 0; i < req.files.length; ++i)
    {
        let current_file = req.files[i];
        let old_path = __dirname + "/../" + current_file.path;
        let new_path = __dirname + '/../public/ficheiros' + current_file.originalname;
        
        fs.rename(old_path, new_path, err => {
            if(err)
            {
                throw err;
            }
        });
        
        post.attachments.push(new Ficheiro({
            name: current_file.originalname,
            mimetype: current_file.mimetype,
            size: current_file.size
        }));
    }

    post.save()
    .then(post => {
        console.log("Post saved with sucess!");
        res.jsonp(post);
    })
    .catch(err => {
        console.error("Error saving a post");
        res.status(500).jsonp(err);
    });
})

router.get('/post/:postid', (req, res) => {
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
