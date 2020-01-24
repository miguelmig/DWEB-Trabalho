const mongoose = require('mongoose');


const ChatMessageSchema = new mongoose.Schema({
    author: { type: String, required: true },
    message: { type: String, required: true }
});

module.exports = mongoose.model('message', ChatMessageSchema);