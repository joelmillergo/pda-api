const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdvSchema = new Schema({
    title:{ type: String, required: true, },
    // headUrl:{ type: String, required: true, },
    // user:{ type: String, required: true, },
    // action:{ type: String, required: false, },
    // time:{ type: String, required: false, },
    // mark:{ type: String, required: false, },
    // imgUrl:{ type: String, required: false, },
    // agreeNum:{ type: String, required: false, },
    // commentNum:{ type: String, required: false, },
    pda:{ type: Number, required: true, default:1 },
    author:{ type: String, required: true, default:1 },
    content:{ type: String, required: true, default:1 },
    createAt:{ type: Date, required: true, default:1 },
});

module.exports = mongoose.model('Adv',AdvSchema);