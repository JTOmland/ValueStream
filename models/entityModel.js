var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var entitySchema = new Schema({
  description: String,
  image: String,
  isadjustable: Boolean,
  isstorable: Boolean,
  entityType: String,
  tablename: String,
  assigned: Boolean, default: false
  
});

var allentities = mongoose.model('allentities', entitySchema);

module.exports = allentities;

//module.exports.entityScheme = entitySchema; 