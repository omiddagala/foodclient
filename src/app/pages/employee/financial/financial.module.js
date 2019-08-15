(function () {
    'use strict';

    angular.module('BlurAdmin.pages.user-financial', [])
        .config(routeConfig)
        .controller('userFinancial', userFinancial);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('user-financial', {
                url: '/user-financial',
                templateUrl: 'app/pages/employee/financial/financial.html',
                controller: 'userFinancial'
            });
    }

    function userFinancial($scope, $filter, editableOptions, editableThemes, $state, $rootScope, $q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        $scope.fromDate = moment(new Date()).subtract('days', 7).format('jYYYY/jM/jD');
        $scope.toDate = moment(new Date()).format('jYYYY/jM/jD');
        var preventTwiceLoad = true;
        $scope.reportType = "ALL";

        $scope.$on('$locationChangeStart', function () {
            var a = location.href;
            $rootScope.employee_params = a.substring(a.indexOf("?") + 1);
        });

        $scope.initCtrl = function() {
            if ($rootScope.employee_params && !$rootScope.isMobile())
                $location.search($rootScope.employee_params);
            $scope.fromDate = $location.search().fs1 ? $location.search().fs1 : moment(new Date()).subtract('days', 7).format('jYYYY/jM/jD');
            $scope.toDate = $location.search().fe1 ? $location.search().fe1 : moment(new Date()).format('jYYYY/jM/jD');
        };

        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        }

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
            $location.search('fs1', $scope.fromDate);
            $location.search('fe1', $scope.toDate);
            var param = {
                "id": "0",
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "balanceEffectType": $scope.reportType,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'id'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/employee/getFinancialReport", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.orders = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/employee/getFinancialReport", err, httpOptions);
                });
        };

        $scope.dateChanged = function (date, isFromDate) {
            if (isFromDate) {
                $scope.fromDate = date;
            } else {
                $scope.toDate = date;
            }
            var end = moment($scope.toDate);
            if (end.isBefore($scope.fromDate)) {
                showMessage(toastrConfig, toastr, "خطا", "تاریخ پایان از تاریخ آغاز کوچکتر است", "error");
                return;
            }
            if (end.diff($scope.fromDate,'days') > 7) {
                showMessage(toastrConfig, toastr, "خطا", "حداکثر بازه زمانی ۷ روزه انتخاب نمایید", "error");
                return;
            }
            $scope.$broadcast('refreshMyTable');
        };

    }
})();
