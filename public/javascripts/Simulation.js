'use strict'
angular
    .module('vsapp')
    .factory('Simulation', Simulation);

Simulation.$inject = ['DataFactory'];
function Simulation(DataFactory) {
    var service = {
        runSimulation: runSimulation,
        random: gaussianRand
    };

    var scheduleList = [];
    var scheduleListID = [];
    var loop = 15; //TODo
    var timeIncrement = 1; //increment in minutes
    var ticks = 0;
    var time = 0;
    var demandInterval = 60 * 24; //daily 60 minutes/hour * 24 hours/day
    var period = 1778;
    var workingProcess;

    function init(inventory) {
        //add each process to site
        _.each(DataFactory.siteModel(), function (site) {
            site.isBusy = false;
            if (!site.processes) {
                site.processes = [];
                site.processIDs = [];
            }
            _.each(DataFactory.processModel(), function (process) {
                if (site.SiteID == process.SiteID) {
                    site.processes.push(process);
                    site.processIDs.push(process.ProcessID);
                }
                //add params to process
                loadProcessParams(process, inventory);
            });
        });


    }

    function loadProcessParams(process, inventory, period) {
        // console.log("settting process params", process);
        if (process.ProcessStepName == "Converting") {
            process.rate = 1; //sqyards per min
            process.times = { t1: 20, t2: 5, d1: 5, d2: 5 };
            process.batchSize = 120;
            process.demand = 0;
        } else {
            process.rate = 20; //sqyards per min
            process.times = { t1: 60, t2: 65, d1: 10, d2: 20 };
            process.batchSize = 4000;
        }
        if (!process.output) {
            process.outputAmount = {};
            process.outputAmount[period] = 0;
        }
        process.outputID = process.SiteID.toString() + process.ProductID.toString();
        process.currentBatch = 0;
        process.failureProb = 25;
        process.isBusy = false;
        process.state = 'idle';
        process.previousState = 'idle'
        process.stateTime = 0;
        process.unitCost = 2;
        process.targetInventory = calculateTargetInventory(process);
        process.changeoverCost = calculateChangeoverCost(process);
        process.eoq = calculateEOQ(process);
        process.inventory = calculateInventory(process, inventory);
    }

    function calculateInventory(process, inventory) {

        //todo for now just random invnetory between 0 and 100% of calculateTargetInventory
        var inventoryAmount = 0;
        var rnd = gaussianRand();
        if (rnd > .5) {
            inventory[process.outputID] = process.targetInventory * (1 - rnd);
        } else {
            inventory[process.outputID] = process.targetInventory * (1 - rnd);

        }
    }

    function calculateTargetInventory(process) {
        //Target inventory = average daily volume times loop length in days;
        //for now assume 5 loop
        var totalDemand = 0;
        var numPeriods = 0;
        var returnValue = 0;
        _.each(process.processAllDemand, function (demand) {
            totalDemand += demand;
            numPeriods++;
        });
        process.totalDemand = totalDemand;
        //todo trigger point of 30% maybe should be variable to adjust.
        if (process.totalDemand > 0) {
            process.scheduleTrigger = totalDemand / numPeriods * loop / 30 * .3;
            returnValue = totalDemand / numPeriods * loop / 30;
        }
        // console.log("calculating Target inventory, numPeriods, totalDemand", numPeriods, totalDemand, totalDemand/numPeriods);
        return returnValue;
    }

    function calculateEOQ(process) {
        var carryCost = .2;
        var D = process.totalDemand;  //this is demand for timeframe
        var K = process.changeoverCost; //this is cost of changeoverCost
        var H = process.unitCost * carryCost; // this is holding cost
        var Q = Math.sqrt(2 * D * K / H);
        return Q;

    }

    function calculateChangeoverCost(process) {
        //changeover holdingCost
        var materialCost = 0.75;  //per unit output
        var addedLaborRate = 15;  //15 dollars per hour if additional labor
        var changeoverCost = (process.times['t1'] + process.times['t2']) * addedLaborRate + process.times['t2'] * process.rate * materialCost;
        var workingProcess = {};
        return changeoverCost;
    }

    function runSimulation(inventory) {

        'use strict'
        var t0 = performance.now();

        init(inventory);
        _.each(DataFactory.siteModel(), function (site) {
            console.log("siteModel ", site);
        });
        console.log()

        while (ticks < 100) {
            ticks++;
            console.log("*******************************new tick*******************************");
            console.log("**************************************k*******************************");
            
            //Add demand and set schedules
            demandAndSchedule(inventory);
            // _.each(scheduleList, function(workingProcess){
            //     console.log(workingProcess.ProcessName, " Changed states from ", workingProcess.previousState, " to ", workingProcess.state);
            // })
            time += timeIncrement;
            //console.log("scheduleList", scheduleList);
            var scheduleLength = scheduleList.length;
            for (var i = 0; i < scheduleLength; i++) {
                workingProcess = scheduleList.pop();
                workingProcess.stateTime += timeIncrement;
                //console.log(workingProcess.ProcessStepName, " ticked.  State: ", workingProcess.state, " Time ", workingProcess.stateTime);
                switch (workingProcess.state) {

                    case 'running':
                        //check if breakdown
                        var failureChance = gaussianRand() * 100;
                        if (failureChance < workingProcess.failureProb) {
                            workingProcess.previousState = workingProcess.state;
                            workingProcess.state = 'd1';
                            break;
                        }
                        //check if material is good
                        if (Math.random() > workingProcess.Yield) {
                            //workingProcess.UnitCost is currently code for yield.  TODo
                            adjustInputs(workingProcess, inventory);
                            break;
                        }
                        workingProcess.currentBatch += workingProcess.rate / 60 * timeIncrement;
                        if (workingProcess.currentBatch >= workingProcess.batchSize) {
                            inventory[workingProcess.outputID] += workingProcess.currentBatch;
                            workingProcess.outputAmount += workingProcess.currentBatch;
                            workingProcess.currentBatch = 0;
                        }
                        adjustInputs(workingProcess, inventory);

                        if (workingProcess.outputAmount >= workingProcess.orderSize) {
                            workingProcess.isBusy = false;
                            var workingProcessSite = getSite();
                            workingProcessSite.isBusy = false;
                            workingProcess.previousState = workingProcess.state;
                            workingProcess.state = 'idle';
                            workingProcess.outputAmount = 0;
                            break;
                        }

                        break;
                    case 't1':
                        if (workingProcess.stateTime > workingProcess.times.t1) {
                            workingProcess.previousState = workingProcess.state;
                            workingProcess.state = 't2';
                        }
                        break;
                    case 'd1':
                        if (workingProcess.stateTime > workingProcess.times.d1) {
                            workingProcess.previousState = workingProcess.state;
                            workingProcess.state = 'd2';
                        }
                        break;
                    case 't2':
                        adjustInputs(workingProcess, inventory);
                        if (workingProcess.stateTime > workingProcess.times.t2) {
                            workingProcess.previousState = workingProcess.state;
                            workingProcess.state = 'running';
                        }
                        break;
                    case 'd2':
                        adjustInputs(workingProcess, inventory);
                        if (workingProcess.stateTime > workingProcess.times.d2) {
                            workingProcess.previousState = workingProcess.state;
                            workingProcess.state = 'running';
                        }
                        break;
                    default:
                        console.log("error in workingProcess state switch statement");
                }

                if (workingProcess.state != workingProcess.previousState) {
                    console.log(workingProcess.ProcessName, " Changed states from ", workingProcess.previousState, " to ", workingProcess.state);
                    workingProcess.previousState = workingProcess.state;
                }

                if (workingProcess.isBusy || workingProcess.SiteID == 1049) {
                    scheduleList.unshift(workingProcess);
                }
            }
            time += timeIncrement;

        }

        var t1 = performance.now();
        console.log("time", t1 - t0);


    }

    function adjustInputs(process, inventory) {
        _.each(process.inputs, function (input) {
            inventory[input] -= inventory[input] - process.rate / 60 * timeIncrement;
        });

    }

    function getSite(process) {
        var returnValue = {};
        _.each(DataFactory.siteModel, function (site) {
            if (site.SiteID == process.SiteID) {
                returnValue = site;
            }
        });
        return returnValue;
    }

    function demandAndSchedule(inventory) {
        if ((time > demandInterval || time === 0)) {
            console.log("+++++++++++++++++++++++++++++++++++adjusting demands+++++++++++++++++++++++++++")
            _.each(DataFactory.siteModel(), function (site) {
                console.log("Site", site.SiteID);
                //push all converting with demand;
                if (site.SiteID == 1049) {
                    _.each(site.processes, function (process) {
                        process.demand = process.processAllDemand[period] / 30 * gaussianRand();
                        process.lacksInputs = false;
                        _.each(process.inputs, function (input) {
                            if (inventory[input] < process.demand && process.demand > 0) {
                                process.lacksInputs = true;
                                console.log("Process lacks input", process, "Input is ", input, "process ", getProcessFromOuputID(input));
                            }
                        });
                        console.log("converting process after input checks", process);
                        if (process.demand > 0 && !process.lacksInputs) {
                            console.log("Pushing proces", process);
                            process.previousState = process.state;
                            process.state = 't1';
                            scheduleList.push(process);
                        }
                    });

                } else {
                    if (!site.isBusy) {
                        var highestDeficit = 0;
                        var priorityProcess = {};
                        _.each(site.processes, function (process) {
                            if (inventory[process.outputID] < process.scheduleTrigger && process.PercentLoad > 0) {
                                //check if inputs idle
                                process.lacksInputs = false;
                                _.each(process.inputs, function (input) {
                                    console.log("Checking inputs Math.min", process, Math.min(process.eoq, (process.targetInventory - process.scheduleTrigger)), inventory[input]);
                                    if (inventory[input] < Math.min(process.eoq, (process.targetInventory - process.scheduleTrigger))) {
                                        process.lacksInputs = true;
                                        console.log("Process lacks input", process);
                                    }
                                });
                                if (process.lacksInputs == true) {
                                    return;
                                }
                                var deficit = (process.targetInventory - inventory[process.outputID]) / process.rate; //how long to make up deficit
                                if (deficit > highestDeficit) {
                                    highestDeficit = deficit;
                                    priorityProcess = process;
                                }
                            }
                            if (priorityProcess === process) {
                                if ((priorityProcess.targeetInventory - inventory[priorityProcess.outputID]) > priorityProcess.eoq || priorityProcess.targetInventory < priorityProcess.eoq) {
                                    priorityProcess.orderSize = Math.min(priorityProcess.eoq, (priorityProcess.targetInventory - process.scheduleTrigger));
                                    scheduleList.push(priorityProcess);
                                    process.previousState = process.state;
                                    process.state = 't1';
                                    console.log("Pushing proces", process);
                                    priorityProcess.isBusy = true;
                                    site.isBusy = true;
                                }
                            }
                        });
                    }
                }
            });
        }
        // _.each(scheduleList, function(process){
        //     console.log("Item in schedule ", process.ProcessName, process.lacksInputs);
        //     _.each(process.inputs, function(input){
        //         console.log("Input and inventory", getProcessFromOuputID(input), inventory[input], process.demand || process.orderSize);
        //     })
        // });
    }

    function getProcessFromOuputID(outputID) {
        var returnItem = {};
        _.each(DataFactory.processModel(), function (process) {
            if ((process.SiteID.toString() + process.ProductID.toString()) == outputID) {
                returnItem = process;
            }
        });

        return returnItem;
    }

    function gaussianRand() {
        var RandomCalls = 7;
        var i = RandomCalls;
        var res = 0;
        while (i--) res += Math.random();
        return res / RandomCalls
    }
    return service;
}