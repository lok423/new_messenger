var mongoose = require('mongoose');


var Schema = mongoose.Schema;


var UserModelSchema = new Schema({
    

});

var User = mongoose.model("users", UserModelSchema);

module.exports = User;