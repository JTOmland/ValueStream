var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var workcenterSchema = new Schema({
    ModelID: {type: Schema.Types.ObjectId, ref: 'modelModel'},
    OperationID: {type: Schema.Types.ObjectId, ref: 'operationsModel'},
    Name: String,
    Cost: Schema.Types.Mixed,
    Downtime: Schema.Types.Mixed
});

var workcenterModel = mongoose.model('workCenterModel', workcenterSchema);

module.exports = workcenterModel;