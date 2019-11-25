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
        username: userData.username,
        password: userData.password,
        full_name: userData.full_name,
        course: userData.course,
        subscribed_tags: userData.subscribed_tags
    });

    return newUser.save();
}