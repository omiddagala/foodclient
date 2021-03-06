(function () {
    'use strict';

    angular.module('BlurAdmin.pages.list-charity', [])
        .config(routeConfig)
        .controller('listCharityCtrl', listCharityCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('list-charity', {
                url: '/list-charity',
                templateUrl: 'app/pages/charity/list.html',
                controller: 'listCharityCtrl'
            });
    }

    function listCharityCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, localStorageService, $uibModal, $rootScope,$timeout, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD');
        $scope.toDate = moment(new Date()).add('days', 1).format('jYYYY/jM/jD');

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
            return $http.post("http://127.0.0.1:9000/v1/charity/getFoodList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.orders = data.data.list;
                    stopLoading();
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/charity/getFoodList", err, httpOptions);
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

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();
