const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
    name: String,
    mimetype: String,
    size: Number
});

module.exports = mongoose.model('File', FileSchema);