(function () {
    'use strict';

    angular.module('BlurAdmin.pages.login', [])
        .config(routeConfig)
        .controller('loginCtrl', loginCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: window.isMobile() ? 'app/pages/login/m.login.html' : 'app/pages/login/login.html',
                controller: loginCtrl
            });
    }

    function loginCtrl($scope, $uibModal, baProgressModal, $http, localStorageService, $rootScope, $location, toastrConfig, toastr) {

        $scope.login = function () {
            // if (window.isMobile()) {
            //     $('.msg-error').text('');
            //     startLoading();
            //     $http.post("http://127.0.0.1:9000/security/google/captcha", { value: response })
            //         .success(function (data, status, headers, config) {
            //             if (data) {
            //                 var params = {
            //                     username: ($('#username').val()).toLowerCase(),
            //                     password: $('#pass').val(),
            //                     grant_type: 'password',
            //                     roleName: ""
            //                 };
            //                 var httpOptions = {
            //                     headers: {
            //                         'Content-type': 'application/x-www-form-urlencoded',
            //                         'authorization': 'Basic Zm9vZF9hcHBzOg=='
            //                     }
            //                 };
            //                 if (!$rootScope.isValid(params.username)) {
            //                     stopLoading();
            //                     showMessage(toastrConfig, toastr, "خطا", "لطفا در فیلد نام کاربری از کاراکترهای مجاز استفاده کنید", "error");
            //                     return;
            //                 }
            //                 $http.post("http://127.0.0.1:9000/security/oauth/token", jQuery.param(params), httpOptions)
            //                     .success(function (data, status, headers, config) {
            //                         stopLoading();
            //                         var jwt = parseJwt(data.access_token);
            //                         localStorageService.set("my_access_token", data.access_token);
            //                         localStorageService.set("roles", jwt.authorities);
            //                         localStorageService.set("username", params.username);
            //                         $rootScope.username = params.username;
            //                         $rootScope.roles = jwt.authorities;
            //                         $rootScope.loadProfileImage();
            //                         $rootScope.loadBalanceByRole();
            //                         $rootScope.locateFirstPage();
            //                         $rootScope.loadMenus();
            //                     }).catch(function (err) {
            //                         if (err.status === 400) {
            //                             stopLoading();
            //                             showMessage(toastrConfig, toastr, "خطا", "نام کاربری یا رمز عبور اشتباه می باشد", "error");
            //                             return;
            //                         }
            //                         $rootScope.handleError(params, "/security/oauth/token", err, httpOptions);
            //                     });
            //             } else {
            //                 $('.msg-error').text("احراز هویت با خطا مواجه شد");
            //             }
            //         }).catch(function (err) {
            //             $rootScope.handleError({ value: response }, "/security/google/captcha", err, null);
            //         });
            // } else {
                var $captcha = $('#captcha_container'),
                    response = grecaptcha.getResponse();

                if (response.length === 0) {
                    $('.msg-error').text("لطفا گزینه من ربات نیستم را تایید کنید");
                } else {
                    $('.msg-error').text('');
                    startLoading();
                    $http.post("http://127.0.0.1:9000/google/captcha", { value: response })
                        .success(function (data, status, headers, config) {
                            if (data) {
                                var params = {
                                    username: ($('#username').val()).toLowerCase(),
                                    password: $('#pass').val(),
                                    grant_type: 'password',
                                    roleName: ""
                                };
                                var httpOptions = {
                                    headers: {
                                        'Content-type': 'application/x-www-form-urlencoded',
                                        'authorization': 'Basic Zm9vZF9hcHBzOg=='
                                    }
                                };
                                if (!$rootScope.isValid(params.username)) {
                                    stopLoading();
                                    showMessage(toastrConfig, toastr, "خطا", "لطفا در فیلد نام کاربری از کاراکترهای مجاز استفاده کنید", "error");
                                    return;
                                }
                                $http.post("http://127.0.0.1:9000/oauth/token", jQuery.param(params), httpOptions)
                                    .success(function (data, status, headers, config) {
                                        stopLoading();
                                        var jwt = parseJwt(data.access_token);
                                        localStorageService.set("my_access_token", data.access_token);
                                        localStorageService.set("roles", jwt.authorities);
                                        localStorageService.set("username", params.username);
                                        $rootScope.username = params.username;
                                        $rootScope.roles = jwt.authorities;
                                        $rootScope.loadProfileImage();
                                        $rootScope.loadBalanceByRole();
                                        $rootScope.locateFirstPage();
                                        $rootScope.loadMenus();
                                    }).catch(function (err) {
                                        if (err.status === 400) {
                                            stopLoading();
                                            showMessage(toastrConfig, toastr, "خطا", "نام کاربری یا رمز عبور اشتباه می باشد", "error");
                                            return;
                                        }
                                        $rootScope.handleError(params, "/oauth/token", err, httpOptions);
                                    });
                            } else {
                                $('.msg-error').text("احراز هویت با خطا مواجه شد");
                            }
                        }).catch(function (err) {
                            $rootScope.handleError({ value: response }, "/google/captcha", err, null);
                        });
                }
            // }
        };

        function parseJwt(token) {
            var base64Url = token.split('.')[1];
            var base64 = base64Url.replace('-', '+').replace('_', '/');
            return JSON.parse(window.atob(base64));
        }


        // check width for mobile
        checkWidth();
        window.onresize = function () {
            checkWidth();
        }
        function checkWidth() {
            if ((window.innerWidth > window.innerHeight - 50) && window.isMobile()) {
                $('.m-login-img').css('opacity', '.2');
            } else {
                $('.m-login-img').css('opacity', '1');
            }
        }
    }

})();