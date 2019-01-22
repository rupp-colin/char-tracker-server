const express = require('express');
const User = require('../models/user.js');
const { requiredFields, trimmedFields } = require('../utils/validation.js');
const router = express.Router();

//capture these fields to run them through validators
const expectedFields = ["username", "password"];
const explicitlyTrimmedFields = ["username", "password"];

//***************** CREATE A USER *************************//

router.post('/', requiredFields(expectedFields),
  trimmedFields(explicitlyTrimmedFields), (req, res, next) => {
    const { username, password } = req.body;

    //*** validation checks here ***

    if (!username) {
      let err = new Error('Username must not be empty');
      err.status = 400;
      err.location = 'username';
      return next(err);
    }

    if (password.length < 3 || password.length > 72) {
      let err = new Error('password must be between 3 and 73 characters long');
      err.status = 400;
      err.location = 'username';
      return next(err);
    }

    Promise.all([User.hashPassword(password)])
      .then(digest => {
        const newUser = {
          username,
          password: digest
        };
        return User.create(newUser);
      })
      .then(user => {
        let returnObj = {
          username: user.username,
          id: user._id
        };
        return res
          .status(201)
          .json(returnObj);
      })
      .catch(err => {
        if (err.code === 11000) {
          err = new Error('The username already exists');
          err.status = 400;
          err.location = 'username';
        }
        next(err);
      });
  });

module.exports = router;
