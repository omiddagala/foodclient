(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-employee-buy-reports', [])
        .config(routeConfig)
        .controller('coEmployeeBuyReports', coEmployeeBuyReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-employee-buy', {
                url: '/co-employee-buy',
                templateUrl: 'app/pages/company/reports/employee-buy.html',
                controller: 'coEmployeeBuyReports'
            });
    }

    function coEmployeeBuyReports($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD');
        $scope.toDate = moment(new Date()).add('days', 30).format('jYYYY/jM/jD');


        $scope.employeesBuyReport = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/company/getEmployeesBuyReport", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    if (data === "-1") {
                        showMessage(toastrConfig,toastr,'پیام','رکوردی یافت نشد','success');
                        return;
                    }
                    if (data === "-2") {
                        showMessage(toastrConfig,toastr,'پیام','شما مجاز به انجام این عملیات نیستید','success');
                        return;
                    }
                    mydownload(data, 'report.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/company/getEmployeesBuyReport", err, httpOptions);
            });
        };

        $scope.dateChanged = function (date, isFromDate) {
            if (isFromDate) {
                $scope.fromDate = date;
            } else {
                $scope.toDate = date;
            }
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
