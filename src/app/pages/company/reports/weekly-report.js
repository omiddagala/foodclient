(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-weekly-reports', [])
        .config(routeConfig)
        .controller('coWeeklyReports', coWeeklyReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-weekly-reports', {
                url: '/co-weekly-reports',
                templateUrl: 'app/pages/company/reports/weekly-report.html',
                controller: 'coWeeklyReports'
            });
    }

    function coWeeklyReports($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.commissionDate = moment(new Date()).format('jYYYY/jM/jD');
        var preventTwiceLoad = true;

        $scope.goToFactors = function() {
            $location.path('/co-factor-reports');
        };

        $scope.factorsOfKarafeed = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "date": moment.utc($scope.commissionDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/company/getInvoiceOfKarafeed", params, httpOptions)
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
                    mydownload(data,'karafeed-commissions.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/company/getInvoiceOfKarafeed", err, httpOptions);
            });
        };

        $scope.commissionDateChanged = function (d) {
            $scope.commissionDate = d;
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
