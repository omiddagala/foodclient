(function () {
    'use strict';

    angular.module('BlurAdmin.pages.formal-factor', [])
        .config(routeConfig)
        .controller('formalFactor', formalFactor);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('formal-factor', {
                url: '/formal-factor',
                templateUrl: 'app/pages/admin/formal-factor/formal.html',
                controller: 'formalFactor'
            });
    }

    function formalFactor($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.sdate = moment(new Date()).format('jYYYY/jM/jD');
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
            var url;
            var param = {
                "name": $scope.name,
                "date": moment.utc($scope.sdate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ'),
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'name'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/adminInvoiceManagement/getListOfCompaniesThatNeedInvoice", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.customers = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, url, err, httpOptions);
                });
        };

        $scope.getOfficialInvoice = function (id) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.item.id,
                date: moment.utc($scope.sdate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            return $http.post("http://127.0.0.1:9000/v1/adminInvoiceManagement/createKarafeedOfficialInvoice", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    if (data.data === "-1") {
                        showMessage(toastrConfig,toastr,'پیام','رکوردی یافت نشد','success');
                        return;
                    }
                    if (data.data === "-2") {
                        showMessage(toastrConfig,toastr,'پیام','شما مجاز به انجام این عملیات نیستید','success');
                        return;
                    }   if (data.data === "-403") {
                        showMessage(toastrConfig,toastr,'پیام','انجام این عملیات برای کاربر شما غیر فعال است','success');
                        return;
                    }
                    mydownload(data.data, 'invoice' + moment.utc().format('jYYYYjMjD') + '.pdf','application/pdf',toastrConfig,toastr);

                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminInvoiceManagement/createKarafeedOfficialInvoice", err, httpOptions);
                });
        };

        $scope.dateChanged = function (date) {
            $scope.sdate = date;
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
