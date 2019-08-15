(function () {
    'use strict';

    angular.module('BlurAdmin.pages.failed-payment', [])
        .config(routeConfig)
        .controller('successPaymentCtrl', successPaymentCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('success-payment', {
                url: '/success-payment',
                templateUrl: 'app/pages/payment/success.html',
                controller: successPaymentCtrl
            });
    }

    function successPaymentCtrl($scope, $uibModal, baProgressModal, $http, $rootScope, $location, toastrConfig, toastr,localStorageService) {
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
