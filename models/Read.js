const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReadSchema = new Schema({
    userId:{ type:String, ref: 'User' },
    advId:{ type:String,ref:'Adv'},
    favorited: {type:Boolean,default:false},
    shared: {type:Boolean,default:false},
    beginAt: { type:Date },
    endAt: { type:Date },
});

module.exports = mongoose.model('Read',ReadSchema);