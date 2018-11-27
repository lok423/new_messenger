var mongoose = require('mongoose');


var Schema = mongoose.Schema;


var UserModelSchema = new Schema({
    // _id: String,
    firstName:String,
    lastName:String,
    username:String,
    createdAt:Date,
    updatedAt:Date,
    email:String,
    hash: String
}).pre('save', function(next){
    let doc = this;

    now = new Date();
    doc.updatedAt = now;
    if ( !doc.createdAt ) {
      doc.createdAt = now;
    }
    console.log(doc);

    next();
  });

var User = mongoose.model("users", UserModelSchema);

module.exports = User;