const mongoose = require('mongoose');

const User = require('../models/user');
const File = require('../models/file');

const ChatMessageSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    content: { type: String, required: true },
    attachments: { type: [File], required: true },
    from: { type: [User], required: true },
    to: { type: [User], required: true }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);