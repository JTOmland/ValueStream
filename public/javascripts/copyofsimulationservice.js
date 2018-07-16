angular
    .module('vsapp')
    .factory('SimulationService', SimulationService);

SimulationService.$inject = ['DataFactory'];
function SimulationService(DataFactory) {
    var service = {
        runSimulation: runSimulation,
        random: gaussianRand
    };
    var reports = { outputs: [], wastes: [], productionHours: [], completions: [] };
    var unitTime = 60; //minutes
    var stop = false;
    var timePassed = 0;
    var loadParams = true;
    var periodOver = false;
    var runningProcesses = [];
    var looptime = 5; //in days
    var carryCost = .15;
    var scheduleStack = [];
    var periodLength = 30; //days

    function runSimulation(inventory) {
        console.log("runSimulation datafactory process model", DataFactory.processModel());
        //DataFactory.processModel()[0].newItem = "jeff";
        console.log(DataFactory.processModel()[0]);
        buildScheduleStack();
        return;

        'use strict'
        init();
        var beginInventory = angular.copy(inventory);
        console.log("started simulation inventory", inventory);

        //this shouldn't be needed once data model correct and loaded from DB
        if (loadParams) {
            _.each(DataFactory.processModel(), function (process) {
                process.outputID = process.SiteID.toString() + process.ProductID.toString();
                loadProcessParams(process, period);
            });
            loadParams = false;
        }
        // var targetInventory = {};
        // var currentDemands = [];
        // //initial target Inventory equals inventory for now
        // var keys = Object.keys(inventory);
        // _.each(keys, function(key){
        //     targetInventory[key] = inventory[key];
        // });

        var period = DataFactory.demandModel()[0].PeriodID;
        buildScheduleStack(DataFactory);
        // currentDemands = getDemands(period, currentDemands, inventory,targetInventory, true);
        // runningProcesses = getProcessesToProcess(currentDemands, runningProcesses);
        _.each(scheduleStack, function (process) {
            console.log("schedule stack before beginning.", process.ProcessName, process.ProcessID);
        });

        while (!periodOver && scheduleStack.length > 0) {
            timePassed += unitTime;
            _.each(scheduleStack, function (process) {
                console.log("schedule stack at start of while", process.ProcessName, process.WorkCenterName);
            });

            //Refresh demands
            if (timePassed > 23 * 60 && timePassed % 1440 == 0) {
                buildScheduleStack(DataFactory);
                // currentDemands = getDemands(period, currentDemands, inventory,targetInventory, false);
                // runningProcesses = getProcessesToProcess(currentDemands, runningProcesses);
            }
            var workingProcess = scheduleStack.pop(); //pulls off end of array.
            console.log("Current workingProcess ", workingProcess);
            //Add time to current state
            workingProcess.stateTime += unitTime;
            //Check if wasting material
            if (workingProcess.state == 'd2' || workingProcess.state == 't2') {
                workingProcess.wastes[workingProcess.state] += workingProcess.rate * unitTime;
                //subtract usages on inputs
                _.each(workingProcess.inputs, function (inputProduct) {
                    if (!inventory[inputProduct]) {
                        console.log("no inventory for input ", inputProduct);
                    } else {
                        inventory[inputProduct] -= workingProcess.rate * unitTime;
                    }
                });
            };
            //If running
            if (workingProcess.state == 'run') {
                workingProcess.currentBatch += workingProcess.rate * unitTime;
                console.log("In running state", workingProcess.ProcessName, " for currentBatch ", workingProcess.currentBatch);
                if (workingProcess.currentBatch >= workingProcess.batchSize) {
                    if (workingProcess.ProcessStepName != "Converting") {
                        inventory[workingProcess.outputID] += workingProcess.currentBatch;
                    }
                    workingProcess.outputAmount[period] += workingProcess.currentBatch;
                    workingProcess.currentBatch = 0;
                    //subtract usages on inputs
                    _.each(workingProcess.inputs, function (inputProduct) {
                        if (!inventory[inputProduct]) {
                            console.log("no inventory for input ", inputProduct);
                        } else {
                            console.log("subtracting input");
                            inventory[inputProduct] -= workingProcess.rate * unitTime;
                        }
                    });
                }
                //check if machine went down
                // var random = Math.floor(Math.random() * 100);
                // if(random < workingProcess.failureProb){
                //     workingProcess.statePointer++;
                //     workingProcess.state = workingProcess.states[workingProcess.statePointer];
                //     // console.log("breakdown state is now", workingProcess.state);
                // }
            }
            //Check state and update
            if (workingProcess.stateTime > workingProcess.times[workingProcess.state] && workingProcess.state != 'run') {
                workingProcess.statePointer++;
                workingProcess.stateTime = 0;
                if (workingProcess.statePointer >= workingProcess.states.length) {
                    workingProcess.statePointer = 2;
                }
                workingProcess.state = workingProcess.states[workingProcess.statePointer];
                //workingProcess.stateTime +=unitTime;
                console.log("workingProcess ", workingProcess.ProcessName, " state change", workingProcess.state)
            }
            //Check if order finished
            if (workingProcess.outputAmount[period] >= workingProcess.demand[period]) {
                console.log("Order completed for ", workingProcess);
                var completedData = {};
                completedData[workingProcess.ProcessName] = { "Amount": workingProcess.outputAmount[period], "Time": timePassed };
                reports.completions.push(completedData);
                var wcToReset = findWorkCenter(workingProcess);
                wcToReset.isMaking = false;
                loadProcessParams(workingProcess, period);
                continue;
            }
            runningProcesses.unshift(workingProcess);

            //console.log("Time passed ", timePassed);
            if (timePassed > 30 * 24 * 60) {
                periodOver = true;
            }
        }
        console.log(reports);
        _.each(beginInventory, function (item, i) {
            console.log("Inventory item, i", item, " ", i);
            if (inventory[i]) {
                console.log(i, " Begin ", item, " End ", inventory[i]);
                console.log("Difference ", item - inventory[i]);
            } else {
                console.log("no end inventory for ", i);
            }

        })
        console.log("inventories at finsish", beginInventory);
        console.log("Finished Simulation");
        // });
    }

    function checkInventories(workingProcess, inventory) {
        //console.log("checking inentorys for process ", workingProcess);
        _.each(workingProcess.inputs, function (input) {
            //var inputProduct = input.SiteID.toString() + input.ProductID.toString();
            // console.log("working input rate and unitTime ", workingProcess.rate, " : ", unitTime)
            // console.log("working input ", input, " inventory of input ",inventory[input], " amount input ", workingProcess.rate * unitTime);
            if (inventory[input] < workingProcess.rate * unitTime) {
                // console.log("working input returning false")
                return true;
            }
        });
        // console.log("Working input returning true")
        return false;
    }

    function init() {
        _.each(DataFactory.workCenterModel, function (workcenter) {
            if (!workcenter.processes) {
                workcenter.processes = [];
            }
            _.each(DataFactory.processModel, function (process) {
                if (workcenter.WorkCenterID == process.WorkCenterID) {
                    workcenter.processes.push(process);
                }
            })
        })
    }

    function loadProcessParams(process, period) {
        // console.log("settting process params", process);
        if (process.ProcessStepName == "Converting") {
            process.rate = 10; //sqyards per min
            process.eoq = 10;
            process.batchSize = 120;
        } else {
            process.rate = 20; //sqyards per min
            process.eoq = 4000;
            process.batchSize = 4000;
        }
        if (!process.output) {
            process.outputAmount = {};
            process.outputAmount[period] = 0;
        }
        process.times = { t1: 60, t2: 65, d1: 10, d2: 20 };
        process.actuals = { d1: 0, d2: 0, t2: 0, run: 0, t1: 0 }
        process.statePointer = 0;
        process.states = ['t1', 't2', 'run', 'd1', 'd2'];
        process.state = process.states[process.statePointer];
        process.stateTime = 0;
        process.currentBatch = 0;
        process.failureProb = 25;
        process.wastes = { d2: 0, t2: 0 };
        process.isMaking = false;
        process.unitCost = 2;
        process.targetInventory = calculateEOQ(process); //calculateTargetInventory(process);
        process.changeoverCost = calculateChangeoverCost(process);
        process.eoq = calculateEOQ(process);
    }

    function calculateTargetInventory(process) {
        //Target inventory = average daily volume times loop length in days;
        //for now assume 5 loop
        var totalDemand = 0;
        var numPeriods = 0;
        _.each(process.processAllDemand, function (demand) {
            totalDemand += demand;
            numPeriods++;
        });
        process.totalDemand = totalDemand;
        //todo trigger point of 30% maybe should be variable to adjust.
        process.scheduleTrigger = totalDemand / numPeriods / (periodLength / looptime);
        console.log("Processschedule trigger", process.ProcessStepName, ":", process.scheduleTrigger)
        console.log("calculate target inventory totaldemand and target", totalDemand, ":", totalDemand / numPeriods * looptime);
        return process.scheduleTrigger;
    }

    function calculateEOQ(process) {
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
        var changeoverCost = process.times['t1 + t2'] * addedLaborRate + process.times['t2'] * process.rate * materialCost
        return changeoverCost;
    }

    function findWorkCenter(process) {
        var match = _.each(DataFactory.workCenterModel(), function (wc) {
            return wc.WorkCenterID == process.WorkCenterID
        });

        return match;
    }

    function getProcessesToProcess(currentDemands, runningProcesses) {
        _.each(currentDemands, function (process) {
            console.log("getProcessesToProcess and currentDemands", process.ProcessID, " workcenter ", process.WorkCenterName);

        });

        // console.log("getting running processes", currentDemands, runningProcesses);
        _.each(DataFactory.workCenterModel(), function (workcenter) {
            if (!workcenter.isMaking) {
                _.each(currentDemands, function (process) {
                    if (process.WorkCenterID == workcenter.WorkCenterID) {
                        console.log("Inside get processes and process to check eoq is", process.eoq);
                        if (process.currentDemand > process.eoq) {
                            process.isMaking = true;
                            workcenter.isMaking = true;
                            runningProcesses.unshift(process);
                        }
                    }
                });
                //    _.each(DataFactory.processModel(), function(process){
                //         if(currentDemands[process.outputID] && currentDemands[process.outputID > process.eoq]){
                //             process.isMaking = true;
                //             workcenter.isMaking = true;
                //             runningProcesses.unshift(process);  //adds to beginning of array which is end using pop
                //         }
                //     });
            }
        });
        return runningProcesses;
    }

    function createReport() {

        _.each(DataFactory.processModel(), function (process) {
            var outputData = {};
            var wastesData = {};
            outputData[process.outputID] = process.outputAmount;
            wastesData[process.outputID] = process.wastes;
            reports.outputs.push(outputData);
            reports.wastes.push(wastesData);

        })

        console.log("Report ", reports);
    }

    function buildScheduleStack(DataFactory) {
        console.log("Datafactory in buildScheduleStack", DataFactory);
        return;
        //todo could consider adding a check for priority before putting a wc process on stack.
        _.each(Datafactory().workCenterModel(), function (workcenter) {
            if (!workcenter.isBusy) {
                _.each(workcenter.processes, function (process) {
                    if (process.inventory[period] < process.scheduleTrigger) {
                        scheduleStack.push(process);
                        process.isBusy = true;
                        workcenter.isBusy = true;
                    }
                });
            }
        });
    }

    function getDemands(period, currentDemands, inventory, targetInventory, isNewPeriod) {
        //console.log("Getting demands", period);
        var demand = 0;
        _.each(DataFactory.processModel(), function (process) {
            if (process.UnitTime != 0) {
                if (!process.demand) {
                    process.demand = {};
                }
                if (!process.demand[period]) {
                    process.demand[period] = 0;
                }
                if (!process.outputAmount[period]) {
                    process.outputAmount[period] = 0;
                }
                if (process.NextProcessStepName == "None") {
                    // console.log("Found last process")
                    process.demand[period] += process.processAllDemand[period] / 30 * gaussianRand();
                    if (isNewPeriod) {
                        //add remaining non filled demand from previous period
                        if (process.demand[period - 1]) {
                            //makde sure it's not the first period before adding
                            process.demand[period] += process.demand[period - 1];
                        }
                    }
                    process.currentDemand = process.demand[period] - process.outputAmount[period];

                } else if (process.UnitTime > 0) {
                    // demand = process.processAllDemand[period]/runFrequency;
                    var demandToAdd = targetInventory[process.outputID] - inventory[process.outputID];
                    process.demand[period] += demandToAdd;
                    process.currentDemand = demandToAdd;
                }
                console.log("Not contains ", !_.contains(currentDemands, process), " for ", process.ProcessName);
                if (process.currentDemand > 0 && !_.contains(currentDemands, process)) {
                    currentDemands.push(process);
                    //console.log("adding demand to currentDemands", currentDemands);
                }
            }
        });

        return currentDemands;
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