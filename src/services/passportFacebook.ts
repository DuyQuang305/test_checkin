import passport  from 'passport';
import {User} from '../models/index'
const FacebookStrategy = require('passport-facebook').Strategy;
require('dotenv').config()
const url = process.env.URL_SERVER

passport.use(new FacebookStrategy({
    clientID: '664981345662920',
    clientSecret: 'e61328ae7754ded2ee243dca519ea0db',
    callbackURL: `${url}/auth/facebook/callback`
    },

    function(accessToken, refreshToken, profile, cb) {
          return cb(null, profile);
      }
));

module.exports = passport

