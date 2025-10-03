const bcrypt = require('bcrypt');
const password = 'Admin@ucet';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  // Use your SQL INSERT to store 'hash' in the database.
});
