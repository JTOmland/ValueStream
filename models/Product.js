var mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
    Name: String,
    Demand: [{ type: Number }],
    Inputs: [
        {
            Input: {
                type: mongoose.Schema.Types.ObjectId,
                ref: Product
            },
            Amount: { type: Number }
        }
    ],

});

var Product= mongoose.model("Product", ProductSchema);

module.exports = Product;