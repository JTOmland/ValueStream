var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var modelSchema = new Schema({
    ModelName: String,
    LastModified: Date,
    Description: String,
    PeriodStart: Date,
    Periods: [Date]
});

modelSchema.pre("save", async function (next) {
    var self = this;
    console.warn("model modelSchema pre save this", self);
    var startDate = new Date(self.PeriodStart);
    for (var j = 0; j < 60; j++) {
        var nextDate = new Date(startDate.setMonth(startDate.getMonth() + 1));
        self.Periods.push(nextDate);
    }
});
var modelModel = mongoose.model('modelModel', modelSchema);

module.exports = modelModel;
