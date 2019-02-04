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
var workcenterTest = require('../models/WorkCenter');
var productTest = require('../models/Product');
var entities = require('../models/entityModel');
var components = require('../models/componentModel');
var uploader = require('./uploader');
multer = require('multer');
var upload = multer({
    dest: '/tmp/'
});

module.exports = function (app) {
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.post('/api/fileupload/', upload.single('file'), function(req, res, next) {
        console.log("api/fileupload right before uploader.uploadSpreadsheet");
        uploader.uploadSpreadsheet(req, res, next);
    });
   
    app.get('/api/model', function (req, res) {
        console.log("api/model get called");
        model.find({}).lean().exec(function (err, results) {
            if (err) {
                errorHandler(err, req, res);
            } else {
                //console.log("apiModel about to return", results)
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

    app.post('/api/component', function (req, res) {
        console.log("post api/component body", req.body);
        if (req.body._id) {
            console.log("updateing component id was found")
            components.findOneAndUpdate({ _id: req.body._id }, { $set: { name: req.body.name, inputs: req.body.inputs, usages: req.body.usages, type: req.body.type, description: req.body.description} },
                function (err, data) {
                    if (err) {
                        errorHandler(err, req, res);
                    } else {
                        res.send(data);
                    };
                });

        } else {
            var newComponent = new components(req.body);
            newComponent.save(function (err, response) {
                if (err) {
                    errorHandler(err, req, response);
                } else {
                    res.send(response);
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
                //console.log("api/operations get results", results);
                res.send(results);
            }
        });
    });

    // app.get('/api/finishedGoodOuput/:ModelID', function(req, res){
    //     console.log('api/finishedGoodOuput');
    //     output.find({IsFinishedGood: true, ModelID: req.params.ModelID}).exec(function(err, finishedGoods){
    //         if(err) {
    //             errorHandler(err, req, res);
    //         } else {
    //             console.log("api/finishedGoodOutputs results", finishedGoods);
    //             console.log("type of response", typeof(finishedGoods));
    //             //for(var ps = 0; ps < finishedGoods.length(); ps++) {
    //                 console.log("PS", finishedGoods[0]);
    //             //}
    //             res.send(finishedGoods);
    //         }
    //     });
    // });

    app.get('/api/finishedGoodOuput', function(req, res){
        console.log('api/finishedGoodOuput');
        components.find({type: "Finished Good"}).exec(function(err, finishedGoods){
            if(err) {
                errorHandler(err, req, res);
            } else {
                console.log("api/finishedGoodOutputs results", finishedGoods);
                res.send(finishedGoods);
            }
        });
    });


    app.get('/api/arrayOuputs', function(req, res) {
        console.log("/api/arrayOutputs", req.params);
       // var thisstuff = JSON.parse(req.params);
       // console.log('this stuff', thisstuff);
        var ids = ["5c364d9b8d2455d2a7851e2a","5c364dae8d2455d2a7851f5b","5c364f38799fc1d61ae4f579"]

        output.find({_id:{$in:ids}}).exec(function(err,items){
            if(err) {
                errorHandler(err, req, res);
            } else {
               // console.log("apie/arrayOutputs results", items);
                res.send(items);
            }
        });
    });
    // model.find({
    //     '_id': { $in: [
    //         mongoose.Types.ObjectId('4ed3ede8844f0f351100000c'),
    //         mongoose.Types.ObjectId('4ed3f117a844e0471100000d'), 
    //         mongoose.Types.ObjectId('4ed3f18132f50c491100000e')
    //     ]}
    // }, function(err, docs){
    //      console.log(docs);
    // });

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

    //Below is testing a simplified schema for game manufacturing

    app.get('/api/item/all', function(req,res){
        components.find({}).lean().exec(function(err, results){
            if(err) {
                errorHandler(err, req, res);
            } else {
                res.send(results);
            };
        });
    });

    app.post('/api/productTest', function (req, res) {
        console.log("api/productTest body", req.body);
        if (req.body._id) {
            productTest.findOneAndUpdate({ _id: req.body._id }, { $set: { Name: req.body._name, Demand: req.body.Demand, Inputs: req.body/Inputs } },
                function (err, data) {
                    if (err) {
                        errorHandler(err, req, res);
                    } else {
                        res.send("Success");
                    };
                });

        } else {
            var newProduct = new productTest(req.body);
            newProduct.save(function (err, response) {
                if (err) {
                    errorHandler(err, req, response);
                } else {
                    res.send("Success");
                };
            });
        };

    });
   
}