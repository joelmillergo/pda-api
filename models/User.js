const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName:{ type: String, required: true, },
    password: String,
    nickname: { type: String, default: '', },
    token: String,
    tag:{type:[String],default:['90后','宅']},
    pda:{type:Number,default:10},
    follow:{type:Number,default:9},
    fans:{type:Number,default:99},
    favorited:{type:Number,default:99},
    fans:{type:Number,default:3000},
});

module.exports = mongoose.model('User',UserSchema);