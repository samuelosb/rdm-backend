/**
 * @module PassportSetup
 *
 * This module configures Passport.js for Google and GitHub OAuth authentication.
 * It sets up the strategies for Google and GitHub and includes the logic for user finding or creation.
 */

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;

console.log('Environment Variables:', {
    googleClientID: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    githubClientID: process.env.GITHUB_CLIENT_ID,
    githubClientSecret: process.env.GITHUB_CLIENT_SECRET
});

// Google OAuth setup
passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        // User finding or creation logic here
        done(null, profile);
    }
));

// GitHub OAuth setup
passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/auth/github/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        // User finding or creation logic here
        done(null, profile);
    }
));
