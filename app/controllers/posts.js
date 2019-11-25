const Post = require('../models/post');

const PostsController = module.exports;

/**
 * Adds a new post to the collection
 * 
 * @param {object} postData
 */
module.exports.add = (postData) => {
    const newPost = new Post({
        date: postData.date,
        user: postData.user,
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
 * Return the information of a post, given the id of said post
 * 
 * @param {string} postId
 */
module.exports.getById = (postId) => {
    return Post
            .findById(postId)
            .exec();
}

/**
 * Return a list of posts, given the user that posted said posts
 * 
 * @param {string} userId
 */
module.exports.getByUser = (userId) => {
    return Post
            .find({ user_id: userId })
            .exec()
}

/**
 * Return a list of posts that have the given tag
 * 
 * @param {string} tag
 */
module.exports.getByTag = (tag) => {
    return Post
            .aggregate([
                { $unwind: '$tags' },
                { $match: tag }
            ])
            .exec()
}