const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const consts = require("./consts.json");

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        console.log("serializeUser");
        done(null, user);
    });
    passport.deserializeUser((user, done) => {
        console.log("deserializeUser");
        /*for (var key in user['profile']){
            console.log(key + " : " + user['profile'][key]);
        }*/
        done(null, user);
    });
    passport.use(new GoogleStrategy({
        clientID: consts.googleOAuth.client_id,
        clientSecret: consts.googleOAuth.client_secret,
        callbackURL: consts.googleOAuth.callback_url
},
    (token, refreshToken, profile, done) => {
        return done(null, {
            profile: profile,
            token: token
        });
    }));
};