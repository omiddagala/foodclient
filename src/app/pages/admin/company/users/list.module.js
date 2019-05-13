(function () {
    'use strict';

    angular.module('BlurAdmin.pages.ad-co-users', [])
        .config(routeConfig)
        .controller('adminCompanyUsersCtrl', adminCompanyUsersCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-co-users', {
                url: '/ad-co-users',
                templateUrl: 'app/pages/admin/company/users/list.html',
                controller: 'adminCompanyUsersCtrl'
            });
    }

    function adminCompanyUsersCtrl($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        $scope.chargeReason = 'CHARGE_BY_ADMIN';
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

        $scope.search = function (pagination, sort, search) {
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
                // companyName: search.predicateObject ? search.predicateObject.companyName : null,
                mobileNumber: search.predicateObject ? search.predicateObject.mobile : null,
                name: search.predicateObject ? search.predicateObject.name : null,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'name'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/search", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.companyUsers = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminEmployeeManagementRest/search", err, httpOptions);
                });
        };
        $scope.openModal = function (page, size, id, index) {
            $scope.companyUserId = id;
            $scope.companyUserIndex = index;
            $scope.submitted = false;
            var m = $uibModal.open({
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

        $scope.chargeReasonChanged = function (r) {
            $scope.chargeReason = r;
        };

        $scope.doCharge = function (form) {
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
                "amount": $("#amount").val(),
                "comment": $("#desc").val(),
                "employeeId": $scope.companyUserId,
                "transactionTypeEnum": $scope.chargeReason
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/chargeEmployee", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/chargeEmployee", err, httpOptions);
            });
        };

        $scope.changePass = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.companyUserId,
                password: $('#newPass').val()
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/resetEmployeePassword", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/resetEmployeePassword", err, httpOptions);
            });
        };

        $scope.sendMessage = function (form) {
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
                id : $scope.companyUserId,
                message: $("#desc").val()
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/sendSMS", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/sendSMS", err, httpOptions);
            });
        };

        $scope.sendSystemMessage = function (form) {
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
                value: $("#desc").val()
            };
            $http.post("http://127.0.0.1:9000/v1/adminEmployeeManagementRest/sendSystemMessageToAll", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminEmployeeManagementRest/sendSystemMessageToAll", err, httpOptions);
            });
        };

        $scope.view = function (id) {
            $location.path('/ad-co-detail').search({id: id});
        };

        $scope.financial = function (id) {
            $location.path('/ad-co-user-financial').search({id: id});
        };

        $scope.orders = function (id) {
            $location.path('/ad-co-user-orders').search({id: id});
        };

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();