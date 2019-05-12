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

        $scope.initCtrl = function () {
            setTimeout(function () {
                $('.mycontent').scroll(function () {
                    if ($('.mycontent').scrollTop() >= 50) {
                        $('.page-top').addClass('scrolled');
                        $('.menu-top').addClass('scrolled');
                        $('#backTop').fadeIn(500);
                    } else {
                        $('.page-top').removeClass('scrolled');
                        $('.menu-top').removeClass('scrolled');
                        $('#backTop').fadeOut(500);
                    }
                });
                $('#backTop').click(function () {
                    $('.mycontent').animate({scrollTop: 0}, 800);
                    return false;
                });
            }, 1000)
        };

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
                "id" : $location.search().id,
                "value": $scope.foodName,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'name'
                }
            };
            return $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/foodList", param, httpOptions)
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
            },1000);
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
            $location.path('/admin-fooddetail').search({id: $location.search().id,foodid: foodid,l: $scope.restaurantLevel});
        };

        $scope.addFood = function () {
            $location.path("/admin-fooddetail").search({id: $location.search().id,l: $scope.restaurantLevel});
        };

        $scope.removeFood = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            return $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/deleteFood", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.foods.splice($scope.itemIndex, 1);
                    if ($scope.foods.length === 0) {
                        $scope.$broadcast('refreshMyTable');
                    }
                    $uibModalStack.dismissAll();
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
            return $http.post("https://demoapi.karafeed.com/v1/restaurant/food/setFoodFinishedToday", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError($scope.item.id, "/restaurant/food/setFoodFinishedToday", err, httpOptions);
                });
        };
        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        }

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();