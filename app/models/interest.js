const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const InterestSchema = new Schema({
  id_user: {type: String},
  name: {type: String, lowercase: true}
});

module.exports = mongoose.model('Interest', InterestSchema);
