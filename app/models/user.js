const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true },
    password: { type: String, required: true },
    full_name: { type: String, required: true },
    course: { type: String, required: true },
    subscribed_tags: { type: [String], required: true },
    profile_pic: { type: String, required: true, default: "no-profile.png" }
});

module.exports = mongoose.model('User', UserSchema);