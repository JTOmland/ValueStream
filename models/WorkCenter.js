var mongoose = require('mongoose');

//this is a test schema to test different types of data organization

var WorkCenterSchema = new mongoose.Schema({
    Name: String,
    Product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
    },
    // Manager: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: NPCModel
    // },
    Yield: Number,
    Productivity: Number,
    InputInventory: [
        {
            Input: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            Amount: { type: Number }
        }
    ],
    OutputInventory: [
        {
            Input: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            Amount: { type: Number }
        }
    ],
 

    
});

module.exports = mongoose.model("WorkCenter", WorkCenterSchema);