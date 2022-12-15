require('dotenv').config();
const helmet = require('helmet');
const http = require('http');
const express = require('express');
const passport = require('passport');
const { Strategy } = require('passport-google-oauth20');

const PORT = 3000;
const config = {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET
};

const AUTH_OPTIONS = {
    callbackURL: '/auth/google/callback',
    clientID: config.CLIENT_ID,
    clientSecret: config.CLIENT_SECRET
};

// 3.Get the access token and profile data upon success
function verifyCallback(accessToken, refreshToken, profile, done) {
    console.log('Google Profile', profile);
    done(null, profile);
}
passport.use(new Strategy(AUTH_OPTIONS, verifyCallback));

const app = new express();

app.use(helmet());
app.use(passport.initialize());

function checkLoggedIn(req, res, next) {
    const isLoggedIn = true;
    if (!isLoggedIn) {
        return res.status(401).json({
            error: 'You must login first!',
        });
    }
    next();
}

// 1.Use google to login
app.get('/auth/google', passport.authenticate('google', {
    scope: ['email'],
}));

// 2.Callback from google with the authorization code
app.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/failure',
    successRedirect: '/',
    session: false,
}), (req, res) => {
    console.log('GOOGLE called us back!');
});

app.get('/auth/logout', (req, res) => { });
app.get('/secret', checkLoggedIn, (req, res) => {
    res.send('Your personal secret is 42!');
});
app.get('/failure', (req, res) => {
    return res.send('Faild to log in');
});
app.get('/', (req, res) => {
    return res.send('Welcome on homepage');
});

const server = http.createServer(app);
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});