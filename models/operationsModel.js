var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var WorkCenter = require('./workcenterModel');

var operationsSchema = new Schema({
    ModelID: String,
    Type: String,
    IsIncluded: Boolean,
    RegionID: Number,
    Name: String,
    WorkCenters: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'workCenterModel'
    }],
    Description: String
});

var operationsModel = mongoose.model('operationsModel', operationsSchema);

module.exports = operationsModel;