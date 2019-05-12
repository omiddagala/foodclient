(function () {
    'use strict';
    angular.module('BlurAdmin.pages.company-charge-all', [])
    .config(routeConfig)
    .controller('companyChargeAllCtrl', companyChargeAllCtrl);
    
    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-charge-all', {
                url: '/co-charge-all',
                templateUrl: 'app/pages/company/charge-all/charge.html',
                controller: 'companyChargeAllCtrl'
            });
    }

    function companyChargeAllCtrl($scope, fileReader, $filter, $uibModal, $http, $rootScope,localStorageService, toastrConfig, toastr) {
        $scope.employeeLevel = "ALL";
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

        $scope.chargeAll = function (form) {
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
                "comment": $scope.desc, // $('#desc').val(),
                "password": $scope.pass, // $('#pass').val(),
                "transferAmount": $scope.amount, // $('#amount').val(),
                "employeeLevel": $scope.employeeLevel
            };
            $http.post("https://demoapi.karafeed.com/v1/company/chargeActiveEmployees", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                    $rootScope.loadBalanceByRole();
                }).catch(function (err) {
                $rootScope.handleError(param, "/company/chargeActiveEmployees", err, httpOptions);
            });
        };

        $scope.employeeLevelChanged = function (t) {
            $scope.employeeLevel = t;
        };
    }
})();