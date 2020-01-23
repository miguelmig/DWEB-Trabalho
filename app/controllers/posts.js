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

module.exports.getRecent = (start, limit) => {
    return Post
            .find()
            .limit(limit)
            .exec();
}