(function () {
    'use strict';

    angular.module('BlurAdmin.pages.ad-co-user-financial', [])
        .config(routeConfig)
        .controller('adminCompanyUserFinancial', adminCompanyUserFinancial);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-co-user-financial', {
                url: '/ad-co-user-financial',
                templateUrl: 'app/pages/admin/company/users/financial.html',
                controller: 'adminCompanyUserFinancial'
            });
    }

    function adminCompanyUserFinancial($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        $scope.fromDate = moment(new Date()).subtract('days', 7).format('jYYYY/jM/jD HH:mm');
        $scope.toDate = moment(new Date()).format('jYYYY/jM/jD HH:mm');
        var id;
        var preventTwiceLoad = true;
        $scope.reportType = "ALL";

        $scope.search = function (pagination, sort) {
            if (preventTwiceLoad){
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            id = $location.search().id;
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "id": id,
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
            return $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/getFinancialReport", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.orders = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminEmployeeManagementRest/getFinancialReport", err, httpOptions);
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

        $scope.openModal = function (page, size, index) {
            $scope.order = $scope.orders[index];
            var m = $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
            
            m.rendered.then(function (e) {
                if ($('.modal-dialog .modal-content .modal-content.modal-fit').length > 0) {
                    $('.modal-dialog').addClass('fit-height-imp');
                }                
            });
        };

        $scope.reportTypeChanged = function (t) {
            $scope.reportType = t;
            $scope.$broadcast('refreshMyTable');
        };

    }
})();