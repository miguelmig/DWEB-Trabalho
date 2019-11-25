const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    course: { type: String, required: true },
    subscribed_tags: { type: [String], required: true }
});

module.exports = mongoose.model('User', UserSchema);