const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    userName:{ type: String, required: true, },
    password: String,
    nickname: { type: String, default: '', },
    token: String,
    tag:{type:[String],default:['90后','宅']},
    pda:{type:Number,default:110},
    follow:{type:Number,default:17},
    favorited:{type:Number,default:58},
    fans:{type:Number,default:3000},
});

module.exports = mongoose.model('User',UserSchema);