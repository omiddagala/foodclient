(function () {
    'use strict';

    angular.module('BlurAdmin.pages.admin-invoice', [])
        .config(routeConfig)
        .controller('adminInvoiceCtrl', adminInvoiceCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-invoice', {
                url: '/ad-invoice',
                templateUrl: 'app/pages/admin/invoice/invoice.html',
                controller: 'adminInvoiceCtrl'
            });
    }

    function adminInvoiceCtrl($scope, $filter, $uibModalStack, $state, $q, $http, localStorageService, $uibModal, $rootScope, $location, toastrConfig,toastr) {
        $scope.smartTablePageSize = 10;
        $scope.cancelReason = 'RESTAURANT_MISTAKE';
        var preventTwiceLoad = true;
        var autoLoad;

        $scope.initCtrl = function () {
            $scope.submitted = false;
            setTimeout(function () {
                autoLoad = setInterval(function () {
                    $scope.$broadcast('refreshMyTable');
                }, 180000);
            }, 1000)
        };

        $scope.$on('$destroy', function() {
            clearInterval(autoLoad);
        });

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
            $scope.smartTablePageSize = pagination.number;
            $scope.pagination = pagination;
            $scope.sort = sort;
            var param = {
                "direction": sort.reverse ? 'DESC' : 'ASC',
                "page": pagination.start / pagination.number,
                "size": pagination.number,
                "sortBy": sort.predicate ? sort.predicate : 'deliveryDate'
            };
            return $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/getUnFactoredOrders", param, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.orders = data.data.list;
                    if (!$rootScope.numOfAllFactors){
                        $rootScope.numOfAllFactors = data.data.count;
                    }
                    if ($scope.orders.length > 0 && $rootScope.numOfAllFactors !== data.data.count){
                        var x = document.getElementById("myAudio");
                        x.play();
                        $rootScope.numOfAllFactors = data.data.count;
                    }
                    stopLoading();
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/getUnFactoredOrders", err, httpOptions);
                });
        };

        $scope.openModal = function (page, size, item, index) {
            $scope.orderGroup = item;
            $scope.orderIndex = index;
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
                    $scope.orders.splice($scope.orderIndex, 1);
                    if ($scope.orders.length === 0) {
                        $scope.$broadcast('refreshMyTable');
                    }
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/cancelFoodOrder", err, httpOptions);
            });
        };

        $scope.goToDetail = function (id) {
            $location.path("/ad-order").search({id: id});
        }

    }
})();
