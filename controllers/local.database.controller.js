const mongoose = require('mongoose');
const userSchema = require('../models/user.schema');
const contactlistSchema = require('../models/contactlist.schema');
const debug = require('debug')('app:loacalDatabaseController');
const Q = require('q');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const config = require('../config/config.json');



mongoose.connect('mongodb://localhost:27017/messenger', {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        debug(err);
    } else {
        debug('connected to the mongodb!');
    }
});




var service = {};

service.authenticate = authenticate;
service.getAll = getAll;
service.getById = getById;
service.create = create;
service.update = update;
service.delete = _delete;
service.getByUsername = getByUsername;
service.addUserContact = addUserContact;
service.confirmUserContact = confirmUserContact;
service.deleteContact = deleteContact;



module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();

    userSchema.findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve({
                _id: user._id,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                token: jwt.sign({ sub: user.username }, config.secret)
            });
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    userSchema.find({}).exec( (err, users)=> {
        if (err) deferred.reject(err.name + ': ' + err.message);

        // return users (without hashed passwords)
        users = _.map(users, function (user) {
            return _.omit(user, 'hash');
        });

        deferred.resolve(users);
    });

    return deferred.promise;
}

function getById(id) {
    var deferred = Q.defer();

    userSchema.findById(id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();
    // debug(userParam);
    // validation
    userSchema.findOne(
        { username: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser();
            }
        });

    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, ['password','confirmPassword']);

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        // userSchema.insert(
        //     user,
        //     function (err, doc) {
        //         if (err) deferred.reject(err.name + ': ' + err.message);

        //         deferred.resolve();
        //     });
        var userDoc = new userSchema(user);
        var userContact = new contactlistSchema({username: userDoc.username,contactList:[]});
        userDoc.save()
                    .then(doc => {
                        debug("Success to create user ",doc.username)
                        userContact.save()
                                        .then(doc =>{
                                            debug('Success to create contactlist');
                                            deferred.resolve();
                                        })
                                        .catch(err =>{
                                            debug(err)
                                            deferred.reject(err.name + ': ' + err.message);
                                        })
                        // deferred.resolve();
                    })
                    .catch(err => {
                        debug(err)
                        deferred.reject(err.name + ': ' + err.message);
                    });
    }

    return deferred.promise;
}

function update(id, userParam) {
    var deferred = Q.defer();

    // validation
    userSchema.findById(id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            userSchema.findOne(
                { username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + req.body.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        } else {
            updateUser();
        }
    });

    function updateUser() {
        // fields to update
        var set = {
            firstName: userParam.firstName,
            lastName: userParam.lastName,
            username: userParam.username,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        userSchema.update(
            { _id: mongo.helper.toObjectID(id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function _delete(id) {
    var deferred = Q.defer();

    userSchema.remove(
        { _id: mongo.helper.toObjectID(id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function getByUsername(username) {
    var deferred = Q.defer();
    userSchema.findOne(
        { username: username },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.resolve(user);
            } else{
                deferred.reject('user not found');
            }
        });

    return deferred.promise;
}

function addUserContact(username, addContact) {
    var deferred = Q.defer();
    contactlistSchema.findOne(
        { username: addContact },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                // deferred.resolve(user);
                // debug(user.contactList);
                var sameUser = user.contactList.filter(function (contact) {
                    return contact.username === username;
                  });

                
                if(user.contactList.length ==0 || sameUser.length==0){
                    // debug('no same');
                    user.contactList.push({username:username,approval:false});
                user.save()
                .then(doc => {
                    debug("Success to add user contact ",doc)
                    deferred.resolve(doc);
                })
                .catch(err => {
                    debug(err)
                    deferred.reject(err.name + ': ' + err.message);
                });
                }else{
                    debug('same user found');
                    deferred.resolve('Request has been sent already');

                }
                
            } else{
                deferred.reject('user not found');
            }
        });

    return deferred.promise;
}

function confirmUserContact(selfUsername, contact) {
    var deferred = Q.defer();
    contactlistSchema.findOne(
        { username: selfUsername },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                var sameUser = user.contactList.filter(function (_contact) {
                    debug(contact);

                    return _contact.username === contact;
                  });

                if(user.contactList.length ==0 || sameUser.length==0){
                    debug('no user find');
                    
                deferred.resolve('user not found');
                }else{
                    debug('same user found');
                    contactlistSchema.update({username: selfUsername, 'contactList.username': contact},
                    {'$set': {
                           'contactList.$.approval': true,
                           'addedAt': Date.now()
                     }},
                        function(err,model) {
                      if(err){
                          console.log(err);
                          deferred.reject(err.name + ': ' + err.message);
                      }


                      contactlistSchema.findOne(
                        { username: contact },
                        function (err, user) {
                            if (err) deferred.reject(err.name + ': ' + err.message);
                
                            if (user) {
                                var sameUser = user.contactList.filter(function (contact) {
                                    return contact.username === selfUsername;
                                  });
                
                                
                                if(user.contactList.length ==0 || sameUser.length==0){
                                    // debug('no same');
                                    user.contactList.push({username:selfUsername,approval:true, addedAt: Date.now()});
                                user.save()
                                .then(doc => {
                                    debug("Success to add user contact ",doc)
                                    deferred.resolve(doc);
                                })
                                .catch(err => {
                                    debug(err)
                                    deferred.reject(err.name + ': ' + err.message);
                                });
                                }else{
                                    debug('same user found');
                                    deferred.resolve('Same user found');
                
                                }
                                
                            } else{
                                deferred.resolve('user not found');
                            }
                        });
                    //   deferred.resolve("contact successful added");
               });
                    // deferred.resolve("Request has been sent already");

                }
                
            } else{
                deferred.resolve('user not found');
            }
        });

    return deferred.promise;
}

function deleteContact(selfUsername, contact){
    var deferred = Q.defer();
    contactlistSchema.findOneAndUpdate(
        {username: selfUsername},
       { $pull: { 'contactList': {  username: contact } } },function(err,model){
          if(err){
            debug(err);
            deferred.reject(err.name + ': ' + err.message);
        }
        deferred.resolve('Successful remove contact');
    });

    return deferred.promise;

}