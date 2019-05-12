(function () {
    'use strict';

    angular.module('BlurAdmin.pages.forget', [])
        .config(routeConfig)
        .controller('forgetCtrl', forgetCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('forget', {
                url: '/forget',
                templateUrl: 'app/pages/forget/pass.html'
            });
    }

    function forgetCtrl($scope, $uibModal, baProgressModal, $http, localStorageService, $rootScope, $location, toastrConfig, toastr,$state) {

        $scope.mylevel = '1';
        $scope.mobile = "";
        $scope.code = "";
        $scope.password = "";
        $scope.repassword = "";
        var clock;

        $scope.level1 = function () {
            startLoading();
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8'}
            };
            var params = {
                "phone": $("#mobile").val(), // $("#mobile").val()
            };
            $http.post("https://demoapi.karafeed.com/v1/userSecurity/getResetCode", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.mylevel = '2';
                    localStorageService.set("mobile", $("#mobile").val());
                    setTimeout(function () {
                        clock = $('#code-timeout').FlipClock({
                            clockFace: 'MinuteCounter'
                        });
                        clock.setCountdown(true);
                        clock.setTime(60 * 10);
                    }, 700);
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "کد برای شما ارسال شد", "success");
                }).catch(function (err) {
                $rootScope.handleError(params, "/userSecurity/getResetCode", err, httpOptions);
            });
        };

        $scope.level2 = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8'}
            };
            var params = {
                "phone": localStorageService.get("mobile"),
                "password":  $("#password").val(),
                "code": $("#code").val()
            };
            $http.post("https://demoapi.karafeed.com/v1/userSecurity/resetPassByCode", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.mylevel = '1';
                    localStorageService.remove("mobile");
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    $state.go("login");
                }).catch(function (err) {
                $rootScope.handleError(params, "/userSecurity/resetPassByCode", err, httpOptions);
            });
        };

    }
})();