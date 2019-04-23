(function () {
    'use strict';

    angular.module('BlurAdmin.pages.admin-orders', [])
        .config(routeConfig)
        .controller('adminOrdersCtrl', adminOrdersCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-orders', {
                url: '/ad-orders',
                templateUrl: 'app/pages/admin/orders/orders.html',
                controller: 'adminOrdersCtrl'
            });
    }

    function adminOrdersCtrl($scope, $filter, $state, $q, $http, localStorageService, $uibModal, $rootScope, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        $scope.cancelReason = 'RESTAURANT_MISTAKE';
        $scope.factorNumber = null;

        $scope.search = function (pagination, sort) {
            if (!$scope.factorNumber)
                return;
            var index = $scope.factorNumber.indexOf("kf-");
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "id" : index < 0 ? $scope.factorNumber : $scope.factorNumber.substr(3),
                "pageableDTO": {
                    direction: sort.reverse ? 'DESC' : 'ASC',
                    page: pagination.start / pagination.number,
                    size: pagination.number,
                    sortBy: sort.predicate ? sort.predicate : 'name'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/getOrderById", param, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.orders = data.data;
                    stopLoading();
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminEmployeeManagementRest/getOrderById", err, httpOptions);
                });
        };

        $scope.opneModal = function (page, size, item) {
            $rootScope.factor = item;
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

        $scope.searchByOrderGroup = function () {
            var pagination = {
                start: 0,
                number: 10
            };
            var sort = {
                reverse: null,
                predicate: null
            };
            $scope.search(pagination,sort);
        };

        $scope.cancelReasonChanged = function (r) {
            $scope.cancelReason = r;
        };

        $scope.cancelFood = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "cancelOrderReason": $scope.cancelReason,
                "comment": $('#desc').val(),
                "orderId": $rootScope.factor.id
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/cancelFoodOrder", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $rootScope.factor.foodOrderStatus = $scope.cancelReason;
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/cancelFoodOrder", err, httpOptions);
            });
        };

        $scope.cancelOrderGroup = function () {
            if (!$scope.factorNumber)
                return;
            var index = $scope.factorNumber.indexOf("kf-");
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "groupId": index < 0 ? $scope.factorNumber : $scope.factorNumber.substr(3)
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/deleteOrderByGroupId", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.orders = [];
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/deleteOrderByGroupId", err, httpOptions);
            });
        };

        $scope.getStatusColor = function(status){
            if (status === "NORMAL" || status === "FACTOR"){
                return {'color':'green'};
            } else {
                return {'color' : 'red'};
            }
        };

    }
})();