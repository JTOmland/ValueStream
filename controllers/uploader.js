//todo: update to new node-csv package > 0.2
var csv = require('csv');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');
var parse = require('csv-parse');


exports.uploadSpreadsheet = function (req, res, next) {

    console.log("uploader.uploadSpreadsheet called");


    var csvData = [];
    fs.createReadStream(req.file.path)
        .pipe(parse({ delimiter: ',' }))
        .on('data', function (csvrow) {
            console.log(csvrow);
            //do something with csvrow
            csvData.push(csvrow);
        })
        .on('end', function () {
            //do something wiht csvData
            console.log(csvData);
            res.send("success");
        });
}


