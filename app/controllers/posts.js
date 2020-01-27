const Post = require('../models/post');
const mongoose = require('mongoose')
/**
 * Adds a new post to the collection
 * 
 * @param {object} postData
 */
module.exports.add = (postData) => {
    const newPost = new Post({
        date: postData.date,
        user_id: postData.user_id,
        title: postData.title,
        tags: postData.tags,
        content: postData.content,
        attachments: postData.attachments,
        comments: postData.comments
    });

    return newPost.save();
}

/**
 * Deletes a post from the collection, given the id of said post
 * 
 * @param {string} postId
 */
module.exports.delete = (postId) => {
    return Post
            .findByIdAndDelete(postId)
            .exec();
}

/**
 * Returns the information of a post, given the id of said post
 * 
 * @param {string} postId
 */
module.exports.getById = (postId) => {
    return Post.aggregate([
        { "$match": { "_id" : mongoose.Types.ObjectId(postId) }},

        { "$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "id",
            "as": "poster"}}, 
        
        { "$unset": "poster.password"},

        { "$unwind": { 
            "path":"$comments",
            "preserveNullAndEmptyArrays": true
        }},
            
        { "$lookup": {
            "from": "users",
            "localField": "comments.from",
            "foreignField": "id",
            "as": "comments.poster"}}, 

        { "$unset": "comments.poster.password"},

        { "$group": {
            "_id": "$_id",
            "date": { "$first": "$date" },
            "user_id": { "$first": "$user_id" },
            "title": { "$first": "$title" },
            "content": { "$first": "$content" },
            "attachments": { "$first": "$attachments" },
            "comments": { "$push": {
                "comment": "$comments",
            }},
            "tags": { "$first": "$tags" },
            "poster": {"$first": "$poster"}
        }},

        { "$sort": { "date": -1 } }
    ]).exec();
}

/**
 * Returns a list of posts, given the user that posted said posts
 * 
 * @param {string} userId
 */
module.exports.getByUser = (userId) => {
    return Post.aggregate([
        { "$match": { "user_id" : userId }},

        { "$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "id",
            "as": "poster"}}, 
        
        { "$unset": "poster.password"},

        { "$unwind": { 
            "path":"$comments",
            "preserveNullAndEmptyArrays": true
        }},
            
        { "$lookup": {
            "from": "users",
            "localField": "comments.from",
            "foreignField": "id",
            "as": "comments.poster"}}, 

        { "$unset": "comments.poster.password"},

        { "$group": {
            "_id": "$_id",
            "date": { "$first": "$date" },
            "user_id": { "$first": "$user_id" },
            "title": { "$first": "$title" },
            "content": { "$first": "$content" },
            "attachments": { "$first": "$attachments" },
            "comments": { "$push": {
                "comment": "$comments"
            }},
            "tags": { "$first": "$tags" },
            "poster": {"$first": "$poster"}
        }},

        { "$sort": { "date": -1 } }
    ]).exec()
}

/**
 * Returns a list of posts that have the given tag
 * 
 * @param {string} tag
 */

module.exports.getByTag = (tag) => {
    return Post.aggregate([
        { "$addFields": { "tags_all": "$tags" }},
        { "$unwind": {
            "path": "$tags",
            "preserveNullAndEmptyArrays": true
        }},

        { "$match": { "tags" : tag }},

        { "$unset" : [ "tags" ] },

        { "$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "id",
            "as": "poster"}}, 
        
        { "$unset": "poster.password"},


        { "$unwind": { 
            "path":"$comments",
            "preserveNullAndEmptyArrays": true
        }},
            
        { "$lookup": {
            "from": "users",
            "localField": "comments.from",
            "foreignField": "id",
            "as": "comments.poster"}}, 

        { "$unset": "comments.poster.password"},
        
        { "$group": {
            "_id": "$_id",
            "date": { "$first": "$date" },
            "user_id": { "$first": "$user_id" },
            "title": { "$first": "$title" },
            "content": { "$first": "$content" },
            "attachments": { "$first": "$attachments" },
            "comments": { "$push": {
                "comment": "$comments"
            }},
            "tags": { "$first": "$tags_all" },
            "poster": {"$first": "$poster"}
        }},
        
        { "$sort": { "date": -1 } }
    ])
    .exec()
}

module.exports.getByTags = (tags) => {
    return Post
        .aggregate([
            { "$addFields": { "tags_all": "$tags" }},
            { "$unwind": {
                "path": "$tags",
                "preserveNullAndEmptyArrays": true
            }},

            {
                "$match": 
                {
                    "$expr":
                    {
                        "$in": [
                            "$tags",
                            tags
                        ]
                    }
                }
            },

            { "$unset" : [ "tags" ] },

            { "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "id",
                "as": "poster"}}, 
            
            { "$unset": "poster.password"},
            
            { "$unwind": { 
                "path":"$comments",
                "preserveNullAndEmptyArrays": true
            }},
            
            { "$lookup": {
                "from": "users",
                "localField": "comments.from",
                "foreignField": "id",
                "as": "comments.poster"}}, 

            { "$unset": "comments.poster.password"},
            
            { "$group": {
                "_id": "$_id",
                "date": { "$first": "$date" },
                "user_id": { "$first": "$user_id" },
                "title": { "$first": "$title" },
                "content": { "$first": "$content" },
                "attachments": { "$first": "$attachments" },
                "comments": { "$push": {
                    "comment": "$comments"
                }},
                "tags": { "$first": "$tags_all" },
                "poster": {"$first": "$poster"}
            }},

            { "$sort": { "date": -1 } }
        ])
        .exec();
}


module.exports.getBySearch = (search) => {
    var regex = search

    return Post
        .aggregate([
            {
                "$lookup": {
                    "from": "users",
                    "localField": "user_id",
                    "foreignField": "id",
                    "as": "poster"
                }
            },
            { 
                "$unwind": { 
                "path":"$comments",
                "preserveNullAndEmptyArrays": true
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "comments.from",
                    "foreignField": "id",
                    "as": "comments.poster"
                }
            },
            {
                "$group": {
                    "_id": "$_id",
                    "date": { "$first": "$date" },
                    "user_id": { "$first": "$user_id" },
                    "title": { "$first": "$title" },
                    "tags": { "$first": "$tags" },
                    "content": { "$first": "$content" },
                    "attachments": { "$first": "$attachments" },
                    "comments": { "$push": {
                        "comment": "$comments"
                    }},
                    "poster": {"$first": "$poster"}
                }
            },
            {
                "$match": {
                    "$or": [
                        { "title": { "$regex": search, "$options": "$i" } },
                        { "content": { "$regex": search, "$options": "$i" } },
                        { "comments.comment.content": { "$regex": search, "$options": "$i" } }
                    ]
                }
            }
        ])
        .exec();


}
/*
{
                "$match": {
                    "$or": [
                        { "title": { "$regex": search, "$options": "$i" } },
                        { "content": { "$regex": search, "$options": "$i" } }
                    ]
                }
            },
*/
/*
module.exports.getByTag = (tag) => {
    return Post.
        find({tags: tag})
        .sort({date: -1})
        .exec()
}
*/

/*
module.exports.getByTags = (tags) => {
    return Post.aggregate([
            { "$addFields": { "tags_all": "$tags" }},
            { "$unwind": "$tags" },
            {
                "$match": 
                {
                    "$expr":
                    {
                        "$in": [
                            "$tags",
                            tags
                        ]
                    }
                }
            },

            { "$unset" : [ "tags" ] },

            { "$project": {
                "tags": "$tags_all",
                "date": 1,
                "user_id":1,
                "title":1,
                "content": 1,
                "attachments": 1,
                "comments": 1
            }},
                
            {  "$sort": { "date": -1 }}         
    ]).exec()
}
*/

module.exports.getRecent = (start, limit) => {
    return Post.aggregate([
        { "$sort": { "date": -1 } },
        { "$skip": start },
        { "$limit": limit },
        { "$lookup": {
            "from": "users",
            "localField": "user_id",
            "foreignField": "id",
            "as": "poster" 
        }},
        { "$unset": "poster.password" },

        
        { "$unwind": { 
            "path":"$comments",
            "preserveNullAndEmptyArrays": true
        }},
        
        { "$lookup": {
            "from": "users",
            "localField": "comments.from",
            "foreignField": "id",
            "as": "comments.poster"}}, 

        { "$unset": "comments.poster.password"},

        { "$group": {
            "_id": "$_id",
            "date": { "$first": "$date" },
            "user_id": { "$first": "$user_id" },
            "title": { "$first": "$title" },
            "content": { "$first": "$content" },
            "attachments": { "$first": "$attachments" },
            "comments": { "$push": {
                "comment": "$comments"
            }},
            "tags": { "$first": "$tags_all" },
            "poster": {"$first": "$poster"}
        }},


    ]).exec();
}

module.exports.addComment = (postid, comment_info) => {
    return Post.findByIdAndUpdate(postid, {
        "$push": { comments: comment_info }
    }, {new:true}).exec();
}

module.exports.deleteComment = (postid, commentid) => {
    return Post.findByIdAndUpdate(postid, {
        "$pull" : { "comments": {"_id": commentid}}
    }).exec();
}