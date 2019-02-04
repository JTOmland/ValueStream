var mongoose = require('mongoose');

var ComponentSchema = new mongoose.Schema({
    name: String,
    description: String,
    type: String,
    inputs: [ 
        {
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Components
            }
        }
        
    ],
    usages: [
        {
            _id: {type: mongoose.Schema.Types.ObjectId},
            amount: { type: Number }
        }
    ]
    

});


var Components= mongoose.model("Components", ComponentSchema);

module.exports = Components;