const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    title:{ type: String, required: true, },
    pda:{ type: Number, required: true, default:1 },
    desc:{ type: String, required: true, },
    createAt:{ type: Date, required: true, },
});

module.exports = mongoose.model('Task',TaskSchema);