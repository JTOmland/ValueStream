var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var periodSchema = new Schema({
    Period: Date
});


var periodModel = mongoose.model('periodModel', periodSchema, 'periodModel');

module.exports = periodModel;