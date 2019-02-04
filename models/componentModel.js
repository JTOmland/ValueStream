var mongoose = require('mongoose');

var ComponentSchema = new mongoose.Schema({
    name: String,
    description: String,
    type: String,
    inputs: [ {
                type: mongoose.Schema.Types.ObjectId,
                ref: Components
            }
        
        // {
        //     _id: {
        //         type: mongoose.Schema.Types.ObjectId,
        //         ref: Components
        //     }
        // }
        
    ],
    usages: [
        {
            component: {type: mongoose.Schema.Types.ObjectId, ref: Components},
            amount: { type: Number }
        }
    ]
    

});


var autoPopulateLead = function (next) {
    this.populate('inputs');
    this.populate('usages.component')

    next();
};

ComponentSchema.
    pre('findOne', autoPopulateLead).
    pre('find', autoPopulateLead);


var Components= mongoose.model("Components", ComponentSchema);

module.exports = Components;