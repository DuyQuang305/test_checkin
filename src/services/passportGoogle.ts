import passport from 'passport'
const GoogleStrategy = require('passport-google-oauth20').Strategy;
require('dotenv').config()
const url = process.env.URL_SERVER

passport.use(new GoogleStrategy({
    clientID: '486108468279-jk3fgoe81v8k83brmgs5uvsilbd8lv6a.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: `${url}/auth/google/callback`
    },

    function(accessToken, refreshToken, profile, cb) {
    return cb(null, profile);
    }
));

module.exports = passport
