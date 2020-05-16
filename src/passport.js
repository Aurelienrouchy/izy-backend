const passport = require('passport');
const FacebookTokenStrategy = require('passport-facebook-token');
const GoogleTokenStrategy = require('passport-google-token').Strategy;

// FACEBOOK STRATEGY
passport.use(new FacebookTokenStrategy({
    clientID: '1696089354000816',
    clientSecret: '8316811018a0a1479ecb7d9edca0820d',
    enableProof: false,
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
passport.use(new GoogleTokenStrategy({
    clientID: '108595256943-qq5i3mc7cn5u10ghoflb9hp9n3os10oc.apps.googleusercontent.com',
    // clientSecret: 'your-google-client-secret',
}, (accessToken, refreshToken, profile, done) => done(null, {
    accessToken,
    refreshToken,
    profile,
})));

const authenticateGoogle = (req, res) => new Promise((resolve, reject) => {
    passport.authenticate('google-token', { session: false }, (err, data, info) => {
        if (err) reject(err);
        resolve({ data, info });
    })(req, res);
});

export default { 
    authenticateFacebook, 
    authenticateGoogle
};