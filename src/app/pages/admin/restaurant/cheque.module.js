(function () {
    'use strict';

    angular.module('BlurAdmin.pages.rest-cheque', [])
        .config(routeConfig)
        .controller('restChequeCtrl', restChequeCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('rest-cheque', {
                url: '/rest-cheque',
                templateUrl: 'app/pages/admin/restaurant/cheque.html',
                controller: 'restChequeCtrl'
            });
    }

    function restChequeCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, $rootScope,localStorageService, $location,$uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;

        $scope.initCtrl = function () {
            $scope.submitted = false;
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
                "value": search.predicateObject ? search.predicateObject.name : "",
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'name'
                }
            };
            return $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/findByName", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.rests = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/findByName", err, httpOptions);
                });

        };

        $scope.openModal = function (page, size, id,index) {
            $scope.itemId = id;
            $scope.itemIndex = index;
            $scope.submitted = false;
            var m =$uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
            m.rendered.then(function (e) {
                if ($('.modal-dialog .modal-content .modal-content.modal-fit').length > 0) {
                    $('.modal-dialog').addClass('fit-height-imp');
                }                
            }); 
        };

        $scope.issueCheque = function (form) {
            $scope.submitted = true;
            if (!form.$valid){
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id : $scope.itemId,
                comment: $("#desc").val()
            };
            $http.post("https://demoapi.karafeed.com/v1/financial/createAllRestaurantsCheque", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/financial/createAllRestaurantsCheque", err, httpOptions);
            });
        };

        $scope.payMoney = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id : $scope.itemId
            };
            $http.post("https://demoapi.karafeed.com/v1/financial/payToActiveRestaurants", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/financial/payToActiveRestaurants", err, httpOptions);
            });
        };

        $scope.getStatus = function(status){
            if (status === "DE_ACTIVE" || status === "DELETE"){
                return "غیرفعال";
            } else {
                return "فعال";
            }
        };

        $scope.getStatusColor = function(status){
            if (status === "DE_ACTIVE" || status === "DELETE"){
                return {'color':'red'};
            } else {
                return {'color' : 'green'};
            }
        };

        $scope.report = function (id) {
            if (id) {
                $location.path('/ad-rest-cheque-report').search({id: id});
            } else {
                $location.path('/ad-rest-cheque-report').search({});
            }
        };

        $scope.financial = function (id) {
            $location.path('/ad-rest-financial').search({id: id});
        };

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();