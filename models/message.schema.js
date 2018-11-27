var mongoose = require('mongoose');


var Schema = mongoose.Schema;


var MessageModelSchema = new Schema({
    _id: String,
    senderId:String,
    receiverId:String,
    type:String,
    content:String,
    createAt:Date,
    updateAt:Date,
    haveRead:String,
    sessionId:String
});

var Message = mongoose.model("messages", MessageModelSchema);

module.exports = Message;