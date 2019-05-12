(function () {
    'use strict';

    angular.module('BlurAdmin.pages.employee.transfer', [])
        .config(routeConfig)
        .controller('transferCtrl', transferCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('transfer', {
                url: '/transfer',
                templateUrl: 'app/pages/employee/transfer/transfer.html',
                controller: 'transferCtrl'
            });
    }

    function transferCtrl($scope, fileReader, $filter, $uibModal, $http, $rootScope, localStorageService, $state, toastrConfig, toastr) {
        $scope.initCtrl = function () {
            $scope.submitted = false;
            $(".modal-dialog").click(function () {
                $("#col-dropdown").css("display", "none");
            })
        };
        var delayTimer;
        $scope.searchColleagues = function () {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function () {
                startLoading();
                var token = localStorageService.get("my_access_token");
                var httpOptions = {
                    headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
                };

                $http.post("https://demoapi.karafeed.com/v1/employee/findCompanyCoWorkerByName",
                    //$("#colNameToSearch").val(), 
                    $scope.colNameToSearch,
                    httpOptions)
                    .success(function (data, status, headers, config) {
                        $rootScope.colNames = data;
                        $("#col-dropdown").css("display", "block");
                        $scope.colId = null;
                        $scope.colNotSelected = false;
                        stopLoading();
                    }).catch(function (err) {
                        stopLoading();
                        if (err.status === 401) {
                            $rootScope.logout();
                        }
                        // menuService.stopLoading();
                        // menuService.myHandleError(err);
                    });
            }, 1000);
        };
        $scope.colSelected = function (id) { //vahid seraj updated code (1397/10/18)
            $scope.colId = id;
            $scope.colNameToSearch = $rootScope.colNames.filter(function (item) {
                return item.id === id;
            })[0].name;
            $scope.colNotSelected = false;
        };
        $scope.doTransfer = function (form) {
            $scope.submitted = true;
            if (!form.$valid) {
                return;
            }
            if (!$scope.colId) {
                $scope.colNotSelected = true;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var param = {
                "comment": $('#desc').val(),
                "destinationAccountId": $scope.colId,
                "sourceAccountId": null,
                "transferAmount": $scope.amount, // $('#amount').val()
            };
            $http.post("https://demoapi.karafeed.com/v1/employee/employeeToEmployeeTransfer", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $rootScope.loadBalanceByRole();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/employee/employeeToEmployeeTransfer", err, httpOptions);
                });
        };

        $scope.goBack = function () {
            $state.go("home");
        }

    }
})();
