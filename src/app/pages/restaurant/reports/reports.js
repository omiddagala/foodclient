(function () {
    'use strict';

    angular.module('BlurAdmin.pages.rest-reports', [])
        .config(routeConfig)
        .controller('restReports', restReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('rest-reports', {
                url: '/rest-reports',
                templateUrl: 'app/pages/restaurant/reports/reports.html',
                controller: 'restReports'
            });
    }

    function restReports($scope, $filter, editableOptions, editableThemes, $state, $q, $http, $rootScope,localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.commissionDate = moment(new Date()).format('jYYYY/jM/jD');
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
                "name": $scope.name,
                "date": moment.utc($scope.commissionDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                pageableDTO: {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'deliveryDate'
                }
            };
            return $http.post("https://demoapi.karafeed.com/v1/restaurant/getBuyerCompanies", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.companies = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/restaurant/getBuyerCompanies", err, httpOptions);
                });
        };
        $scope.commissionsOfKarafeed = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "date": moment.utc($scope.commissionDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("https://demoapi.karafeed.com/v1/restaurant/getCommissionInvoice", params, httpOptions)
                .success(function (data, status, headers, config) {
                    mydownload(data,'karafeed-commissions.pdf','application/pdf');
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/restaurant/getCommissionInvoice", err, httpOptions);
            });
        };

        $scope.factorsForKarafeed = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "date": moment.utc($scope.commissionDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("https://demoapi.karafeed.com/v1/restaurant/createInvoiceForKarafeed", params, httpOptions)
                .success(function (data, status, headers, config) {
                    mydownload(data,'karafeed-factors.pdf','application/pdf');
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/restaurant/createInvoiceForKarafeed", err, httpOptions);
            });
        };

        $scope.companyFactor = function(id,name){
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": id,
                "date": moment.utc($scope.commissionDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("https://demoapi.karafeed.com/v1/restaurant/getInvoiceOfRestaurant", params, httpOptions)
                .success(function (data, status, headers, config) {
                    mydownload(data,name + '.pdf','application/pdf');
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/restaurant/getInvoiceOfRestaurant", err, httpOptions);
            });
        };

        $scope.commissionDateChanged = function (d) {
            $scope.commissionDate = d;
            $scope.$broadcast('refreshMyTable');
        };
        var delayTimer;
        $scope.sideSearch = function () {
            var l = $scope.name.length;
            if (l > 2 || l === 0) {
                clearTimeout(delayTimer);
                delayTimer = setTimeout(function () {
                    $scope.$broadcast('refreshMyTable');
                }, 1000);
            }
        };

        //vahid seraj updated code. (1397.09.29) ------------- [start]
        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        }
        //vahid seraj updated code. (1397.09.29) ------------- [end]
        
    }
})();