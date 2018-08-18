var bodyParser = require('body-parser');
var operation = require('../models/operationsModel');
var model = require('../models/modelModel');
var output = require('../models/psModel')
var Period = require('../models/periodModel');
var _ = require('lodash');
var workcenter = require('../models/workcenterModel');
var errorHandler = require('./errorHandler.js');
var fs = require('fs');
var _ = require('lodash');

module.exports = function (app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
   
    app.get('/api/model', function (req, res) {
        console.log("api/model get called");
        model.find({}).lean().exec(function (err, results) {
            if (err) {
                errorHandler(err, req, res);
            } else {
                console.log("apiModel about to return", results)
                res.send(results);
            }
        });
    });


    app.post('/api/output', function (req, res) {
        console.log("api/output body", req.body);
        if (req.body._id) {
            output.findByIdAndUpdate(req.body._id, req.body, {new: true},
                function (err, data) {
                    if (err) {
                        errorHandler(err, req, res);
                    } else {
                        res.send(data);
                    };
                });

        } else {
            var newOutput = new output(req.body);
            newOutput.save(function (err, data) {
                if (err) {
                    errorHandler(err, req, data);
                } else {
                    res.send(data);
                };
            });
        };

    });

    app.post('/api/model', function (req, res) {
        console.log('api/model post req.body', req.body);
        //var lastmodified = new Date();
        var lastmodified = new Date();
        console.log("lastModified", lastmodified)
        if (req.body._id) {
            requests.findOneAndUpdate({ _id: req.body._id }, { $set: { ModelName: req.body.ModelName, Description: req.body.Description, PeriodStart: req.body.PeriodStart, LastModified: lastmodified } },
                function (err, data) {
                    if (err) {
                        errorHandler(err, req, res);
                    } else {
                        res.send("Success");
                    };
                });

        } else {
            var newModel = new model(req.body);
            newModel.LastModified = lastmodified;
            newModel.save(function (err, response) {
                if (err) {
                    errorHandler(err, req, response);
                } else {
                    console.log("Created new model", response);
                    res.send("Success");
                };
            });
        };
    });

    app.post('/api/operations', function (req, res) {
        console.log("api/operations body", req.body);
        if (req.body._id) {
            operation.findOneAndUpdate({ _id: req.body._id }, { $set: { ModelID: req.body._id, Description: req.body.Description, Type: req.body.Type, IsIncluded: req.body.IsIncluded, RegionID: req.body.RegionID, Name: req.body.Name, WorkCenters: req.body.WorkCenters } },
                function (err, data) {
                    if (err) {
                        errorHandler(err, req, res);
                    } else {
                        res.send("Success");
                    };
                });

        } else {
            var newOperation = new operation(req.body);
            newOperation.save(function (err, response) {
                if (err) {
                    errorHandler(err, req, response);
                } else {
                    res.send("Success");
                };
            });
        };

    });

    app.post('/api/workcenter', function (req, res) {
        console.log("api/workcenter body", req.body);
        if (req.body._id) {
            console.log("updateing workcenter id was fount")
            workcenter.findOneAndUpdate({ _id: req.body._id }, { $set: { ModelID: req.body.ModelID, OperationID: req.body.OperationID, Name: req.body.Name, Cost: req.body.Cost, Downtime: req.body.Downtime } },
                function (err, data) {
                    if (err) {
                        errorHandler(err, req, res);
                    } else {
                        res.send("Success");
                    };
                });

        } else {
            var newWorkcenter = new workcenter(req.body);
            newWorkcenter.save(function (err, response) {
                if (err) {
                    errorHandler(err, req, response);
                } else {
                    console.log("after workcenter saved results", response);
                    workcenter.findOne({ _id: response._id }, function (err, wc) {
                        if (err) {
                            errorHandler(err, req, res);
                        } else {
                            operation.findOne({ _id: response.OperationID },
                                function (err, operation) {
                                    if (err) {
                                        errorHandler(err, req, res);
                                    } else {
                                        console.log("response after creating new workcenter and adding wc to operation", operation);
                                        operation.WorkCenters.push(response._id);
                                        operation.save();
                                        res.send("Success");
                                    };
                                });

                        }
                    })

                };
            });
        };

    });

    app.get('/api/operations/:ModelID', function (req, res) {
        console.log("api/operations get called request");
        operation.find({ ModelID: req.params.ModelID }).populate('WorkCenters').exec(function (err, results) {
            if (err) {
                errorHandler(err, req, res);
            } else {
                console.log("api/operations get results", results);
                res.send(results);
            }
        });
    });

    app.get('/api/finishedGoodOuput/:ModelID', function(req, res){
        console.log('api/finishedGoodOuput');
        output.find({IsFinishedGood: true, ModelID: req.params.ModelID}, function(err, finishedGoods){
            if(err) {
                errorHandler(err, req, res);
            } else {
                console.log("api/finishedGoodOutputs results", finishedGoods);
                res.send(finishedGoods);
            }
        });
    });

    app.get('/api/outputs/:OutputID', function (req, res) {
        console.log("api/outputs/:OutputID called params", req.params);
        output.findOne({_id: req.params.OutputID}).populate("Inputs").exec(function(err, foundOutput) {
            if(err) {
                errorHandler(err, req, res);
            } else {
                res.send(foundOutput);
            }
        });

    });

    app.post('/api/saveStarting', function (req, res) {
        console.log("/api/saveStarting post", req.body);
        var json = JSON.stringify(req.body);
        fs.writeFile('./public/data/startingModel.json', json, 'utf8', function (err) {
            if (err) {
                console.log("Error writing file units.json");
                return console.error(err);
            }
        });
        res.send('Success');
    });

    app.post('/api/save', function (req, res) {
        console.log("/api/save post", req.body);
        var json = JSON.stringify(req.body);
        fs.writeFile('./public/data/model.json', json, 'utf8', function (err) {
            if (err) {
                console.log("Error writing file units.json");
                return console.error(err);
            }
        });
        res.send('Success');
    });
}