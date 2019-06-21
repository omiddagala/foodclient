(function () {
    'use strict';

    angular.module('BlurAdmin.pages.emp-mobile-restaurant', [])
        .config(routeConfig)
        .controller('empMobileRestaurantCtrl', empMobileRestaurantCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('emp-mobile-restaurant', {
                url: '/emp-mobile-restaurant',
                templateUrl: 'app/pages/employee/mobile/restaurant/restaurant.html',
                controller: 'empMobileRestaurantCtrl'
            });
    }

    function empMobileRestaurantCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, toastrConfig, toastr, $location) {
        $rootScope.pageTitle = 'رستوران';
        $rootScope.currentMobileActiveMenu = "myrestaurant";

        $scope.loadContent = function (isFirstCall, isSearch) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params;
            // if called by page load and not search button
            if (/[?&]/.test(location.hash) && !isSearch) {
                params = {
                    value: $location.search().resN ? $location.search().resN : "",
                    restaurantType: $location.search().resT ? $location.search().resT : "",
                    pageableDTO: {
                        page: $rootScope.resPageNum,
                        size: $rootScope.isMobile() ? 8 : 16,
                        direction: 0,
                        sortBy: "name"
                    }
                };
                // and setting search inputs
                if (isFirstCall) {
                    $('#resName').val(params.value);
                    $scope.selectedType = $rootScope.getRestaurantTypeByNames(params.restaurantType);
                }
            } else {
                // if is called from search button
                params = {
                    value: $('#resName').val(),
                    restaurantType: selectedTypes ? selectedTypes.join(",") : "",
                    pageableDTO: {
                        page: $rootScope.resPageNum,
                        size: $rootScope.isMobile() ? 8 : 16,
                        direction: 0,
                        sortBy: "name"
                    }
                };
                if (isSearch && !$rootScope.isMobile()) {
                    $location.search('resN', params.value);
                    $location.search('resT', params.restaurantType);
                }
            }
            $http.post("http://127.0.0.1:9000/v1/employee/findRestaurantByName", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    if (data.list.length > 0) {
                        if (params.pageableDTO.page === 0) {
                            $scope.rests = [];
                            setTimeout(function () {
                                $scope.rests = data.list;
                                $scope.$apply();
                            }, 200);
                        } else {
                            $.merge($scope.rests, data.list);
                        }
                        if (data.list.length === params.pageableDTO.size) {
                            $rootScope.resEnableScroll = true;
                            $rootScope.resPageNum++;
                        }
                    } else {
                        if (params.pageableDTO.page === 0) {
                            $scope.rests = [];
                        }
                    }
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/findRestaurantByName", err, httpOptions);
            });
        };

        $scope.ctrlInit = function () {
            $rootScope.resPageNum = 0;
            $scope.commentPageNum = 0;
            $rootScope.enableCommentScroll = true;
            $rootScope.resEnableScroll = false;
            setTimeout(function () {
                $scope.rests = [];
                $scope.loadContent(true, false);
                $('.article-mobile-list').scroll(function () {
                    if ($rootScope.scrollIsAtEnd($('.article-mobile-list'))) {
                        if ($rootScope.resEnableScroll) {
                            $rootScope.resEnableScroll = false;
                            $scope.loadContent(false, false);
                        }
                    }
                });
            }, 700);
        };
        var selectedTypes = [];
        $scope.typeChanged = function (a) {
            selectedTypes = a;
            selectedTypes = jQuery.map(selectedTypes, function (v, i) {
                return v.value;
            });
            selectedTypes.sort();
            $scope.search();
        };
        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        };

        $scope.open = function (page, size) {
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
        };

        $scope.goToHome = function (name) {
            var home = window.location.href.replace("emp-mobile-restaurant", "emp-mobile-home");
            home = replaceUrlParam(home, "r", name);
            window.location.href = home;
            $rootScope.currentActiveMenu = "home";
            $rootScope.currentMobileActiveMenu = "home";
        };

        $scope.confirm = function (e) {
            var ionSideMenu = $(e.currentTarget).closest('ion-side-menus');
            $(ionSideMenu).find('ion-side-menu .confirm-box').removeClass('confirm-box-disable');
            window.setTimeout(function () {
                $rootScope.sortBox();
                $(ionSideMenu).find('ion-side-menu .confirm-box').addClass('confirm-box-disable');
            }, 600);
        }
    }
})();