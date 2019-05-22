(function () {
    'use strict';

    angular.module('BlurAdmin.pages.emp-buy-report-detail', [])
        .config(routeConfig)
        .controller('empBuyReportDetail', empBuyReportDetail);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('buy-report-detail', {
                url: '/buy-report-detail',
                templateUrl: 'app/pages/employee/buy-report/detail.html',
                controller: 'empBuyReportDetail'
            });
    }

    function empBuyReportDetail($scope, $filter, $state, $q, $http, localStorageService, $uibModal, $rootScope, $uibModalStack, toastrConfig, toastr,$location) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;

        $scope.search = function (pagination, sort) {
            if (preventTwiceLoad){
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "id": $location.search().brid,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'deliveryDate'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/employee/userOrderReport", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.orders = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/employee/userOrderReport", err, httpOptions);
                });
        };

        $scope.opneModal = function (page, size, item) {
            $rootScope.order = item;
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

        $scope.getStatusColor = function(status){
            if (status === "NORMAL" || status === "FACTOR"){
                return {'color':'green'};
            } else {
                return {'color' : 'red'};
            }
        };

        $scope.goBackToList = function () {
            $location.path("/buy-report");
        }

    }
})();