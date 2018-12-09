const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TaskHistorySchema = new Schema({
    userId:{ type: String, required: true,ref:'User'},
    taskId:{ type: String, required: true,ref:'Task' },
    doneAt:{ type: Date, required: true, },
});

module.exports = mongoose.model('TaskHistory',TaskHistorySchema);