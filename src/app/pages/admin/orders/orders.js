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
        $scope.smartTablePageSize = 5;
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD HH:mm');
        $scope.toDate = moment(new Date()).add('days', 1).format('jYYYY/jM/jD HH:mm');
        $scope.factorNumber = null;
        $scope.companyName = "";
        $scope.restName = "";
        $scope.status = {
            title: "همه",
            value: null
        };
        var param = null;
        var preventTwiceLoad = true;
        var autoLoad;

        $scope.initCtrl = function () {
            $scope.getPageNumFromUrl = true;
            setTimeout(function () {
                autoLoad = setInterval(function () {
                    $scope.$broadcast('refreshMyTable');
                }, 180000);
                $scope.fromDate = $location.search().ordstartDate ? moment($location.search().ordstartDate).format('jYYYY/jM/jD HH:mm') : $scope.fromDate;
                $scope.toDate = $location.search().ordendDate ? moment($location.search().ordendDate).format('jYYYY/jM/jD HH:mm') : $scope.toDate;
                $scope.factorNumber = $location.search().ordid ? $location.search().ordid : $scope.factorNumber;
                $scope.companyName = $location.search().ordcompanyName ? $location.search().ordcompanyName : $scope.companyName;
                $scope.restName = $location.search().ordrestaurantName ? $location.search().ordrestaurantName : $scope.restName;
                $scope.status = {
                    title: $location.search().ordfoodOrderStatusT ? $location.search().ordfoodOrderStatusT : "همه",
                    value: $location.search().ordfoodOrderStatus ? $location.search().ordfoodOrderStatus : null
                };
                $scope.$apply();
            }, 1000);
        };

        $scope.$on('$destroy', function() {
            clearInterval(autoLoad);
        });

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
                if ($scope.getPageNumFromUrl && localStorageService.get("ordpage") !== null) {
                    pagination.start = localStorageService.get("ordpage") * pagination.number;
                    $scope.getPageNumFromUrl = false;
                }
                param = {
                    "id": $location.search().ordid ? $location.search().ordid : (index !== null ? (index < 0 ? $scope.factorNumber : $scope.factorNumber.substr(3)) : null),
                    companyName: $location.search().ordcompanyName ? $location.search().ordcompanyName : $scope.companyName,
                    restaurantName: $location.search().ordrestaurantName ? $location.search().ordrestaurantName :  $scope.restName,
                    foodOrderStatus: $location.search().ordfoodOrderStatus ? $location.search().ordfoodOrderStatus :  $scope.status.value,
                    "endDate": $location.search().ordendDate ? $location.search().ordendDate : moment.utc($scope.toDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                    "startDate": $location.search().ordstartDate ? $location.search().ordstartDate : moment.utc($scope.fromDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                    "pageableDTO": {
                        "direction": sort.reverse ? 'DESC' : 'ASC',
                        "page": pagination.start / pagination.number,
                        "size": pagination.number,
                        "sortBy": sort.predicate ? sort.predicate : 'deliveryDate'
                    }
                };
                localStorageService.set("ordpage",param.pageableDTO.page);
                return $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/getOrderGroups", param, httpOptions)
                    .then(function (data, status, headers, config) {
                        stopLoading();
                        $scope.orders = data.data.list;
                        return data.data;
                    }).catch(function (err) {
                        $rootScope.handleError(param, "/adminEmployeeManagementRest/getOrderGroups", err, httpOptions);
                    });
        };

        $scope.status_changed = function(i) {
            $scope.status = i;
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
            $location.search({"ordid": $scope.factorNumber ? ($scope.factorNumber.indexOf("kf-") < 0 ? $scope.factorNumber : $scope.factorNumber.substr(3)) : null, "ordcompanyName": $scope.companyName, "ordrestaurantName":$scope.restName,
                "ordfoodOrderStatus":$scope.status.value,"ordstartDate":moment.utc($scope.fromDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "ordendDate":moment.utc($scope.toDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),"ordfoodOrderStatusT":$scope.status.title});
            setTimeout(function () {
                $scope.$broadcast('refreshMyTable');
            },700);
        };

        $scope.goToDetail = function (id) {
            $location.search().id = id;
            $location.path("/ad-order");
        }
    }
})();
