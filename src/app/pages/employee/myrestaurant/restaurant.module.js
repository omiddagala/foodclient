(function () {
    'use strict';

    angular.module('BlurAdmin.pages.myrestaurant', [])
        .config(routeConfig)
        .controller('restaurantCtrl', restaurantCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('myrestaurant', {
                url: '/myrestaurant',
                templateUrl: window.isMobile() ? 'app/pages/employee/myrestaurant/m.restaurant.html' : 'app/pages/employee/myrestaurant/restaurant.html',
                controller: 'restaurantCtrl'
            });
    }

    function restaurantCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, toastrConfig, toastr, $location) {
        $rootScope.pageTitle = 'رستوران';
        $rootScope.currentMobileActiveMenu = "myrestaurant";

        $scope.$on('$locationChangeStart', function () {
            if ($rootScope.currentActiveMenu !== "myrestaurant") {
                if ($rootScope.currentActiveMenu === "home") {
                    var a = location.href;
                    $rootScope.employee_params = a.substring(a.indexOf("?") + 1);
                } else {
                    $rootScope.employee_params = null;
                }
            }
        });

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
                        size: 16,
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
                        size: 16,
                        direction: 0,
                        sortBy: "name"
                    }
                };
                if (isSearch) {
                    $location.search('resN', params.value);
                    $location.search('resT', params.restaurantType);
                }
            }
            $http.post("http://127.0.0.1:9000/v1/employee/findRestaurantByName", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    if (data.list.length > 0) {
                        if (params.pageableDTO.page === 0){
                            $scope.rests = data.list;
                        } else {
                            $.merge($scope.rests, data.list);
                        }
                        if (data.list.length === params.pageableDTO.size) {
                            $rootScope.resEnableScroll = true;
                            $rootScope.resPageNum++;
                        }
                    } else {
                        if (params.pageableDTO.page === 0){
                            $scope.rests = [];
                        }
                    }
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/findRestaurantByName", err, httpOptions);
            });
        };

        $scope.ctrlInit = function () {
            if ($rootScope.employee_params)
                $location.search($rootScope.employee_params);
            $rootScope.resPageNum = 0;
            $scope.commentPageNum = 0;
            $rootScope.enableCommentScroll = true;
            $rootScope.resEnableScroll = false;
            setTimeout(function () {
                $scope.rests = [];
                $scope.loadContent(true, false);
                $('.main-stage > div').scroll(function () {
                    if ($rootScope.scrollIsAtEnd($('.main-stage > div'))) {
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

        var delayTimer;
        $scope.search = function () {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function () {
                $rootScope.resPageNum = 0;
                $scope.loadContent(false, true)
            }, 1000);
        };
        $scope.resDetail = function (rest) {
            $scope.open('app/pages/employee/myrestaurant/detail.html', 'md');
            $scope.selectedRest = rest;
            $scope.updateStar(Number(rest.averageRate));
            $scope.cleanComments();
            $scope.fetchComments();
        };

        $scope.addComments = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                id: $scope.selectedRest.id,
                comment: $('#commentInDetail').val()
            };
            $http.post("http://127.0.0.1:9000/v1/restaurantComment/add", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/restaurantComment/add", err, httpOptions);
            });
        };

        $scope.cleanComments = function () {
            $scope.comments = [];
            $scope.commentPageNum = 0;
        };

        $scope.toggleComments = function () {
            $("#food_comments").slideToggle();
            $("#comment_toggle_icon").toggleClass("rotate_90_degrees");
        };

        $scope.fetchComments = function () {
            startLoading();
            $("#commentInDetail").val("");
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                id: $scope.selectedRest.id,
                pageableDTO: {
                    page: $scope.commentPageNum,
                    size: 10,
                    direction: 0,
                    sortBy: "date"
                }
            };
            $http.post("http://127.0.0.1:9000/v1/restaurantComment/getFoodComments", params, httpOptions)
                .success(function (data, status, headers, config) {
                    if (data.length > 0) {
                        Array.prototype.push.apply($scope.comments, data);
                        $rootScope.enableCommentScroll = true;
                        if ($scope.commentPageNum === 0) {
                            setTimeout(function () {
                                var comments_div = $("#food_comments");
                                comments_div.off("scroll");
                                comments_div.on("scroll", function () {
                                    if ($rootScope.scrollIsAtEnd(comments_div) && $rootScope.enableCommentScroll && $scope.comments.length % params.pageableDTO.size === 0) {
                                        $rootScope.enableCommentScroll = false;
                                        $scope.commentPageNum++;
                                        $scope.fetchComments();
                                    }
                                })
                            }, 200);
                        }
                    } else {
                        if ($scope.commentPageNum === 0) {
                            $scope.toggleComments();
                        }
                    }
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/restaurantComment/getFoodComments", err, httpOptions);
            });
        };

        $scope.updateStar = function (s) {
            $scope.stars = [];
            for (var i = 0; i < 5; i++) {
                $scope.stars.push({
                    filled: i < s
                });
            }
        };

        $scope.rateRestaurant = function (rate) {
            startLoading();
            $scope.updateStar(rate);
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "restaurantId": $scope.selectedRest.id,
                "rate": rate
            };
            $http.post("http://127.0.0.1:9000/v1/employee/rateRestaurant", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/rateRestaurant", err, httpOptions);
            });
        };

        $scope.toggleComments = function () {
            $("#food_comments").slideToggle();
            $("#comment_toggle_icon").toggleClass("rotate_90_degrees");
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
            var home = window.location.href.replace("myrestaurant", "home");
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