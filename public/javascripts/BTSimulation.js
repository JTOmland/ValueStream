'use strict'
angular
    .module('vsapp')
    .factory('BTSimulation', BTSimulation);

BTSimulation.$inject = ['DataFactory'];
function BTSimulation(DataFactory) {
    var service = {
        runSimulation: runSimulation,
        random: gaussianRand
    };

    var scheduleList = [];
    var loop = 15; //TODo

    function init(inventory) {
        //add each process to workcenter
        _.each(DataFactory.workCenterModel(), function (workcenter) {
            workcenter.isBusy = false;
            if (!workcenter.processes) {
                workcenter.processes = [];
            }
            _.each(DataFactory.processModel(), function (process) {
                if (workcenter.WorkCenterID == process.WorkCenterID) {
                    workcenter.processes.push(process);
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
        process.isMaking = false;
        process.unitCost = 2;
        process.targetInventory = calculateTargetInventory(process);
        process.changeoverCost = calculateChangeoverCost(process);
        process.eoq = calculateEOQ(process);
        process.inventory = calculateInventory(process, inventory);
    }

    function calculateInventory(process, inventory) {

        return inventory[process.outputID]/20 || 0;
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
        var changeoverCost = (process.times['t1'] + process.times['t2']) * addedLaborRate + process.times['t2'] * process.rate * materialCost
        return changeoverCost;
    }

    function runSimulation(inventory) {

        'use strict'
        var t0 = performance.now();
        
        init(inventory);

        var blackboard = new b3.Blackboard();

        // Creating an Action Node
        var AddDemand = b3.Class(b3.Action);
        AddDemand.prototype.name = 'AddDemand';
        AddDemand.prototype.parameters = { 'period': 1778 };
        AddDemand.prototype.__Action_initialize = AddDemand.prototype.initialize;
        AddDemand.prototype.initialize = function (settings) {
            //console.log("Initializing AddDemand settings", settings);
            settings = settings || 0;
            this.__Action_initialize();
            this.period = 1778;
        }
        AddDemand.prototype.open = function (tick) {
            //console.log("opeining AddDemand and this.period", this.period);
            tick.blackboard.set('period', this.period, tick.tree.id);
        }
        AddDemand.prototype.tick = function (tick) {
            if (tick.target.ProcessStepName == 'Converting' && tick.blackboard.get('CheckDemand', tick.tree.id)) {
                console.log("period and demand", tick.blackboard.get('period', tick.tree.id), " :  ", tick.target.processAllDemand[tick.blackboard.get('period', tick.tree.id)])
                tick.target.demand += tick.target.processAllDemand[tick.blackboard.get('period', tick.tree.id)] / (30) * 2 * gaussianRand();
               // console.log("Adding demand to Converting products", tick.target.ProcessName, " Demand ", tick.target.demand);
            }
            return b3.SUCCESS;
        }

        var NewDay = b3.Class(b3.Action);
        NewDay.prototype.name = 'NewDay';
        NewDay.prototype.parameters = {'newDay': 24 * 60, 'totalTime': 0, 'tickTime': 1};
        NewDay.prototype.__Action_initialize = NewDay.prototype.initialize;
        NewDay.prototype.initialize = function (settings) {
            settings = settings || {};

            this.__Action_initialize();
            this.newDay = settings.newDay || 1;
            this.totalTime = settings.totalTime || 0;
            this.tickTime = settings.tickTime || 1;
        }
        NewDay.prototype.open = function (tick) {
            var startTime = 0;
            tick.blackboard.set('startTime', startTime, tick.tree.id, this.id);
            tick.blackboard.set("TotalTime", this.totalTime, tick.tree.id, this.id);
            tick.blackboard.set('tickTime', this.tickTime, tick.tree.id);
            tick.blackboard.set('CheckDemand', true, tick.tree.id);
        }
        NewDay.prototype.tick = function (tick) {
            //console.log("Checking new day");
            if(tick.target.first){
                var timePassed = tick.blackboard.get("TotalTime", tick.tree.id, this.id);
                timePassed++;
                tick.blackboard.set("TotalTime", timePassed, tick.tree.id, this.id);
                if (tick.blackboard.get("TotalTime", tick.tree.id, this.id) > this.newDay) {
                    tick.blackboard.set("TotalTime", 0, tick.tree.id, this.id);
                    console.log("New day amount", this.newDay);
                    console.log("Blackboard", tick.blackboard.get("TotalTime", tick.tree.id, this.id));
                    tick.blackboard.set('CheckDemand', true, tick.tree.id);
                    return b3.SUCCESS;
                }
                return b3.RUNNING;
            } else {
                return b3.FAILURE;
            }
        }


        var WCBusy = b3.Class(b3.Action);
        WCBusy.prototype.name = 'Workcenter Busy';
        WCBusy.prototype.tick = function (tick) {
            if (tick.target.isBusy) {
               // console.log("Workcenter is busy", tick.target);
                return b3.FAILURE;
            } else {
                //console.log("Workcenter is NOT busy");
                return b3.SUCCESS;
            }
        }

        var InventoryCheck = b3.Class(b3.Action);
        InventoryCheck.prototype.name = 'Inventory vs Target';
        InventoryCheck.prototype.tick = function (tick) {
            //console.log("checking inventory");
            if(!tick.blackboard.get("CheckDemand", tick.tree.id)){
                return b3.SUCCESS;
            }
            tick.blackboard.set("CheckDemand", false, tick.tree.id);
            if (tick.target.ProcessStepName == "Converting") {
                //console.log("Inventory check for converting", tick.target.demand);
                if (tick.target.demand > 0) {
                    scheduleList.push(tick.target);
                    return b3.SUCCESS;
                } else {
                    scheduleList.pop(tick.target);
                    console.log("Poping item from schedule", scheduleList);
                    return b3.FAILURE;
                }
            }

            if (!tick.blackboard.get('busyWorkcenters', tick.tree.id)) {
                tick.blackboard.set('busyWorkcenters', [], tick.tree.id);
            }

            if (inventory[tick.target.outputID] < tick.target.targetInventory && tick.target.eoq < (tick.target.targetInventory - tick.target.inventory) && !_.contains(tick.blackboard.get('busyWorkcenters'), tick.target.WorkCenterID)) {
                tick.blackboard.get('busyWorkcenters', tick.tree.id).push(tick.target.WorkCenterID);
                scheduleList.push(tick.target);
                console.log("Poping item from schedule", scheduleList);
                //console.log("Inventory Low schedule process ", tick.target, tick.blackboard.get('busyWorkcenters', tick.tree.id));
                return b3.SUCCESS;
            }else {
                    scheduleList.pop(tick.target);
                    return b3.FAILURE;
            }

            return b3.FAILURE;
        }

        var ProcessRunSequence = b3.Class(b3.Composite);
        ProcessRunSequence.prototype.name = 'ProcessRunSequence';
        ProcessRunSequence.prototype.tick = function (tick) {
            //Iterates over childredn
            for (var i = 0; i < this.children.length; i++) {
                //Propogate tick
                var status = this.children[i]._execute(tick);
                if (status !== b3.SUCCESS) {
                    return status;
                }
            }
            return b3.SUCCESS;
        }

        var ProcessRunning = b3.Class(b3.Action);
        ProcessRunning.prototype.name = 'Process Making Product';
        ProcessRunning.prototype.tick = function (tick) {
            //console.log("Process Making", tick.target);
            //add output to process
            if(tick.target.ProcessStepName !== 'Converting'){
                console.log("Non Converting running");
            }
            tick.target.currentBatch += tick.target.currentBatch + tick.target.rate;
            var Output = {};
            Output.process = tick.target.ProcessName;
            Output.amounnt = tick.target.currentBatch;
            tick.blackboard.set('Outputs', Output, tick.tree.id, this.id);
            if (tick.target.inputs) {
                _.each(tick.target.inputs, function (input) {
                    inventory[input] -= tick.target.rate;
                });
            }
            return b3.SUCCESS;
        }

        var ProcessDownEvent = b3.Class(b3.Action);
        ProcessDownEvent.prototype.name = 'Process DT Check';
        ProcessDownEvent.prototype.tick = function (tick) {
           // console.log("Process DT Check random ", gaussianRand());
            //check downtime
            if (gaussianRand() * 100 < tick.target.failureProb) {
                return b3.FAILURE;
            }
            return b3.SUCCESS;
        }

        var ProcessRunSequence = new b3.Sequence({
            children:
            [new ProcessDownEvent(), new ProcessRunning()]
        });


        var tree = new b3.BehaviorTree();
        tree.root = new b3.Sequence({
            children:
            [new b3.Sequence({ children: [new NewDay({'newDay': 24 * 60, 'totalTime': 0, 'tickTime': 1}), new AddDemand(10)] }),
            new InventoryCheck(), ProcessRunSequence,
            ]
            // })]
        });

        //console.log("DataFactor process model ", DataFactory.processModel());

        //console.log("DataFactor process model ", DataFactory.processModel()[0]);
        var foundFirst = false;
        scheduleList = DataFactory.processModel();
        for (var ticks = 0; ticks < 2 * 24 * 60; ticks++) {

            _.each(scheduleList, function (process) {
                var target = process;
                //console.log("Process target ", process);
                tree.tick(target, blackboard);
                //console.log("Target that was ticked", target);
            });
            
        }
        
        var t1 = performance.now();
        console.log("time", t1 - t0);


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