(function () {
    'use strict';

    angular.module('BlurAdmin.pages.admin-food', [])
        .config(routeConfig)
        .controller('adminFoodCtrl', adminFoodCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('admin-food', {
                url: '/admin-food',
                templateUrl: 'app/pages/admin/restaurant/foodlist/food.html',
                controller: 'adminFoodCtrl'
            });
    }

    function adminFoodCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, $rootScope, localStorageService, $location, $uibModalStack, $uibModal, toastrConfig, toastr) {
        $scope.smartTablePageSize = 50;
        var preventTwiceLoad = true;
        var today = new Date();
        today.setHours(23);
        today.setMinutes(59);
        $scope.finishDate = moment(today).format('jYYYY/jM/jD HH:mm');


        $scope.search = function (pagination, sort, search) {
            if (preventTwiceLoad) {
                preventTwiceLoad = false;
                return;
            }
            if (!pagination)
                return;
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "id": $location.search().id,
                "value": $scope.foodName,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'name'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/foodList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.foods = data.data.list;
                    $scope.restaurantLevel = data.data.restaurantLevel;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/foodList", err, httpOptions);
                });

        };
        var delayTimer;
        $scope.searchFoodByName = function () {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function () {
                $scope.$broadcast('refreshMyTable');
            }, 1000);
        };

        $scope.openModal = function (page, size, item, index) {
            $scope.item = item;
            $scope.itemIndex = index;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
        };

        $scope.edit = function (foodid) {
            $location.path('/admin-fooddetail').search({
                id: $location.search().id,
                foodid: foodid,
                l: $scope.restaurantLevel
            });
        };

        $scope.addFood = function () {
            $location.path("/admin-fooddetail").search({id: $location.search().id, l: $scope.restaurantLevel});
        };

        $scope.removeFood = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            return $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/deleteFood", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.foods.splice($scope.itemIndex, 1);
                    if ($scope.foods.length === 0) {
                        $scope.$broadcast('refreshMyTable');
                    }
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                    $rootScope.handleError($scope.item.id, "/adminRestaurantManagementRest/deleteFood", err, httpOptions);
                });
        };

        $scope.finishFood = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.item.id,
                date: moment.utc($scope.finishDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ')
            };
            return $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/finishFood", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.item.finishDate = param.date;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/finishFood", err, httpOptions);
                });
        };

        $scope.finishAllFoods = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $location.search().id,
                date: moment.utc($scope.finishDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ')
            };
            return $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/finishAllFood", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $.each($scope.foods, function(i,v) {
                        v.finishDate = param.date;
                    });
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/finishAllFood", err, httpOptions);
                });
        };

        $scope.makeFoodAvailable = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.item.id
            };
            return $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/makeFoodAvailable", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.item.finishDate = null;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/makeFoodAvailable", err, httpOptions);
                });
        };

        $scope.makeAllFoodsAvailable = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $location.search().id
            };
            return $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/makeAllFoodsAvailable", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $.each($scope.foods, function(i,v) {
                        v.finishDate = null;
                    });
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/makeAllFoodsAvailable", err, httpOptions);
                });
        };

        $scope.someFoodsAreAvailable = function() {
            if (!$scope.foods)
                return true;
            var now = moment.utc();
            now.add('hours',4);
            now.add('minutes',30);
            for (var i = 0; i < $scope.foods.length; i++) {
                if (!$scope.foods[i].finishDate || now.isAfter(moment.utc($scope.foods[i].finishDate).format()))
                    return true;
            }
            return false;
        };

        $scope.dateChanged = function (date) {
            $scope.finishDate = date;
        };

        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        };

    }
})();