(function () {
    'use strict';

    angular.module('BlurAdmin.pages.departments', [])
        .config(routeConfig)
        .controller('adminDepartmentsCtrl', adminDepartmentsCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('departments', {
                url: '/departments',
                templateUrl: 'app/pages/admin/location/departments.html',
                controller: 'adminDepartmentsCtrl'
            });
    }

    function adminDepartmentsCtrl($scope, $filter, editableOptions, editableThemes, $rootScope, $state, $q, $http, localStorageService, $location, $uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;


        $scope.initCtrl = function () {
            setTimeout(function () {
                initDepartment();
            }, 700)
        };

        $scope.search = function (pagination, sort) {

        };

        function initDepartment() {
            $scope.dept = {
                id: null,
                name: null,
                loc: {
                    id: $rootScope.LOC.id
                }
            };
        }

        $scope.opneModal = function (page, size, item, index) {
            if (!item){
                initDepartment();
            } else {
                $scope.dept = item;
                $scope.dept.loc = {
                    id: $rootScope.LOC.id
                };
            }
            $scope.index = index;
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

        $scope.saveOrUpdate = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/addOrUpdateDepartmentForLocation", $scope.dept, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    if (!$scope.dept.id)
                        $rootScope.LOC.departments.push(data.data);
                    $uibModalStack.dismissAll();
                }).catch(function (err) {
                $rootScope.handleError($scope.dept, "/adminCompanyManagementRest/addOrUpdateDepartmentForLocation", err, httpOptions);
            });
        };

        $scope.deleteLocation = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/deleteDepartmentFromLocation", $scope.dept, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    $rootScope.LOC.departments.splice($scope.index, 1);
                    $uibModalStack.dismissAll();
                }).catch(function (err) {
                $rootScope.handleError($scope.location, "/adminCompanyManagementRest/deleteDepartmentFromLocation", err, httpOptions);
            });
        };

    }
})();
