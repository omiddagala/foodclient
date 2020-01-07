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
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD');
        $scope.toDate = moment(new Date()).add('days', 30).format('jYYYY/jM/jD');
        var preventTwiceLoad = true;

        $scope.search = function (pagination, sort) {
            if (preventTwiceLoad) {
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var param = {
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ'),
                pageableDTO: {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'deliveryDate'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/companyInvoice/getOfficialInvoiceList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.rests = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/companyInvoice/getOfficialInvoiceList", err, httpOptions);
                });
        };

        $scope.getPdf = function (id) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": id
            };
            $http.post("http://127.0.0.1:9000/v1/companyInvoice/getInvoiceOfKarafeedById", params, httpOptions)
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
                    mydownload(data,'invoice' + moment.utc().format('jYYYYjMjD') + '.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/companyInvoice/getInvoiceOfKarafeedById", err, httpOptions);
            });
        };

        $scope.getExcel = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                endDate: moment.utc($scope.toDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ'),
                startDate: moment.utc($scope.fromDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/companyInvoice/getKarafeedInvoiceListExcel", params, httpOptions)
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
                    mydownload(data,'invoice' + moment.utc().format('jYYYYjMjD') + '.xls','vnd.ms-excel',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/companyInvoice/getKarafeedInvoiceListExcel", err, httpOptions);
            });
        };

        $scope.dateChanged = function (date, isFromDate) {
            if (isFromDate) {
                $scope.fromDate = date;
            } else {
                $scope.toDate = date;
            }
            $scope.$broadcast('refreshMyTable');
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
