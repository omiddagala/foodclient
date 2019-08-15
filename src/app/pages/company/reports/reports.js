(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-reports', [])
        .config(routeConfig)
        .controller('coReports', coReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-reports', {
                url: '/co-reports',
                templateUrl: 'app/pages/company/reports/reports.html',
                controller: 'coReports'
            });
    }

    function coReports($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
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
            return $http.post("http://127.0.0.1:9000/v1/company/getSellerRestaurantList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.rests = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/company/getSellerRestaurantList", err, httpOptions);
                });
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
                    mydownload(data,'karafeed-commissions.pdf','application/pdf');
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/company/getInvoiceOfKarafeed", err, httpOptions);
            });
        };

        $scope.restaurantFactor = function(id,name){
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": id,
                "date": moment.utc($scope.commissionDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/company/getInvoiceOfRestaurant", params, httpOptions)
                .success(function (data, status, headers, config) {
                    mydownload(data,name + '.pdf','application/pdf');
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/company/getInvoiceOfRestaurant", err, httpOptions);
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
