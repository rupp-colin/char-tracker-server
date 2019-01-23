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
    //checks to make user username and password is present
    if (!username || !password) {
      return res.status(422).json({
        code: 422,
        reason: 'Validation Error',
        message: 'Required field is missing'
      });
    }

    //checks to make sure password is between 3 and 72 characters
    if (password.length < 3 || password.length > 72) {
      let err = new Error('password must be between 3 and 73 characters long');
      err.status = 422;
      err.location = 'password';
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
