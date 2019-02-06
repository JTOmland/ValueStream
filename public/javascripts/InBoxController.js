vsapp.controller('InBoxController', InBoxController)

InBoxController.$inject = ['$scope', '$mdDialog', '$mdToast', '$q', '$timeout', '$log'];


function InBoxController($scope, $mdDialog, $mdToast, $q, $timeout, $log) {

    //not sure if I will use these or not.  the simulate query can be removed but for now I think auto-complete needs a promise returned
    $scope.simulateQuery = false;
    $scope.isDisabled = false;

    // $scope.activeItem = {
    //     'type': 'action',
    //     'process': 'default',
    //     'title': '',
    //     'inputs': [],
    //     'status': 'active',
    //     'due': '',
    //     'defer': '',
    //     'context': '',
    //     'project': ''
    // }


    //temp data to debug
    $scope.actions = [
        {
            'type': 'project',
            'process': 'parrallel',
            'title': '24J spec review',
            'inputs': [],
            'status': 'active',
            'due': '',
            'defer': '',
            'context': '@work',
            'project': '24J cast station'
        },
        {
            'type': 'action',
            'process': 'parrallel',
            'title': 'call American Family',
            'inputs': [],
            'status': 'active',
            'due': '',
            'defer': '',
            'context': '@phone',
            'project': 'Purchase Nest Thermostat'
        },
        {
            'type': 'action',
            'process': 'parrallel',
            'title': 'Make a birthday list',
            'inputs': [],
            'status': 'active',
            'due': '',
            'defer': '',
            'context': '',
            'project': 'Improve relationships'
        }
    ]
   
    $scope.contexts = [];
    $scope.projects = [];

    $scope.newContext = function (context) {
        alert("you added a new context" + context);
    }

    $scope.newProject = function (project) {
        alert("you added a new project")
    }

    $scope.contextSearch = function (contextQuery) {
        var results = contextQuery ? $scope.contexts.filter(createContextFilter(contextQuery)) : [];
        console.log("simulateQuery value", $scope.simulateQuery)
        // var deferred;
        // if ($scope.simulateQuery) {
        //     deferred = $q.defer();
        //     $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
        //     return deferred.promise;
        // } else {
        //     return results;
        // }
        return results;

    }

    $scope.projectSearch = function (projectQuery) {
        //console.log("projects", $scope.projects, projectQuery);
        //console.log("createContextFilter returns", createContextFilter(projectQuery));
        //console.log("result of function test", $scope.projects[0].indexOf('24J'))
        var results = projectQuery ? $scope.projects.filter(createContextFilter(projectQuery)) : [];
        //console.log("in projectSearch", results);
        var deferred;
        if ($scope.simulateQuery) {
            deferred = $q.defer();
            $timeout(function () { deferred.resolve(results); }, Math.random() * 1000, false);
            return deferred.promise;
        } else {
            return results;
        }

    }

    $scope.searchContextChange = function (text) {
        console.log('Text for context changed to ' + text);
    }

    $scope.selectedContextChange = function (context, action) {
        $log.info('Item changed to ' + JSON.stringify(context) + ' ' + JSON.stringify(action));
        // if (context) {
        //     action.context = context.display;
        // }
    }

    $scope.selectedProjectChange = function (context, action) {
        $log.info('Item changed to ' + JSON.stringify(context) + ' ' + JSON.stringify(action));
        // if (context) {
        //     action.context = context.display;
        // }
    }


    //build a filter for the searchquery.  Sends a function back to use in filter to find case insensitive matches
    function createContextFilter(contextQuery) {
        var lowercaseQuery = contextQuery.toLowerCase();
        console.log("createContextFilter lowercaseQuery", lowercaseQuery);

        return function filterFn(item) {
            return (item.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
    }

    //init temp goes through actions and builds arrays for projects and contexts
    function init() {
        _.each($scope.actions, function (action) {
            if (action.project) {
                if (!_.includes($scope.projects, action.project)) {
                    $scope.projects.push(action.project);
                }
            }
            if (action.context) {
                if (!_.includes($scope.contexts, action.context)) {
                    $scope.contexts.push(action.context);
                }
            }
        });

        console.log("initial projects and contexts", $scope.projects, $scope.contexts)

    }
    init();



};