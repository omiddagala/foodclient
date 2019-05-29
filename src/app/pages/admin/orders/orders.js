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

    function adminOrdersCtrl($scope, $filter, $state, $q, $http, localStorageService, $uibModal, $rootScope, $location, $uibModalStack) {
        $scope.smartTablePageSize = 10;
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD HH:mm');
        $scope.toDate = moment(new Date()).add('days', 1).format('jYYYY/jM/jD HH:mm');
        $scope.factorNumber = null;
        var preventTwiceLoad = true;

        $scope.search = function (pagination, sort) {
            if (preventTwiceLoad){
                preventTwiceLoad = false;
                return;
            }
            if (!sort)
                return;
            startLoading();
            var index = $scope.factorNumber ? $scope.factorNumber.indexOf("kf-") : null;
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "id": index !== null ? (index < 0 ? $scope.factorNumber : $scope.factorNumber.substr(3)) : null,
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'id'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/getOrderGroups", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.orders = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminEmployeeManagementRest/getOrderGroups", err, httpOptions);
                });
        };

        $scope.openModal = function (page, size, item) {
            $scope.orderGroup = item;
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

        $scope.printFactor = function() {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "cancelOrderReason": "PRINT_INVOICE",
                "groupId": $scope.orderGroup.id
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/cancelFoodOrder", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.orderGroup.foodOrderStatus = "FACTOR";
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/cancelFoodOrder", err, httpOptions);
            });
        };

        $scope.dateChanged = function (date, isFromDate) {
            if (isFromDate) {
                $scope.fromDate = date;
            } else {
                $scope.toDate = date;
            }
        };

        $scope.searchByOrderGroup = function () {
            $scope.$broadcast('refreshMyTable');
        };

        $scope.goToDetail = function (id) {
            $location.path("/ad-order").search({id: id});
        }
    }
})();