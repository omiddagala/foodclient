(function () {
    'use strict';

    angular.module('BlurAdmin.pages.admin-order', [])
        .config(routeConfig)
        .controller('adminOrderCtrl', adminOrderCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-order', {
                url: '/ad-order',
                templateUrl: 'app/pages/admin/orders/order.html',
                controller: 'adminOrderCtrl'
            });
    }

    function adminOrderCtrl($scope, $filter, $state, $q, $http, localStorageService, $uibModal, $rootScope, $uibModalStack, toastrConfig, toastr,$location) {
        $scope.smartTablePageSize = 10;
        $scope.cancelReason = 'RESTAURANT_MISTAKE';
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
                "id": $location.search().id,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'id'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/getOrderById", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.orders = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminEmployeeManagementRest/getOrderById", err, httpOptions);
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
                "orderId": $rootScope.order.id
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/cancelFoodOrder", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $rootScope.order.foodOrderStatus = $scope.cancelReason;
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/cancelFoodOrder", err, httpOptions);
            });
        };

        $scope.cancelOrderGroup = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "groupId": $location.search().id
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