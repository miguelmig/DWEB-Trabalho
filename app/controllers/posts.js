const Post = require('../models/post');

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
    return Post
            .findById(postId)
            .exec();
}

/**
 * Returns a list of posts, given the user that posted said posts
 * 
 * @param {string} userId
 */
module.exports.getByUser = (userId) => {
    return Post
            .find({ user_id: userId })
            .sort('-date')
            .exec()
}

/**
 * Returns a list of posts that have the given tag
 * 
 * @param {string} tag
 */
module.exports.getByTag = (tag) => {
    return Post
            .find({ tags: tag })
            .sort('-date')
            .exec()
}

module.exports.getByTags = (tags) => {
    return Post
        .aggregate([
            {
                "$addFields": 
                {
                    "tags_all": "$tags"
                }
            },
            {
                "$unwind": "$tags"
            },
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
            {
                "$unset" : [
                    "tags",
                ]
            },
            {
                "$project": 
                {
                    "tags": "$tags_all",
                    "date": 1,
                    "user_id":1,
                    "title":1,
                    "content": 1,
                    "attachments": 1,
                    "comments": 1

                },
            },
            {
                "$sort":
                {
                    "date": -1
                }
            }
        ])
        .exec();
} 

module.exports.getRecent = (start, limit) => {
    return Post
            .find()
            .sort('-date')
            .skip(start)
            .limit(limit)
            .exec();
}

module.exports.addComment = (postid, comment_info) => {
    return Post.findByIdAndUpdate(postid, {
        "$push": { comments: comment_info }
    }).exec();
}

module.exports.deleteComment = (postid, commentid) => {
    return Post.findByIdAndUpdate(postid, {
        "$pull" : { "comments": {"_id": commentid}}
    }).exec();
}