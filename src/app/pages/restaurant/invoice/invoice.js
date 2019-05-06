(function () {
    'use strict';

    angular.module('BlurAdmin.pages.invoice', [])
        .config(routeConfig)
        .controller('invoiceCtrl', invoiceCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('invoice', {
                url: '/invoice',
                templateUrl: 'app/pages/restaurant/invoice/invoice.html',
                controller: 'invoiceCtrl'
            });
    }

    function invoiceCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, localStorageService, $uibModal, $rootScope, $timeout, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;
        var autoLoad;

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
            }, 1000);
            autoLoad = setInterval(function () {
                $scope.$broadcast('refreshMyTable');
            }, 240000);
        };

        $scope.$on('$destroy', function() {
            clearInterval(autoLoad);
        });

        $scope.search = function (pagination, sort) {
            if (preventTwiceLoad) {
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $scope.pagination = pagination;
            $scope.sort = sort;
            var param = {
                startDate: null,
                endDate: null,
                pageableDTO: {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'deliveryDate'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/restaurant/food/getInvoiceDataForRestaurant", param, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.orders = data.data.list;
                    for (var i = 0; i < $scope.orders.length; i++) {
                        $scope.orders[i].totalContainerPrice = 0;
                        $scope.orders[i].totalTaxAmount = 0;
                        $scope.orders[i].totalAmount = 0;
                        for (var k = 0; k < $scope.orders[i].foodOrders.length; k++) {
                            $scope.orders[i].totalContainerPrice += $scope.orders[i].foodOrders[k].containerPrice;
                            $scope.orders[i].totalTaxAmount += $scope.orders[i].foodOrders[k].taxAmount;
                            $scope.orders[i].totalAmount += $scope.orders[i].foodOrders[k].totalPrice;
                        }
                        $scope.orders[i].totalAmount += ($scope.orders[i].deliveryPrice + $scope.orders[i].deliveryPriceTax)
                    }
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
                    $rootScope.handleError(param, "/restaurant/food/getInvoiceDataForRestaurant", err, httpOptions);
                });
        };

        $scope.issueInvoice = function (page, size, item) {
            $rootScope.factor = item;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
        };

        $scope.viewFactor = function (item,index) {
            var param = prepareFactorToPrint(item,$rootScope);
            $uibModal.open({
                animation: true,
                templateUrl: 'app/pages/restaurant/invoice/view-factor.html',
                size: 'lg',
                scope: $scope
            });
            setTimeout(function () {
                $("#detail").append(param);
            },500);
        };

        $scope.printFactor = function (item,index) {
            startLoading();
            var param = prepareFactorToPrint(item,$rootScope);
            printFactor(param);
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var ids = [];
            ids.push(item.id);
            var data = {
                "comment":"",
                "list": ids
            };
            $http.post("http://127.0.0.1:9000/v1/restaurant/food/printInvoice", JSON.stringify(data), httpOptions)
                .then(function (data, status, headers, config) {
                    $rootScope.numOfAllFactors --;
                    $scope.$broadcast('refreshMyTable');
                }).catch(function (err) {
                $rootScope.handleError(data, "/restaurant/food/printInvoice", err, httpOptions);
            });
        };

        $scope.printAllPage = function () {
            startLoading();
            var param;
            var ids = [];
            for(var i=0;i<$scope.orders.length;i++){
                param += prepareFactorToPrint($scope.orders[i],$rootScope);
                ids.push($scope.orders[i].id);
            }
            printFactor(param);
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };

            var data = {
                "comment":"",
                "list": ids
            };
            $http.post("http://127.0.0.1:9000/v1/restaurant/food/printInvoice", JSON.stringify(data), httpOptions)
                .then(function (data, status, headers, config) {
                    $rootScope.numOfAllFactors = $rootScope.numOfAllFactors - $scope.orders.length;
                    $scope.$broadcast('refreshMyTable');
                }).catch(function (err) {
                $rootScope.handleError(data, "/restaurant/food/printInvoice", err, httpOptions);
            });
        };
        //vahid seraj updated code. (1397.09.29) ------------- [start]
        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        }
        //vahid seraj updated code. (1397.09.29) ------------- [end]

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();