const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;

const mongoose = require('mongoose');
require('./db');
const User = mongoose.model('User');

//Ref: http://www.passportjs.org/docs/facebook/
//passport-facebook implementation: https://www.djamware.com/post/59a6257180aca768e4d2b132/node-express-passport-facebook-twitter-google-github-login

passport.use(new FacebookStrategy({
  clientID: "186936538919512",
  clientSecret: "60c5b87ded560eafeb652a0a3101ea17",
  callbackURL: "http://localhost:3000/fbauth/callback"
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
