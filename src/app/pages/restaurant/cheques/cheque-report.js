(function () {
    'use strict';

    angular.module('BlurAdmin.pages.rest-cheque-report', [])
        .config(routeConfig)
        .controller('restChequeReport', restChequeReport);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('rest-cheque-report', {
                url: '/rest-cheque-report',
                templateUrl: 'app/pages/restaurant/cheques/cheque-report.html',
                controller: 'restChequeReport'
            });
    }

    function restChequeReport($scope, $filter, editableOptions, editableThemes, $state, $q, $http, $rootScope,localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD');
        $scope.toDate = moment(new Date()).add('days', 30).format('jYYYY/jM/jD');
        var id;
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
            id = $location.search().id;
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "id": id,
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'id'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/restaurant/getRestaurantChequeList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.orders = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/restaurant/getRestaurantChequeList", err, httpOptions);
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

        $scope.openModal = function (page, size, index) {
            $scope.order = $scope.orders[index];
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
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