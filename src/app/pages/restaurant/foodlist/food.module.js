(function () {
    'use strict';

    angular.module('BlurAdmin.pages.myfood', [])
        .config(routeConfig)
        .controller('foodCtrl', foodCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('food', {
                url: '/food',
                templateUrl: 'app/pages/restaurant/foodlist/food.html',
                controller: 'foodCtrl'
            });
    }

    function foodCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, $rootScope, localStorageService, $location, $uibModalStack, $uibModal, toastrConfig, toastr) {
        $scope.smartTablePageSize = 50;
        var preventTwiceLoad = true;
        var today = new Date();
        today.setHours(23);
        today.setMinutes(59);
        $scope.finishDate = moment(today).format('jYYYY/jM/jD HH:mm');
        $scope.startDate = moment(new Date()).format('jYYYY/jM/jD HH:mm');

        $scope.search = function (pagination, sort, search) {
            if (preventTwiceLoad) {
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "value": $scope.foodName,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'name'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/restaurant/food/foodList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.foods = data.data.list;
                    $scope.restaurantLevel = data.data.restaurantLevel;
                    if ($scope.foods && $scope.foods.length > 0)
                        $scope.restaurantId = $scope.foods[0].restaurant.id;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/restaurant/food/foodList", err, httpOptions);
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
            $location.path('/fooddetail').search({foodid: foodid, t: $scope.restaurantLevel});
        };

        $scope.addFood = function () {
            $location.path("/fooddetail").search({t: $scope.restaurantLevel});
        };

        $scope.removeFood = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            return $http.post("http://127.0.0.1:9000/v1/restaurant/food/deleteFood", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.foods.splice($scope.itemIndex, 1);
                    if ($scope.foods.length === 0) {
                        $scope.$broadcast('refreshMyTable');
                    }
                    $uibModalStack.dismissAll();
                    stopLoading();
                }).catch(function (err) {
                    $rootScope.handleError($scope.item.id, "/restaurant/food/deleteFood", err, httpOptions);
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
                startDate: moment.utc($scope.startDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                endDate: moment.utc($scope.finishDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ')
            };
            return $http.post("http://127.0.0.1:9000/v1/restaurant/food/finishFood", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.item.endOfFinishDate = param.endDate;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/restaurant/food/finishFood", err, httpOptions);
                });
        };

        $scope.finishAllFoods = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.restaurantId,
                startDate: moment.utc($scope.startDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                endDate: moment.utc($scope.finishDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ')
            };
            return $http.post("http://127.0.0.1:9000/v1/restaurant/food/finishAllFood", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $.each($scope.foods, function (i, v) {
                        v.endOfFinishDate = param.endDate;
                    });
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/restaurant/food/finishAllFood", err, httpOptions);
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
            return $http.post("http://127.0.0.1:9000/v1/restaurant/food/makeFoodAvailable", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.item.endOfFinishDate = null;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/restaurant/food/makeFoodAvailable", err, httpOptions);
                });
        };

        $scope.makeAllFoodsAvailable = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.restaurantId
            };
            return $http.post("http://127.0.0.1:9000/v1/restaurant/food/makeAllFoodsAvailable", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $.each($scope.foods, function (i, v) {
                        v.endOfFinishDate = null;
                    });
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(param, "/restaurant/food/makeAllFoodsAvailable", err, httpOptions);
                });
        };

        $scope.someFoodsAreAvailable = function () {
            if (!$scope.foods)
                return true;
            var now = moment();
            for (var i = 0; i < $scope.foods.length; i++) {
                if (!$scope.foods[i].endOfFinishDate || now.isAfter(moment.utc($scope.foods[i].endOfFinishDate).format()))
                    return true;
            }
            return false;
        };

        $scope.dateChanged = function (date, isStart) {
            if (isStart) {
                $scope.startDate = date;
            } else {
                $scope.finishDate = date;
            }
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
