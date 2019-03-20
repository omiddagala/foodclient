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

    function reserveCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, toastrConfig, toastr, $location) {
        $rootScope.pageTitle = 'رزروها';
        $scope.reserves = {};
        $rootScope.currentMobileActiveMenu = "reserve";
        $scope.orderList = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                pageableDTO: {
                    "direction": "ASC",
                    "page": 0,
                    "size": 1000,
                    "sortBy": "deliveryDate"
                }
            };  
            $http.post("https://demoapi.karafeed.com/pepper/v1/employee/getOrderList", params, httpOptions).success(function (data, status, headers, config) {
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
                $rootScope.mydays = map.values();
                $scope.reserves = data;
                stopLoading();
                console.log(data);
                console.log('reserves: ', $scope.reserves);
                console.log('mydays: ', $scope.mydays);
            }).catch(function (err) {
                $rootScope.handleError(params, "/employee/getOrderList", err, httpOptions);
            });
        };
        $scope.myFormatDate = function (d) {
            moment.locale('fa');
            moment.loadPersian({ dialect: 'persian-modern' });
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

        $scope.validateSubmitMin = function (index) {
            var desc = $("#orderDesc_" + index).val();
            return desc.length >= 2;
        };

        $scope.validateSubmitMax = function (index) {
            var desc = $("#orderDesc_" + index).val();
            return desc.length <= 250;
        };

        $scope.productPlus = function ($event, isNotPlusButton) {
            var product = $($event.currentTarget).closest('.mobile-card');
            // just if action is from plus button
            if (!isNotPlusButton) {
                var foodid = product.data("foodid");
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

        $scope.productMinus = function ($event) {
            var product = $($event.currentTarget).closest('.mobile-card');
            var pq = product.data('quantity');
            $scope.removeFromTodayReserves(moment.utc(product.data("orderdate")), product.data("foodid"));
            if ($scope.num === 0 || pq === 1) {
                $scope.productDel($event);
            } else {
                $scope.cancelFood(product.data("foodid"), product.data("orderdate"));
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

        $scope.productDel = function ($event) {
            var product = $($event.currentTarget).closest('.mobile-card');
            $scope.cancelAllFood(product.data("foodid"), product.attr("id"), product.data("orderdate"));
            product.hide('blind', { direction: 'left' }, 500, function () {
                product.remove();
                if ($('.product').length == 0) {
                    $('.cart-container .cart').hide();
                    $('.cart-container .empty').show();
                }
            });
        };

        $scope.dessert = function ($event, resId) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var product = $($event.currentTarget).closest('.mobile-card');
            var date = product.data("orderdate");
            var datetime = moment.utc(date, 'YYYY-MM-DDTHH:mmZ').format('jYYYY/jM/jD HH:mm');
            $("#dateForOrder").val(datetime);
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
            $http.post("https://demoapi.karafeed.com/pepper/v1/foodSearch/getRestaurantDDA", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $rootScope.isMainFood = false;
                    $rootScope.empPageNum = 0;
                    $rootScope.foods = data;
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
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                id: id,
                comment: desc
            };
            $http.post("https://demoapi.karafeed.com/pepper/v1/employee/addOrderDescription", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                    $rootScope.handleError(params, "/employee/addOrderDescription", err, httpOptions);
                });
        };

        $scope.showSubmit = function (e) {
            $(e.currentTarget).closest('form').find('button[type="submit"]').show();
            $(e.currentTarget).addClass('comment-box-focused');
        }
    }
})();

