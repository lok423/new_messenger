const passport = require('passport');

module.exports = function passportConfig(app) {

    app.use(passport.initialize());
    app.use(passport.session());


    //Store user in session
    passport.serializeUser((user, done) => {
        done(null, user);
    });

    //Retrieves user from session
    passport.deserializeUser((user, done) => {
        done(null, user);
    });

}