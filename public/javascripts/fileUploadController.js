vsapp.controller('fileUploadController', fileUploadController)

fileUploadController.$inject = ['$scope', '$http', '$q'];


function fileUploadController($scope, $http, $q) {

    $scope.formdata = new FormData();
    $scope.getTheFiles = function ($files) {
        console.log("fileUploadController getTheFiles called");
        var file = $files[0];
        // if(typeof file == 'undefined') return;
        console.log("file before append", file);
        $scope.formdata.append('file', file, file.name);
        // formData.append('site', site);
        // angular.forEach($files, function (value, key) {
        //     console.log("key value", key, value);
        //     formdata.append(key, value);
        // });
        console.log("formdata at end of get the Files", $scope.formdata);
    };

    // NOW UPLOAD THE FILES.
    $scope.uploadFiles = function () {
        console.log('uploadfiles called in fileUploadController', $scope.formdata);
        // headers: {'Content-Type': undefined},
        // method: 'POST',
        // url: Urls.uploadUrl,
        // data: formData,
        // transformRequest: angular.identity
        var request = {
            headers: {
                'Content-Type': undefined
            },
            method: 'POST',
            url: '/api/fileupload/',
            data: $scope.formdata,
            transformRequest: angular.identity
        };
        var deferred = $q.defer();
        $http(request).then(function successCallback(response) {
            console.log("succes http call for uploadFiles data ", response);
            deferred.resolve(response);
        }, function errorCallback(response) {
            console.log("error on http call for uploadFiles", response);
            deferred.reject(response);

        });

        return deferred.promise;

    }

};