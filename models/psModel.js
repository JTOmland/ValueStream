var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectID = mongoose.Schema.Types.ObjectId;


var processStepSchema = new Schema({
    ModelID: String,
    CustomerID: String,
    ProductFamily: String,
    Description: String,
    InternalId: Number,
    Name: String,
    Operation: { type: ObjectID, ref: 'operationModel' },
    Inputs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: processStepModel
        }
    ],
    IsFinishedGood: Boolean,
    WhereUsed: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: processStepModel
        }
    ],
    UsedWorkCenters: [
        {
            WorkCenterID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'workCenterModel'
            },
            Cost: [{
                Period: { type: Date },
                Amount: { type: Number, required: true }
            }],
            Rate: [{
                Period: { type: Date },
                Amount: { type: Number, required: true }
            }],
            Yield: [{
                Period: { type: Date },
                Amount: { type: Number, required: true }
            }],
            Loading: [{
                Period: { type: Date },
                Amount: { type: Number, required: true }
            }],
            Demand: [{
                Period: { type: Date },
                Amount: { type: Number, required: true }
            }],
            Hours: [{
                Period: { type: Date },
                Amount: { type: Number, required: true }
            }],
        }
    ]
});

var autoPopulateLead = function(next) {
    this.populate('Inputs');
    next();
  };
  
  processStepSchema.
    pre('findOne', autoPopulateLead).
    pre('find', autoPopulateLead);

var processStepModel = mongoose.model('processStepModel', processStepSchema);

module.exports = processStepModel;