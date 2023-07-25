import passport from 'passport';
require('dotenv').config;

export const jwtGuard = passport.authenticate('jwt', { session: false });
export const googleGuardSuccess = passport.authenticate('google', { scope: ['profile', 'email'] });
export const googleGuardFailed = passport.authenticate('google',  { session: false, failureRedirect: `/login`});

export const facebookGuardSuccess = passport.authenticate('facebook');
export const facebookGuardFailed = passport.authenticate('facebook',  {session: false, failureRedirect: `/login`});
