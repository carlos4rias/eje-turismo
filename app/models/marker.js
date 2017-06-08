const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MarkerSchema = new Schema({
  author: String,
  namemedia: String,
  name: String,
  lat: String,
  lon: String,
  description: String,
  type: String,
  active: {type: Boolean, default : true}
});

module.exports = mongoose.model('Marker', MarkerSchema);
