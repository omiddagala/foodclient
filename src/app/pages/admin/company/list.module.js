(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-list', [])
        .config(routeConfig)
        .controller('companyListCtrl', companyListCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-list', {
                url: '/co-list',
                templateUrl: 'app/pages/admin/company/list.html',
                controller: 'companyListCtrl'
            });
    }

    function companyListCtrl($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location,$uibModal, $uibModalStack, toastrConfig, toastr) {
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
            return $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/findByName", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.rests = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminCompanyManagementRest/findByName", err, httpOptions);
                });

        };

        $scope.edit = function (id) {
            $location.path('/co-detail').search({id: id});
        };

        $scope.financial = function (id) {
            $location.path('/ad-co-financial').search({id: id});
        };

        $scope.add = function () {
            $state.go("co-detail");
        };

        $scope.removeCompany = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            return $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/delete", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    $uibModalStack.dismissAll();
                    $scope.rests.splice($scope.itemIndex, 1);
                    if ($scope.rests.length === 0){
                        $scope.$broadcast('refreshMyTable');
                    }
                    stopLoading();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                    $rootScope.handleError($scope.item.id, "/adminCompanyManagementRest/delete", err, httpOptions);
                });
        };

        $scope.openModal = function (page, size, item,index) {
            $scope.item = item;
            $scope.itemIndex = index;
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
                "comment": $("#desc").val(),
                "companyId": $scope.item,
                "transferAmount": $("#amount").val().replace(/,/g, '')
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/chargeCompany", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminCompanyManagementRest/chargeCompany", err, httpOptions);
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
                id : $scope.item,
                message: $("#desc").val()
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/sendSMS", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminCompanyManagementRest/sendSMS", err, httpOptions);
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
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/sendSystemMessageToAll", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminCompanyManagementRest/sendSystemMessageToAll", err, httpOptions);
            });
        };

        $scope.deactiveUser = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/deActive", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.item.accountStatus = 'DELETE';
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError($scope.item.id, "/adminCompanyManagementRest/deActive", err, httpOptions);
            });
        };

        $scope.activateUser = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/active", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.item.accountStatus = 'ACTIVE';
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError($scope.item.id, "/adminCompanyManagementRest/active", err, httpOptions);
            });
        };

        $scope.changePass = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.item.id,
                password: $('#newPass').val()
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/resetCompanyPassword", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminCompanyManagementRest/resetCompanyPassword", err, httpOptions);
            });
        };

        $scope.coAddresses = function(id){
            $location.path("/ad-loc").search({id: id})
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

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();
