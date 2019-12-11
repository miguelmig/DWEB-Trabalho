const ChatMessage = require('../models/chat_message')

module.exports.getUserMsgs = (userId) => {
    return ChatMessage
        .find({"$or": [{from: userId}, {to: userId}]})
        .exec();
}

module.exports.getChats = (userId) => {
    return ChatMessage
        .aggregate([
            { "$match": {"$or": [{from: userId}, {to: userId}]}},
            { "$group": {"_id": "$from"}, "chats": {"$push": "$to"}},
            { "$project": { "chats" : 1 }},
        ])
        .exec();
}

