/**
 * @author v.lugovsky
 * created on 25.02.2019
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.detail', [])
        .config(routeConfig)
        .controller('detailCtrl', detailCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('detail', {
                url: '/detail',
                templateUrl: 'app/pages/employee/detail/detail.html',
                title: 'جزئیات غذا',
                controller: detailCtrl
            });
    }

    function detailCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, toastrConfig, toastr, $location) {
        $rootScope.pageTitle = 'جزئیات غذا';
        // console.log($rootScope.mobileFoodDetail);
        $('.hidden-tab').hide();
        if (!$rootScope.mobileFoodDetail) {
            window.location.assign('/#category');
            //     var home = window.location.href.replace("detail", "home");
            //     home = replaceUrlParam(home, "r", name);
            //     window.location.href = home;
            //     $rootScope.currentActiveMenu = "home";
            //     return;
        }
        $scope.loadYourLastRateToThisFood = function () {

            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                id: $rootScope.mobileFoodDetail.id
            };
            $http.post("https://demoapi.karafeed.com/v1/employee/lastRate", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.foodRate = data.rate === 0 ? "-" : data.rate;
                    $scope.updateStar(data.rate);
                }).catch(function (err) {
                    $rootScope.handleError(params, "/employee/lastRate", err, httpOptions);
                });


        };

        $scope.myRate = function (rate) {
            startLoading();
            $scope.updateStar(rate);
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                "foodId": $rootScope.mobileFoodDetail.id,
                "rate": rate
            };
            $http.post("https://demoapi.karafeed.com/v1/employee/rate", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                    $rootScope.handleError(params, "/employee/rate", err, httpOptions);
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

        $scope.getFoodDetailDaysClass = function (d) {
            var i = (new Date()).getDay();
            if (d === i) {
                return "food_detail_days_title_today";
            } else {
                return "food_detail_days_title";
            }
        };

        $scope.foodDetail = function () {
            // if ($scope.forms.myform)
            //     $scope.forms.myform.$setPristine();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                id: $rootScope.mobileFoodDetail.id
            };
            $http.post("https://demoapi.karafeed.com/v1/food/getFoodAvailableDates", params, httpOptions)
                .success(function (data, status, headers, config) {
                    var m = new HashMap();
                    for (var i = 0; i < data.length; i++) {
                        var day = m.get(data[i].dayOfWeek);
                        if (!day) {
                            m.set(data[i].dayOfWeek, [{ startTime: data[i].startTime, endTime: data[i].endTime }]);
                        } else {
                            day.push({ startTime: data[i].startTime, endTime: data[i].endTime });
                        }
                    }
                    $scope.days = m;
                }).catch(function (err) {
                    $rootScope.handleError(params, "/food/getFoodAvailableDates", err, httpOptions);
                });
        };
        if ($rootScope.mobileFoodDetail && $rootScope.mobileFoodDetail.id) {
            $scope.loadYourLastRateToThisFood();
            $scope.foodDetail();
        }
        $scope.formatMyTime = function (d) {
            var rt;
            switch (d.toString().length) {
                case 1:
                    rt = "000" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 2:
                    rt = "00" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 3:
                    rt = "0" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 4:
                    rt = d.toString();
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
            }
        };
        $scope.showTab = function (e) {
            var thisTab = $(e.currentTarget);
            var tabArrow = $(thisTab).find('.tab-arrow');
            if ($(tabArrow).hasClass('rotate')) {
                tabArrow.removeClass('rotate');
                // thisTab.next().addClass('hidden-tab');
            } else {
                tabArrow.addClass('rotate');
                // thisTab.next().removeClass('hidden-tab');
            }
            thisTab.next().slideToggle(500);

        }

        $scope.addComments = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                foodId: $rootScope.mobileFoodDetail.id,
                comment: $('#commentInDetail').val()
            };
            $http.post("https://demoapi.karafeed.com/v1/foodComment/add", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                    $rootScope.handleError(params, "/foodComment/add", err, httpOptions);
                });
        };

        $scope.cleanComments = function () {
            $scope.comments = [];
            $scope.commentPageNum = 0;
        };

        $scope.fetchComments = function () {
            startLoading();
            $("#commentInDetail").val("");
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                id: $rootScope.mobileFoodDetail.id,
                pageableDTO: {
                    page: $scope.commentPageNum,
                    size: 10,
                    direction: 0,
                    sortBy: "date"
                }
            };
            $http.post("https://demoapi.karafeed.com/v1/foodComment/getFoodComments", params, httpOptions)
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
                    }
                    stopLoading();
                }).catch(function (err) {
                    $rootScope.handleError(params, "/foodComment/getFoodComments", err, httpOptions);
                });
        };

        $scope.loadYourLastRateToThisFood = function () {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                id: $rootScope.mobileFoodDetail.id
            };
            $http.post("https://demoapi.karafeed.com/v1/employee/lastRate", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.foodRate = data.rate === 0 ? "-" : data.rate;
                    $scope.updateStar(data.rate);
                }).catch(function (err) {
                    $rootScope.handleError(params, "/employee/lastRate", err, httpOptions);
                });
        };
        $scope.orderFood = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                date: $rootScope.dateToOrder.format('YYYY-MM-DDTHH:mmZ'),
                foodId: $rootScope.mobileFoodDetail.id
            };
            $http.post("https://demoapi.karafeed.com/v1/employee/order", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $rootScope.userBalance = data.availableBalanceAmount;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                    setTimeout(function () {
                        $scope.loadOrders();
                    }, 2000);
                    $rootScope.handleError(params, "/employee/order", err, httpOptions);
                });
        };

        $scope.cleanComments();
        $scope.fetchComments();
    }
})();

