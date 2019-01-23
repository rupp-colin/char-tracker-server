const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user.js');

const localStategy = new LocalStrategy((username, password, done) => {
  //declares user before promises so it can be scoped correctly
  let user;
  // searches the database for a user with key=username value=username arg
  User.findOne({ username })
    .then(results => {
      // if the database successfully returns a user, asign the user object
      // returned by the database to the 'user' variable declared earlier
      user = results
      // if user is not found in DB, reject the promise
      if (!user) {
        return Promise.reject({
          reason: 'login error',
          message: 'incorrect username',
          location: 'username'
        });
      }
      // 'validatePassword' is a defined method on the user model. It uses
      // bcryptjs to determine if a passed in password matches the password
      // on the user object
      return user.validatePassword(password);
    })
    .then(isValid => {
      // if validatePassword returns 'false', reject the promise
      if(!isValid) {
        return Promise.reject({
          reason: 'login error',
          message: 'incorrect password',
          location: 'password'
        });
      }
      // edit the user object so that the password is not returned
      let editedUser = {username: user.username, id: user._id};
      // return 'null' as first argument per the passport.js documentation
      // and also return the editedUser
      return done(null, editedUser);
    });
});

module.exports = localStategy;
