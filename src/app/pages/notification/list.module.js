(function () {
    'use strict';

    angular.module('BlurAdmin.notification', [])
        .config(routeConfig)
        .controller('notificationCtrl', notificationCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('notification', {
                url: '/notification',
                templateUrl: 'app/pages/notification/list.html',
                controller: 'notificationCtrl'
            });
    }

    function notificationCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, $rootScope,localStorageService, $location,$uibModal, $uibModalStack) {
        $scope.smartTablePageSize = 10;

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

        $scope.search = function (pagination, sort,search) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "value": search.predicateObject ? search.predicateObject.name : "",
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'date'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/message/getMessages", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.messages = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/message/getMessages", err, httpOptions);
                });

        };

        $scope.openModal = function (page, size, item,index) {
            $scope.item = item;
            $scope.itemIndex = index;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
        };

        $scope.makeRead = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/message/makeMessageRead", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.item.read = true;
                    $uibModalStack.dismissAll();
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError($scope.item.id, "/message/makeMessageRead", err, httpOptions);
            });
        };

        $scope.getStatus = function(status){
            if (status){
                return "خوانده شده";
            } else {
                return "خوانده نشده";
            }
        };

        $scope.getStatusColor = function(status){
            if (status){
                return {'color':'red'};
            } else {
                return {'color' : 'green'};
            }
        };


        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();
