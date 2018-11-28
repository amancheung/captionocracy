const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

const mongoose = require('mongoose');
require('./db');
const User = mongoose.model('User');

//Ref: http://www.passportjs.org/docs/facebook/
//passport-facebook implementation: https://www.djamware.com/post/59a6257180aca768e4d2b132/node-express-passport-facebook-twitter-google-github-login

passport.use(new GitHubStrategy({
  clientID: "53e6f9c1d357b83f1bb3",
  clientSecret: "4e02178869b441ee093250d914f365583b5dbfa1",
  callbackURL: "http://localhost:3000/githubauth/callback"
},
function (accessToken, refreshToken, profile, done) {
  User.findOrCreate({userId: profile.id}, {userId: profile.id, displayName: profile.displayName}, function(err, user) {
    if (err) {
      done(err);
    } else {
      done(null, user);
    }
  });
}
));

module.exports = passport;
