/**
 * @author v.lugovsky
 * created on 25.02.2019
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.reserve', [])
        .config(routeConfig)
        .controller('reserveCtrl', reserveCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('reserve', {
                url: '/reserve',
                templateUrl: 'app/pages/employee/reserve/reserve.html',
                title: 'رزروها',
                controller: reserveCtrl
            });
    }

    function reserveCtrl($scope, $compile, $ionicModal, $http, localStorageService, $parse, $rootScope, toastrConfig, toastr, $location) {
        $rootScope.pageTitle = 'رزروها';
        $scope.reserves = {};
        $rootScope.currentMobileActiveMenu = "reserve";
        $scope.mydays = [];
        $ionicModal.fromTemplateUrl('app/pages/employee/reserve/dda-modal.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function (modal) {
            $scope.ddaModal = modal;
        });
        $scope.orderList = function () {

            var t = $('#taghvim').text();
            moment.locale('fa');
            moment.loadPersian({dialect: 'persian-modern'});
            var time = $("#searchTime").text();
            $rootScope.day = moment.utc(t + " " + time, 'jYYYY/jM/jD HH:mm');
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                pageableDTO: {
                    "direction": "ASC",
                    "page": 0,
                    "size": 1000,
                    "sortBy": "deliveryDate"
                }
            };
            $http.post("http://127.0.0.1/v1/employee/getOrderList", params, httpOptions).success(function (data, status, headers, config) {
                var map = new HashMap();
                for (var i = 0; i < data.length; i++) {
                    var existVal = map.get(data[i].deliveryDate);
                    if (existVal) {
                        if (!data[i].totalContainerPrice) {
                            data[i].totalContainerPrice = 0;
                            data[i].totalTaxAmount = 0;
                            data[i].totalAmount = 0;
                        }
                        for (var j = 0; j < data[i].foodOrders.length; j++) {
                            data[i].totalContainerPrice += data[i].foodOrders[j].containerPrice;
                            data[i].totalTaxAmount += data[i].foodOrders[j].taxAmount;
                            data[i].totalAmount += data[i].foodOrders[j].totalPrice;
                        }
                        data[i].totalAmount += data[i].deliveryPrice;
                        data[i].show = true;
                        existVal.restaurants.push(data[i]);
                    } else {
                        var newVal = {
                            restaurants: [],
                            dayDate: null,
                            id: data[i].id,
                            desc: data[i].description
                        };
                        data[i].totalContainerPrice = 0;
                        data[i].totalTaxAmount = 0;
                        data[i].totalAmount = 0;
                        data[i].show = true;
                        for (var k = 0; k < data[i].foodOrders.length; k++) {
                            data[i].totalContainerPrice += data[i].foodOrders[k].containerPrice;
                            data[i].totalTaxAmount += data[i].foodOrders[k].taxAmount;
                            data[i].totalAmount += data[i].foodOrders[k].totalPrice;
                        }
                        data[i].totalAmount += data[i].deliveryPrice;
                        newVal.restaurants.push(data[i]);
                        newVal.dayDate = data[i].deliveryDate;
                        map.set(data[i].deliveryDate, newVal);
                    }
                }
                $scope.mydays = map.values();
                $scope.reserves = data;
                stopLoading();
            }).catch(function (err) {
                $rootScope.handleError(params, "/employee/getOrderList", err, httpOptions);
            });
        };
        var delayTimer;
        $scope.search = function () {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function () {
                startLoading();
                $.each($scope.mydays, function (index, day) {
                    $.each(day.restaurants, function (index, res) {
                        res.show = false;
                        if (res.restaurant.name.includes($scope.searchText)) {
                            res.show = true;
                        } else {
                            $.each(res.foodOrders, function (index, order) {
                                if (order.food.name.includes($scope.searchText)) {
                                    res.show = true;
                                }
                            });
                        }
                    });
                });
                $scope.$apply();
                setTimeout(function () {
                    stopLoading();
                }, 1000);
            }, 1000);
        };
        $scope.myFormatDate = function (d) {
            moment.locale('fa');
            moment.loadPersian({dialect: 'persian-modern'});
            return moment.utc(d).format('LLLL');
        };
        $scope.getDayOfWeek = function (d) {
            return d.substring(0, d.indexOf(" ") - 1);
        };
        $scope.getHour = function (d) {
            return d.substring(d.lastIndexOf(' '));
        };
        $scope.getDay = function (d) {
            return d.substring(d.indexOf(' '), d.lastIndexOf(' '));
        };

        $rootScope.reservesPerDay = new HashMap();
        $scope.validateSubmitMin = function (index) {
            var desc = $("#orderDesc_" + index).val();
            return desc.length >= 2;
        };

        $scope.validateSubmitMax = function (index) {
            var desc = $("#orderDesc_" + index).val();
            return desc.length <= 250;
        };

        $scope.orderFood = function (foodId, date) {// change this
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                date: date,
                foodId: foodId
            };
            $http.post("http://127.0.0.1/v1/employee/order", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $rootScope.userBalance = data.availableBalanceAmount;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                setTimeout(function () {
                    // $scope.loadOrders();
                }, 2000);
                $rootScope.handleError(params, "/employee/order", err, httpOptions);
            });
        };
        $scope.productPlus = function ($event, isNotPlusButton) {
            var product = $($event.currentTarget).closest('.mobile-card');
            // just if action is from plus button
            if (!isNotPlusButton) {
                var foodid = product.find("#foodID").text();
                var orderdate = product.data("orderdate");
                var foodname = product.data("foodname");
                var resid = product.data("resid");
                var foodtype = product.data("foodtype");
                var restname = product.data("restname");
                $scope.addToTodayReserves(foodname, moment.utc(orderdate), foodid, resid, foodtype, restname);
                $scope.orderFood(foodid, orderdate);
            }
            var q = product.data('quantity') + 1;
            product.data('quantity', q);
            $scope.updateProduct(product);
        };
        $scope.cancelFood = function (foodId, date) {//change this
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                date: date,
                foodId: foodId
            };
            $http.post("http://127.0.0.1/v1/employee/cancelOrderByOrderDTO", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $rootScope.userBalance = data.availableBalanceAmount;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/cancelOrderByOrderDTO", err, httpOptions);
                //$scope.loadOrders();
            });
        };

        $scope.cancelAllFood = function (foodId, localId, date) {//change this
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                date: date,
                foodId: foodId
            };
            $http.post("http://127.0.0.1/v1/employee/cancelOrderByOrderDTOList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    $rootScope.userBalance = data.availableBalanceAmount;
                    // $scope.loadOrders();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/cancelOrderByOrderDTOList", err, httpOptions);
                // $scope.loadOrders();
            });
        };
        $scope.productDel = function ($event) {
            var product = $($event.currentTarget).closest('.mobile-card');
            $scope.cancelAllFood(product.find("#foodID").text(), product.attr("id"), product.data("orderdate"));
            product.hide('blind', {direction: 'left'}, 500, function () {
                product.remove();
                if ($('.product').length == 0) {
                    $('.cart-container .cart').hide();
                    $('.cart-container .empty').show();
                }
            });
        };

        $scope.productMinus = function ($event) {
            var product = $($event.currentTarget).closest('.mobile-card');
            var pq = product.data('quantity');
            $scope.removeFromTodayReserves(moment.utc($rootScope.day), product.find("#foodID").text());
            if ($scope.num === 0 || pq === 1) {
                $scope.productDel($event);
            } else {
                $scope.cancelFood(product.find("#foodID").text(), $rootScope.day);
                var q = Math.max(1, pq - 1);
                product.data('quantity', q);
                $scope.updateProduct(product);
            }
        };
        $scope.removeFromTodayReserves = function (day, id) {
            var todaysKey = moment.utc(day).format("MM-DD-YYYY");
            var elem = $rootScope.reservesPerDay.get(todaysKey);
            if (elem) {
                for (var i = 0; i < elem.length; i++) {
                    if (elem[i].id === id) {
                        elem.splice(i, 1);
                        return;
                    }
                }
            }
        }
        $scope.updateProduct = function (product) {
            var quantity = product.data('quantity');
            $('.product-quantity', product).text(quantity);
        };


        $scope.dessert = function (resId, date) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "date": date,
                "pageableDTO": {
                    "direction": "ASC",
                    "page": 0,
                    "size": 1000,
                    "sortBy": "id"
                },
                "restaurantId": resId
            };
            $http.post("http://127.0.0.1/v1/foodSearch/getRestaurantDDA", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.ddas = data;
                    $scope.ddaModal.show();
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/foodSearch/getRestaurantDDA", err, httpOptions);
            });
        };

        $scope.cancelDessert = function () {
            $rootScope.isMainFood = true;
            $rootScope.empPageNum = 0;
            var t = $('#taghvim').find('input').val();
            $("#dateForOrder").val(t);
            $scope.loadContent(false, true)
        };

        $scope.addToTodayReserves = function (name, day, id, resId, foodType, restName) {
            var todaysKey = moment.utc(day).format("MM-DD-YYYY");
            var todays = {
                name: name,
                day: day,
                id: id,
                resId: resId,
                foodType: foodType,
                restName: restName,
                addedLocally: false
            };
            var elem = $rootScope.reservesPerDay.get(todaysKey);
            if (!elem) {
                $rootScope.reservesPerDay.set(todaysKey, [todays]);
            } else {
                elem.push(todays);
            }
        };
        $scope.addFoodDesc = function (id, index) {
            var desc = $("#orderDesc_" + index).val();
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                id: id,
                comment: desc
            };
            $http.post("http://127.0.0.1/v1/employee/addOrderDescription", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/addOrderDescription", err, httpOptions);
            });
        };

        $scope.showTab = function (e) {
            var thisTab = $(e.currentTarget);
            var tabArrow = $(thisTab).find('.tab-arrow');
            setTimeout(function () {
                thisTab.toggleClass("top-padding-20").toggleClass("bottom-padding-20").toggleClass("back-e2eded").toggleClass("box-shadow-reserve-title");
                tabArrow.toggleClass("rotate");
            },500);
            thisTab.next().slideToggle(500);

        };
        $scope.getTimeFromDate = function (d) {
            return moment.utc(d).format("HH:mm");
        };

        $scope.showSubmit = function (e) {
            $(e.currentTarget).closest('form').find('button[type="submit"]').show();
            $(e.currentTarget).addClass('comment-box-focused');
        }
    }
})();

