const mongoose = require('mongoose');

const User = require('../models/user').schema;
const File = require('../models/file').schema;

const ChatMessageSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    content: { type: String, required: true },
    attachments: { type: [File], required: true },
    from: { type: [User], required: true },
    to: { type: [User], required: true }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema);