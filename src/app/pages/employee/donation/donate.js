(function () {
    'use strict';

    angular.module('BlurAdmin.pages.donate', [])
        .config(routeConfig)
        .controller('donateCtrl', donateCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('donate', {
                url: '/donate',
                templateUrl: 'app/pages/employee/donation/donate.html',
                controller: 'donateCtrl'
            });
    }

    function donateCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, $rootScope,localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {

        $scope.donate = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "comment": $scope.desc, // $("#desc").val()
            };
            $http.post("https://demoapi.karafeed.com/v1/employee/giveFoodToCharity", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/giveFoodToCharity", err, httpOptions);
            });
        };

    }
})();