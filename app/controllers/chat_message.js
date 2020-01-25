const ChatMessage = require('../models/chat_message')

module.exports.getpreviousMsgs = () => {
    return ChatMessage
        .find()
        .exec();
}

module.exports.create = (msg) => {
    return ChatMessage
        .create(msg)
}

