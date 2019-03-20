(function () {
    'use strict';

    angular.module('BlurAdmin.pages.company-inactive-users', [])
        .config(routeConfig)
        .controller('companyInActiveUsersCtrl', companyInActiveUsersCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-inactive-users', {
                url: '/co-inactive-users',
                templateUrl: 'app/pages/company/users/inactive-users.html',
                controller: 'companyInActiveUsersCtrl'
            });
    }

    function companyInActiveUsersCtrl($scope, $filter, editableOptions, editableThemes, $state, $rootScope, $q, $http, localStorageService, $location, $uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;

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
                    $('.mycontent').animate({ scrollTop: 0 }, 800);
                    return false;
                });
            }, 1000)
        };
        //vahid seraj updated code. (1397.10.01) ------------- [start]
        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        }
        //vahid seraj updated code. (1397.10.01) ------------- [end]
        $scope.search = function (pagination, sort, search) {
            if (preventTwiceLoad) {
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var param = {
                pageableDTO: {
                    direction: sort.reverse ? 'DESC' : 'ASC',
                    page: pagination.start / pagination.number,
                    size: pagination.number,
                    sortBy: sort.predicate ? sort.predicate : 'name'
                },
                name: $scope.employeeName,
                personnelCode: $scope.personnelCode,
                status: "DE_ACTIVE"
            };
            return $http.post("https://demoapi.karafeed.com/pepper/v1/companyEmployeeManagement/searchEmployee", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    // data.data.list = new Array(1);
                    // data.data.count = 10;
                    $scope.inactiveUsers = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/companyEmployeeManagement/searchEmployee", err, httpOptions);
                    
                });
        };
        var delayTimer;
        var searchParam = {
            predicateObject: {
                name: null,
                personnelCode: null
            }
        };
        $scope.userSearch = function () {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function () {
                $scope.$broadcast('refreshMyTable');
            }, 1000);
        };
        $scope.openModal = function (page, size, id, index) {
            $scope.companyUserId = id;
            $scope.companyUserIndex = index;
            $uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });
        };

        $scope.activateUser = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            $http.post("https://demoapi.karafeed.com/pepper/v1/companyEmployeeManagement/activeEmployee", $scope.companyUserId, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.inactiveUsers.splice($scope.companyUserIndex, 1);
                    if ($scope.inactiveUsers.length === 0) {
                        $scope.$broadcast('refreshMyTable');
                    }
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $uibModalStack.dismissAll();
                    $rootScope.handleError($scope.companyUserId, "/companyEmployeeManagement/activeEmployee", err, httpOptions);
                });
        };

        $scope.doDelete = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            $http.post("https://demoapi.karafeed.com/pepper/v1/companyEmployeeManagement/deleteEmployee", $scope.companyUserId, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.inactiveUsers.splice($scope.companyUserIndex, 1);
                    if ($scope.inactiveUsers.length === 0) {
                        $scope.$broadcast('refreshMyTable');
                    }
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $uibModalStack.dismissAll();
                    $rootScope.handleError($scope.companyUserId, "/companyEmployeeManagement/deleteEmployee", err, httpOptions);
                });
        };

        $scope.doSettle = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            $http.post("https://demoapi.karafeed.com/pepper/v1/companyEmployeeManagement/settlingDeActiveEmployee", $scope.companyUserId, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $uibModalStack.dismissAll();
                    $rootScope.handleError($scope.companyUserId, "/companyEmployeeManagement/settlingDeActiveEmployee", err, httpOptions);
                });
        };

        $scope.finance = function (id) {
            $location.path('/co-employee-financial').search({ id: id });
        };

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();