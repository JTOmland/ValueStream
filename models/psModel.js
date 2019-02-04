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
    Operation: { type: ObjectID, ref: 'operationsModel' },
    Inputs: [
        {
            _id: {type: String, ref: processStepModel},
            BaseUsage: { type: Number }
        }

    ],
    IsFinishedGood: Boolean,
    WhereUsed: [
        {
            ParentID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: processStepModel
            },
            Usage: [
                {
                    period: { type: Date },
                    amount: { type: Number }
                }
            ]
        }
    ],
    Demand: [
        {
            period: { type: Date },
            amount: { type: Number }
        }
    ],
    UsedWorkCenters: [
        {
            WorkCenterID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'workCenterModel'
            },

            WorkCenterInformation: [
                {
                    period: { type: Date },
                    cost: { type: Number },
                    usage: { type: Number },
                    rate: { type: Number },
                    loading: { type: Number },
                    demand: { type: Number },
                    hours: { type: Number }
                }
            ]
        }
    ]
});

var autoPopulateLead = function (next) {
    this.populate('Inputs._id');
    this.populate('UsedWorkCenters.WorkCenterID');
    this.populate('Operation');
    next();
};

processStepSchema.
    pre('findOne', autoPopulateLead).
    pre('find', autoPopulateLead);

var processStepModel = mongoose.model('processStepModel', processStepSchema);

module.exports = processStepModel;