(function () {
    'use strict';

    angular.module('BlurAdmin.pages.ad-sms', [])
        .config(routeConfig)
        .controller('adminSmsCtrl', adminSmsCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-sms', {
                url: '/ad-sms',
                templateUrl: 'app/pages/admin/sms/list.html',
                controller: 'adminSmsCtrl'
            });
    }

    function adminSmsCtrl($scope, $filter, editableOptions, editableThemes,$rootScope, $state, $q, $http, localStorageService, $location,$uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;

        $scope.search = function (pagination, sort,search) {
            if (preventTwiceLoad){
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'id'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/getFailedRegistrationSmsList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.smsList = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminEmployeeManagementRest/getFailedRegistrationSmsList", err, httpOptions);
                });

        };

        $scope.sendMessage = function (username,index) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'text/plain; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/resendRegistrationSms", username, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    if (data.data) {
                        $scope.smsList.splice(index, 1);
                        if ($scope.smsList.length === 0) {
                            $scope.$broadcast('refreshMyTable');
                        }
                        showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    } else {
                        showMessage(toastrConfig, toastr, "خطا", "ارسال مجدد پیام با خطا مواجه شد. لطفا مجددا تلاش کنید.", "error");
                    }
                }).catch(function (err) {
                $rootScope.handleError(username, "/adminEmployeeManagementRest/resendRegistrationSms", err, httpOptions);
            });
        };

        $scope.getSmsType = function (s) {
            if (s === "REGISTRATION") {
                return "ثبت نام";
            } else if (s === "DELIVERY") {
                return "تحویل";
            }
        }

    }
})();