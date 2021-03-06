const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const HistorySchema = new Schema({
    userId:{ type: String, required: true,ref:'User'},
    advId:{ type: String, required: false,ref:'Adv' },
    taskId:{ type: String, required: false,ref:'Task' },
    desc:{ type: String, required: true, },
    pda:{ type: Number, required: true, },
    createAt:{ type: Date, required: true, },
});

module.exports = mongoose.model('History',HistorySchema);