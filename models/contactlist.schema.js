var mongoose = require('mongoose');


var Schema = mongoose.Schema;

var ContactListUserSchema = new Schema({ 
    username: String,
    approval: Boolean,
    addedAt: Date
});

var ContactListModelSchema = new Schema({
    // _id: String,
    username: String,
    contactList:[ContactListUserSchema]
    
});

var ContactList = mongoose.model("contactList", ContactListModelSchema);
var ContactListUser = mongoose.model("contactListUser", ContactListUserSchema);

module.exports = ContactList;
