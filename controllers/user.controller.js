const express = require('express');
const router = express.Router();
const debug = require('debug')('app:userController');
const databaseService = require('./local.database.controller');
const jwt_decode = require('jwt-decode');

router.post('/authenticate', authenticate);
router.post('/register', register);
router.get('/', getAll);
router.get('/current', getCurrent);
router.get('/getcontact/:username', getContact);
router.get('/addcontact/:username', addContact);
router.get('/confirmcontact/:username', confirmAddContact);
router.get('/deletecontact/:username', deleteContact);


router.put('/:id', update);
router.delete('/:id', _delete);


function authenticate(req, res) {

    databaseService.authenticate(req.body.username, req.body.password)
        .then(function (user) {
            if (user) {
                // authentication successful
                res.send(user);
            } else {
                // authentication failed
                res.status(400).send('Username or password is incorrect');
            }
        })
        .catch(function (err) {
          console.log(err);
            res.status(400).send(err);
        });
}

function register(req, res) {
    databaseService.create(req.body)
        .then(function () {
            res.json('success');
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getAll(req, res) {
    databaseService.getAll()
        .then(function (users) {
            res.send(users);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrent(req, res) {
    databaseService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function update(req, res) {
    databaseService.update(req.params._id, req.body)
        .then(function () {
            res.json('success');
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function _delete(req, res) {
  debug("deleting");
  debug(req.params.id);
    databaseService.delete(req.params.id)
        .then(function () {
            res.json('success');
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getContact(req, res) {
    debug("get contact");
    debug(req.params.username);

    databaseService.getByUsername(req.params.username)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


function addContact(req, res) {
    var addContact = req.params.username;
    
    debug("add contact");
    var decode = jwt_decode(req.token);
    var username = decode.sub;
    if(addContact!==username){
        debug('not equal');
        databaseService.addUserContact(username, addContact)
            .then(function (contact){
                if(contact){
                    res.send("Request has been sent");
                }else{
                    res.sendStatus(404);
                }
            })
    }else{
        debug('equal');
        res.sendStatus(404);

    }
}

function confirmAddContact(req, res) {
    var contactUsername = req.params.username;
    
    // debug("add contact");
    var decode = jwt_decode(req.token);
    var selfUsername = decode.sub;
debug(selfUsername);
    if(contactUsername!==selfUsername){
        debug('not equal');
        databaseService.confirmUserContact(selfUsername, contactUsername)
            .then(function (contact){
                if(contact){
                    res.send(contact);
                }else{
                    res.sendStatus(404);
                }
            })
    }else{
        debug('equal');
        res.sendStatus(404);

    }
}

function deleteContact(req, res) {
    var deleteContact = req.params.username;
    
    debug("add contact");
    var decode = jwt_decode(req.token);
    var selfUsername = decode.sub;
    if(deleteContact!==selfUsername){
        debug('not equal');
        databaseService.deleteContact(selfUsername, deleteContact)
            .then(function (contact){
                if(contact){
                    res.send(contact);
                }else{
                    res.sendStatus(404);
                }
            })
    }else{
        debug('equal');
        res.sendStatus(404);

    }
}

module.exports = router;