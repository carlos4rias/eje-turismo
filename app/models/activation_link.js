const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const LinkActivationSchema = new Schema({
  user_dni : String,
  created: {type: Number, default : moment().unix()}
});

module.exports = mongoose.model('LinkActivation', LinkActivationSchema);
