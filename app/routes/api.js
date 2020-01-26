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

Array.prototype.removeIf = function(callback) {
    var i = 0;
    while (i < this.length) {
        if (callback(this[i], i)) {
            this.splice(i, 1);
        }
        else {
            ++i;
        }
    }
};



// User Api
router.get('/user/:userid', check_token, (req, res) => {
    var userid = req.params.userid;
    users.getById(userid)
    .then(data => {
        console.log(data)
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

function removeIdenticalComments(commentArray)
{
    var ids = []
    var final_array = [];

    for(let x = 0; x < commentArray.length; x++)
    {
        // remove duplicates
        if(ids.find(id => id.equals(commentArray[x].comment._id)) === undefined)
        {
            final_array.push(commentArray[x]);
            ids.push(commentArray[x].comment._id);
        }
    }

    return final_array;
}

router.get('/user/:userid/posts', check_token, (req, res) => {
    var userid = req.params.userid;
    posts.getByUser(userid)
    .then(data => {
        var new_array = Array.from(data);
        new_array.map(post => {
            post['poster'] = post.poster[0];
            post.comments.removeIf( el => {
                return el.comment._id === undefined
            });
            post['comments'].map(comment_dict => comment_dict.comment.poster = comment_dict.comment.poster[0])
            post['comments'] = removeIdenticalComments(post.comments)
        })
        res.jsonp(new_array);
    })
    .catch(err => res.status(500).jsonp(err));
})

router.put('/user/:userid/subscribed_tags', check_token, (req, res) => {
    var userid = req.params.userid;
    users.updateSubscribeTags(userid, req.body.tags)
    .then(data => res.jsonp(data))
    .catch(err => res.status(500).jsonp(err));
})

router.put('/user/:userid/profile_pic', check_token, (req,res) => {
    var userid = req.params.userid;
    users.updateProfilePic(userid, req.body.profile_pic)
        .then(data => res.jsonp(data))
        .catch(err => res.status(500).jsonp(err));
})

router.post('/post/:idpost/comment', check_token, (req, res) => {
    let date = new Date();
    let comment = {
        date: date.toISOString(),
        content: req.body.content,
        from: req.body.from
    }

    posts.addComment(req.params.idpost, comment)
    .then(data => res.jsonp(data))
    .catch(err => res.status(500).jsonp(err))
})

router.delete('/post/:idpost/comment/:idcomment', check_token, (req,res) => {

    posts.deleteComment(req.params.idpost, req.params.idcomment)
    .then(data => res.jsonp(data))
    .catch(err => res.status(500).jsonp(err))
})

router.get('/posts/:userid', check_token, function (req, res) {
    posts.getByUser(req.params.userid)
        .then(data => {
            var new_array = Array.from(data);
            new_array.map(post => {
                post['poster'] = post.poster[0];
                post.comments.removeIf( el => {
                    return el.comment._id === undefined
                });
                post['comments'].map(comment_dict => comment_dict.comment.poster = comment_dict.comment.poster[0])
                post['comments'] = removeIdenticalComments(post.comments)
            })
            res.jsonp(new_array);
        })
        .catch(err => res.status(500).jsonp(err))
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
    .then(data => {
        var new_array = Array.from(data);
        new_array.map(post => {
            post['poster'] = post.poster[0];
            post.comments.removeIf( el => {
                return el.comment._id === undefined
            });
            post['comments'].map(comment_dict => comment_dict.comment.poster = comment_dict.comment.poster[0])
            post['comments'] = removeIdenticalComments(post.comments)
        })
        res.jsonp(new_array[0]);
    })
    .catch(err => res.status(500).jsonp(err));
})


router.get('/posts', check_token, function(req, res, next) 
{
    if(req.query['tag'])
    {
        
        if(req.query.tag instanceof Array)
        {
            posts.getByTags(req.query.tag)
            .then(data => {
                //console.dir(data);
                var new_array = Array.from(data);
                new_array.map(post => {
                    post['poster'] = post.poster[0];
                    post.comments.removeIf( el => {
                        return el.comment._id === undefined
                    });
                    post['comments'].map(comment_dict => comment_dict.comment.poster = comment_dict.comment.poster[0])
                    post['comments'] = removeIdenticalComments(post.comments)
                })
                res.jsonp(new_array);
                /*
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
                        new_array[j].poster_pic = values[j][0].profile_pic;
                        var new_promises = [];
                        for(let k = 0; k < new_array[j].comments.length; k++) {
                            new_promises.push(users.getById(new_array[j].comments[k].from));
                        }
                        
                        var new_comments = Array.from(new_array[j].comments)
                        Promise.all(new_promises)
                            .then(values1 => {
                                for(let h = 0; h < values1.length; h++) {
                                    new_comments[h].comment_pic = values1[h][0].profile_pic
                                    console.log(new_comments[h])
                                }
                            })
                            .catch(err => res.status(500).jsonp(err))
                    }
                    var ids = []
                    var final_array = [];

                    for(let x = 0; x < new_array.length; x++)
                    {
                        // remove duplicates
                        if(ids.find(id => id.equals(new_array[x]._id)) === undefined)
                        {
                            final_array.push(new_array[x]);
                            ids.push(new_array[x]._id);
                        }
                    }
                    
                    res.jsonp(final_array);
                })
                .catch(err => res.status(500).jsonp(err));
                */
            })
            .catch(err => res.status(500).jsonp(err));
        }
        else
        {
            posts.getByTag(req.query.tag)
            .then(data => {
                console.log("Getting posts by tag: " + req.query.tag)
                console.dir(data)
                var new_array = Array.from(data);
                new_array.map(post => {
                    post['poster'] = post.poster[0];
                    post.comments.removeIf( el => {
                        return el.comment._id === undefined
                    });
                    post['comments'].map(comment_dict => {
                        comment_dict.comment.poster = comment_dict.comment.poster[0];
                    })
                    post['comments'] = removeIdenticalComments(post.comments)
                    
                })
                res.jsonp(new_array);
            })
            .catch(err => res.status(500).jsonp(err));
        }
    }
    else
    {
        var start = 0;
        if(req.query['start'])
            start = parseInt(req.query.start);

        var limit = 25; // Only show 25 publications at a time
        if(req.query['limit'])
            limit = parseInt(req.query.limit);


        posts.getRecent(start, limit)
        .then(data => {
            var new_array = Array.from(data);
            new_array.map(post => {
                post['poster'] = post.poster[0];
                post.comments.removeIf( el => {
                    return el.comment._id === undefined
                });
                post['comments'].map(comment_dict => comment_dict.comment.poster = comment_dict.comment.poster[0])
                post['comments'] = removeIdenticalComments(post.comments)
            })
            res.jsonp(new_array);
        })
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
