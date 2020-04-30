const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
import { Strategy as GoogleTokenStrategy } from 'passport-google-token';

// FACEBOOK STRATEGY
passport.use(new FacebookTokenStrategy({
    clientID: '824371328045172',
    clientSecret: '0c004d26f24bcf66d3a038c816d960b4'
}, (accessToken, refreshToken, profile, done) => done(null, {
    accessToken,
    refreshToken,
    profile,
})));

const authenticateFacebook = (req, res) => new Promise((resolve, reject) => {
    passport.authenticate('facebook-token', { session: false }, (err, data, info) => {
        if (err) reject(err);
        resolve({ data, info });
    })(req, res);
});

// // GOOGLE STRATEGY
// const GoogleTokenStrategyCallback = (accessToken, refreshToken, profile, done) => done(null, {
//     accessToken,
//     refreshToken,
//     profile,
// });

// passport.use(new GoogleTokenStrategy({
//     clientID: 'your-google-client-id',
//     clientSecret: 'your-google-client-secret',
// }, GoogleTokenStrategyCallback));

// const authenticateGoogle = (req, res) => new Promise((resolve, reject) => {

//     passport.authenticate('google', { session: false }, (err, data, info) => {
//         if (err) reject(err);
//         resolve({ data, info });
//     })(req, res);
// });

export default { 
    authenticateFacebook, 
    //authenticateGoogle
};