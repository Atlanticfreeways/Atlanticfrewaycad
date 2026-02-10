const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const UserRepository = require('../database/repositories/UserRepository'); // Assuming this exists based on server.js imports
const dbConnection = require('../database/connection'); // To inject pool if needed, though usually repo handles it

// Initialize UserRepository - we might need to adjust based on how dependencies are injected
// For now, we'll instantiate it directly if possible, or use a workaround if it requires the pool instance from server.js
// A better approach often is to pass the repository instance to the passport config function.

module.exports = (app) => {
    // Serialization
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        try {
            // We need access to the repository. 
            // Since this module is required in server.js, we can potentially access app.locals.repositories.user if initialized there.
            // Or typically, we just run a direct query if the repo isn't easily improved.
            // Let's rely on app.locals for a cleaner architecture if possible, or fall back to direct DB usage.

            if (app.locals.repositories && app.locals.repositories.user) {
                const user = await app.locals.repositories.user.findById(id);
                done(null, user);
            } else {
                // Fallback if not ready (though it should be)
                // This might fail if DB isn't connected yet, but deserialize happens on requests
                done(new Error("User repository not initialized"), null);
            }
        } catch (err) {
            done(err, null);
        }
    });

    // Google Strategy
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/api/v1/auth/google/callback"
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userRepo = app.locals.repositories.user;
                // Check if user exists by email
                let user = await userRepo.findByEmail(profile.emails[0].value);

                if (!user) {
                    // Create new user
                    // Password set to null or a random string since they use social login
                    // We'll need to ensure the schema supports null passwords or handle it
                    user = await userRepo.create({
                        email: profile.emails[0].value,
                        firstName: profile.name.givenName,
                        lastName: profile.name.familyName,
                        googleId: profile.id,
                        isVerified: true // Social login implies email verification usually
                    });
                } else if (!user.googleId) {
                    // Link Google account to existing user
                    await userRepo.update(user.id, { googleId: profile.id });
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }));

    // GitHub Strategy
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "/api/v1/auth/github/callback",
        scope: ['user:email']
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const userRepo = app.locals.repositories.user;
                // GitHub emails might be private, need to handle that or assume the primary public one
                const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

                if (!email) {
                    return done(new Error("No email found in GitHub profile"), null);
                }

                let user = await userRepo.findByEmail(email);

                if (!user) {
                    user = await userRepo.create({
                        email: email,
                        firstName: profile.displayName || profile.username, // GitHub doesn't always have first/last name split
                        lastName: '', // Placeholder
                        githubId: profile.id,
                        isVerified: true
                    });
                } else if (!user.githubId) {
                    await userRepo.update(user.id, { githubId: profile.id });
                }

                return done(null, user);
            } catch (err) {
                return done(err, null);
            }
        }));
};
