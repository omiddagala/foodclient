(function () {
    'use strict';

    angular.module('BlurAdmin.pages.changepass', [])
        .config(routeConfig)
        .controller('changepassCtrl', changepassCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('change-pass', {
                url: '/change-pass',
                templateUrl: 'app/pages/changepass/change.html',
                controller: changepassCtrl
            });
    }

    function changepassCtrl($scope, $uibModal, baProgressModal, $http, $rootScope, $location, toastrConfig, toastr,localStorageService) {

        $scope.changePass = function () {
            if (!$rootScope.checkFieldsEquality("password","repassword"))
                return;
            startLoading();
            var url;
            if (jQuery.inArray("EMPLOYEE", $rootScope.roles) > -1) {
                url = "https://demoapi.karafeed.com/v1/employee/changePassword";
            } else if (jQuery.inArray("RESTAURANT", $rootScope.roles) > -1) {
                url = "https://demoapi.karafeed.com/v1/restaurant/changePassword";
            } else if (jQuery.inArray("COMPANY", $rootScope.roles) > -1 || $rootScope.hasRole("SILVER_COMPANY")) {
                url = "https://demoapi.karafeed.com/v1/company/changePassword";
            } else {
                url = "https://demoapi.karafeed.com/v1/admin/changePassword";
            }
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "username": $rootScope.username.toLowerCase(),
                "password": $scope.password, // $("#password").val(),
                "lastPassword": $scope.oldpass, // $("#oldpass").val()
            };
            $http.post(url, params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError(params, url, err, httpOptions);
            });
        };
    }
})();