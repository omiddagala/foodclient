(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-formal-factor-reports', [])
        .config(routeConfig)
        .controller('coFormalFactorReports', coFormalFactorReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-formal-factor', {
                url: '/co-formal-factor',
                templateUrl: 'app/pages/company/reports/formal-factor.html',
                controller: 'coFormalFactorReports'
            });
    }

    function coFormalFactorReports($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.commissionDate = moment(new Date()).format('jYYYY/jM/jD');

        $scope.getOfficialInvoice = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "date": moment.utc($scope.commissionDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/company/getOfficialInvoice", params, httpOptions)
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
                    mydownload(data,'invoice.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/company/getOfficialInvoice", err, httpOptions);
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
