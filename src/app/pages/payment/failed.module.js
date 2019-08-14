(function () {
    'use strict';

    angular.module('BlurAdmin.pages.success-payment', [])
        .config(routeConfig)
        .controller('failedPaymentCtrl', failedPaymentCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('failed-payment', {
                url: '/failed-payment',
                templateUrl: 'app/pages/payment/failed.html',
                controller: failedPaymentCtrl
            });
    }

    function failedPaymentCtrl($scope, $uibModal, baProgressModal, $http, $rootScope, $location, toastrConfig, toastr,localStorageService) {
        $scope.initCtrl = function () {
            setTimeout(function () {
                if (window.isMobile()) {
                    $(".page-top").css("display","none");
                    $(".bar-header").css("display","none");
                    $(".bar-footer").css("display","none");
                }
            },500);
        }
    }
})();
