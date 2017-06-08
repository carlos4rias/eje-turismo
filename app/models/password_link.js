const mongoose = require('mongoose');
const moment = require('moment');
const bcrypt = require('bcrypt-nodejs');

const Schema = mongoose.Schema;

const PasswordRecoverySchema = new Schema({
  email : String,
  created: {type: Number, default : moment().unix()}
});
/*
PasswordRecoverySchema.methods.generateHash = function(email) {
  return bcrypt.hashSync(email, bcrypt.genSaltSync(8), null);
};

PasswordRecoverySchema.methods.validEmail = function(email) {
  return bcrypt.compareSync(email, this.email);
};
*/
module.exports = mongoose.model('PasswordRecovery', PasswordRecoverySchema);
