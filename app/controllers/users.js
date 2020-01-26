const User = require('../models/user');


/**
 * Returns the information of an user, given the id of the user
 * 
 * @param {string} userId
 */
module.exports.getById = (userId) => {
    return User
            .find({ id: userId })
            .exec();
}

/**
 * Adds a new user to the collection
 * 
 * @param {object} userData
 */
module.exports.add = (userData) => {
    const newUser = new User({
        id: userData.id,
        password: userData.password,
        full_name: userData.full_name,
        course: userData.course,
        subscribed_tags: userData.subscribed_tags
    });

    return newUser.save();
}

module.exports.updateSubscribeTags = (id, subscribed_tags) => {
    return User.updateOne({id: id},
        {"$set": {"subscribed_tags": subscribed_tags}},
        {new: true})
        .exec();
}

module.exports.updateProfilePic = (id, profile_pic) => {
    return User.updateOne(
        {id: id},
        {"$set": { "profile_pic": profile_pic}},
        {new: true})
        .exec();
}