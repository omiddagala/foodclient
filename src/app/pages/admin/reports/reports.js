(function () {
    'use strict';

    angular.module('BlurAdmin.pages.ad-reports', [])
        .config(routeConfig)
        .controller('adReports', adReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-reports', {
                url: '/ad-reports',
                templateUrl: 'app/pages/admin/reports/reports.html',
                controller: 'adReports'
            });
    }

    function adReports($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD');
        $scope.toDate = moment(new Date()).add('days', 30).format('jYYYY/jM/jD');
        var preventTwiceLoad = true;
        $scope.customer = "R";

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
            var url;
            var param = {
                "value": $scope.name,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'name'
                }
            };
            if ($scope.customer === "R"){
                url = "http://127.0.0.1:9000/v1/adminRestaurantManagementRest/findByName"
            } else {
                url = "http://127.0.0.1:9000/v1/financial/getForceVateCompanyList";
            }
            return $http.post(url, param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.customers = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, url, err, httpOptions);
                });
        };
        $scope.karafeedCommissions = function (id,name) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": id,
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/financial/createKarafeedCommissionInvoice", params, httpOptions)
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
                    mydownload(data,name + moment.utc().format('jYYYYjMjD') + '.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/financial/createKarafeedCommissionInvoice", err, httpOptions);
            });
        };

        $scope.soldToKarafeed = function (id,name) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": id,
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/financial/getRestaurantInvoiceForKarafeed", params, httpOptions)
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
                    mydownload(data,name + moment.utc().format('jYYYYjMjD') + '.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/financial/getRestaurantInvoiceForKarafeed", err, httpOptions);
            });
        };

        $scope.companyBuysOfKarafeed = function (id,name) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": id,
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/financial/getInvoiceOfKarafeedForCompany", params, httpOptions)
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
                    mydownload(data,name + moment.utc().format('jYYYYjMjD') + '.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/financial/getInvoiceOfKarafeed", err, httpOptions);
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
        $scope.customerChanged = function(c){
            $scope.customer = c;
            $scope.$broadcast('refreshMyTable');
        };
        var delayTimer;
        $scope.nameChanged = function () {
            var l = $scope.name.length;
            if (l > 2 || l === 0) {
                clearTimeout(delayTimer);
                delayTimer = setTimeout(function () {
                    $scope.$broadcast('refreshMyTable');
                }, 1000);
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
