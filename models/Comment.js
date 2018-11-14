const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    userId:{ type: String, required: true, },
    advId:{ type: String, required: true, },
    content:{ type: String, required: true, },
    createAt:{ type: Date, required: true, },
});

module.exports = mongoose.model('Comment',CommentSchema);