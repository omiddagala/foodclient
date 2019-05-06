(function () {
    'use strict';

    angular.module('BlurAdmin.pages.res-printed', [])
        .config(routeConfig)
        .controller('resPrintedCtrl', resPrintedCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('res-printed', {
                url: '/res-printed',
                templateUrl: 'app/pages/restaurant/invoice/printed.html',
                controller: 'resPrintedCtrl'
            });
    }

    function resPrintedCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, localStorageService, $uibModal, $rootScope,$timeout, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD');
        $scope.toDate = moment(new Date()).add('days', 1).format('jYYYY/jM/jD');
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

        $scope.search = function (pagination, sort) {
            if (preventTwiceLoad){
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'deliveryDate'
                }
            };
            return $http.post("http://127.0.0.1/v1/restaurant/food/getPrintedInvoiceData", param, httpOptions)
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
                    stopLoading();
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/restaurant/food/getPrintedInvoiceData", err, httpOptions);
                });
        };

        $scope.dateChanged = function (date, isFromDate) {
            if (isFromDate) {
                $scope.fromDate = date;
            } else {
                $scope.toDate = date;
            }
            $scope.$broadcast('refreshMyTable');
        };

        $scope.printFactor = function (item) {
            var param = prepareFactorToPrint(item,$rootScope);
            printFactor(param);
        };

        $scope.viewFactor = function (item) {
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