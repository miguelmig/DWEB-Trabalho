const mongoose = require('mongoose');

const User = require('./user')
const File = require('./file');

const Comment = new mongoose.Schema({
    date: { type: Date, required: true },
    content: { type: String, required: true },
    from: { type: User, required: true }   
});

const PostSchema = new mongoose.Schema({
    date: { type: Date, required: true, default: Date.now },
    user_id: { type: String, required: true },
    title: { type: String, required: true },
    tags: { type: [String], required: true },
    content: { type: String, required: true },
    attachments: { type: [File], required: true },
    comments: { type: [Comment], required: true }
});

module.exports = mongoose.model('Post', PostSchema);