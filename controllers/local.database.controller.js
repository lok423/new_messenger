const mongoose = require('mongoose');
const debug = require('debug')('app:loacalDatabaseController');
const Q = require('q');


mongoose.connect('mongodb://localhost:27017/messenger', {
    useNewUrlParser: true
}, function (err) {
    if (err) {
        debug(err);
    } else {
        debug('connected to the mongodb!');
    }
});
