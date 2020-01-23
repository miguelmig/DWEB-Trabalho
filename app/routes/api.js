var express = require('express');
var router = express.Router();
var posts = require('../controllers/posts');
var users = require('../controllers/users');
var chat_messages = require('../controllers/chat_message');
var url = require('url');

const multer = require('multer');
var upload = multer({dest: 'uploads/'});

const Ficheiro = require('../models/file');
const fs = require('fs');


// User Api
router.get('/user/:userid', check_token, (req, res) => {
    var userid = req.params.userid;
    users.getById(userid)
    .then(data => {
        res.jsonp(data);
    })
    .catch(err => {
        res.status(500).jsonp(err);
    });
})

router.post('/user/', check_token, (req, res) => {
    users.getById(req.body.id)
    .then(data => {
        if(Array.isArray(data) && data.length)
        {
            res.status(409).jsonp({err: "That user already exists"});
        }
        else
        {
            users.add(req.body)
            .then(data => res.jsonp(data))
            .catch(err => res.status(500).jsonp(err));
        }
    })
    .catch(err => {
        res.status(500).jsonp(err);
    })
})

router.get('/user/:userid/posts', check_token, (req, res) => {
    var userid = req.params.userid;
    posts.getByUser(userid)
    .then(data => res.jsonp(data))
    .catch(err => res.status(500).jsonp(err));
})

router.put('/user/:userid/subscribed_tags', check_token, (req, res) => {
    var userid = req.params.userid;
    users.updateSubscribeTags(userid, req.body.tags)
    .then(data => res.jsonp(data))
    .catch(err => res.status(500).jsonp(err));
})

router.post('/post', check_token, upload.array('files'), (req, res) => {
    console.log("Entrei")
    console.dir(req.body)
    var promises = [];

    let date = new Date();
    let post = {
        date: date.toISOString(),
        user_id: req.body.user_id,
        title: req.body.title,
        tags: req.body.tags,
        content: req.body.content,
        attachments: [],
        comments: [],
    };

    if(req.body.files)
    {
        for(let i = 0; i < req.body.files.length; ++i)
        {
            let current_file = req.body.files[i];
            let old_path = __dirname + "/../" + current_file.path;
            let new_path = __dirname + '/../public/ficheiros/' + current_file.originalname;
            
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
    }

    console.log("cheguei aqui");

    posts.add(post)
    .then(post => {
        console.log("Post saved with sucess!");
        res.jsonp(post);
    })
    .catch(err => {
        console.error("Error saving a post");
        res.status(500).jsonp(err);
    });
})

router.get('/post/:postid', check_token, (req, res) => {
    var postid = req.params.postid;
    posts.getById(postid)
    .then(data => res.jsonp(data))
    .catch(err => res.status(500).jsonp(err));
})

router.get('/posts', check_token, function(req, res, next) 
{
    if(req.query['tag'])
    {
        console.dir(req.query.tag)
        if(req.query.tag instanceof Array)
        {
            posts.getByTags(req.query.tag)
            .then(data => {
                //console.dir(data);
                var promises = [];
                for(let i = 0; i < data.length; i++)
                {
                    promises.push(users.getById(data[i].user_id));
                }
                var new_array = Array.from(data);
                Promise.all(promises)
                .then(values => {
                    for(let j = 0; j < values.length; j++)
                    {
                        new_array[j].poster_name = values[j][0].full_name;
                    }
                    var ids = []
                    var final_array = [];

                    for(let x = 0; x < new_array.length; x++)
                    {
                        // remove duplicates
                        if(ids.find(id => id == new_array[x]['_doc']._id) === undefined)
                        {
                            final_array.push(new_array[x]);
                            ids.push(new_array[x]["_id"]);
                        }
                    }

                    res.jsonp(final_array);
                })
                .catch(err => res.status(500).jsonp(err));
            })
            .catch(err => res.status(500).jsonp(err));
            /*
            var posts_promises = []
            var tags = req.query['tag'];
            for(let i = 0; i < tags.length; i++)
            {
                posts_promises.push(posts.getByTag(req.query.tag[i]))
            }
            Promise.all(posts_promises)
            .then(datas => {
                var datas_flat = [].concat.apply([], datas);
                var promises = [];
                for(let k = 0; k < datas_flat.length; k++)
                {
                    var data = datas_flat[k];
                    promises.push(users.getById(data.user_id));
                }
                
                var new_array = Array.from(datas_flat);
                Promise.all(promises)
                .then(values => {
                    for(let j = 0; j < values.length; j++)
                    {
                        new_array[j]['_doc'].poster_name = values[j][0].full_name;
                    }
                    res.jsonp(new_array);
                })
                .catch(err => res.status(500).jsonp(err));
            })
            .catch(err => res.status(500).jsonp(err));
            */
        }
        else
        {
            posts.getByTag(req.query.tag)
            .then(data => {
                var promises = [];
                for(let i = 0; i < data.length; i++)
                {
                    promises.push(users.getById(data[i].user_id));
                }
                var new_array = Array.from(data);
                Promise.all(promises)
                .then(values => {
                    for(let j = 0; j < values.length; j++)
                    {
                        new_array[j]['_doc'].poster_name = values[j][0].full_name;
                    }
                    res.jsonp(new_array);
                })
                .catch(err => res.status(500).jsonp(err));
            })
            .catch(err => res.status(500).jsonp(err));
        }
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


function check_token(req, res, next)
{
    if(req.query['token'])
    {
        next();
    }
    else
    {
        //res.status(401).jsonp({"error": "Didn't send JWT token for authentication in API."});
        next();
    }
}

module.exports = router;
