(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-employee-remains-reports', [])
        .config(routeConfig)
        .controller('coEmployeeRemainsReports', coEmployeeRemainsReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-employee-remain', {
                url: '/co-employee-remain',
                templateUrl: 'app/pages/company/reports/employee-remains.html',
                controller: 'coEmployeeRemainsReports'
            });
    }

    function coEmployeeRemainsReports($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {


        $scope.getAllEmployeesBalancePDF = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
            };
            $http.post("http://127.0.0.1:9000/v1/company/getAllEmployeesBalancePDF", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    if (data === "-1") {
                        showMessage(toastrConfig,toastr,'پیام','رکوردی یافت نشد','success');
                        return;
                    }
                    if (data === "-2") {
                        showMessage(toastrConfig,toastr,'پیام','شما مجاز به انجام این عملیات نیستید','success');
                        return;
                    }   if (data === "-403") {
                        showMessage(toastrConfig,toastr,'پیام','انجام این عملیات برای کاربر شما غیر فعال است','success');
                        return;
                    }
                    mydownload(data, 'balance' + moment.utc().format('jYYYYjMjD') + '.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/company/getAllEmployeesBalancePDF", err, httpOptions);
            });
        };


        //vahid seraj updated code. (1397.10.01) ------------- [start]
        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        }
        //vahid seraj updated code. (1397.10.01) ------------- [end]
    }
})();
