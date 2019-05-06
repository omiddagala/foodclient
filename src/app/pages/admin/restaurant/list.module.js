(function () {
    'use strict';

    angular.module('BlurAdmin.pages.rest-list', [])
        .config(routeConfig)
        .controller('restListCtrl', restListCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('rest-list', {
                url: '/rest-list',
                templateUrl: 'app/pages/admin/restaurant/list.html',
                controller: 'restListCtrl'
            });
    }

    function restListCtrl($scope, $filter, editableOptions, editableThemes, $state, $q, $http, $rootScope,localStorageService, $location,$uibModal, $uibModalStack, toastrConfig, toastr) {
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
            return $http.post("http://127.0.0.1/v1/adminRestaurantManagementRest/findByName", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.rests = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/findByName", err, httpOptions);
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
            $http.post("http://127.0.0.1/v1/adminRestaurantManagementRest/sendSMS", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminRestaurantManagementRest/sendSMS", err, httpOptions);
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
            $http.post("http://127.0.0.1/v1/adminRestaurantManagementRest/sendSystemMessageToAll", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminRestaurantManagementRest/sendSystemMessageToAll", err, httpOptions);
            });
        };

        $scope.deactiveUser = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1/v1/adminRestaurantManagementRest/deActiveRestaurant", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.item.accountStatus = 'DELETE';
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError($scope.item.id, "/adminRestaurantManagementRest/deActiveRestaurant", err, httpOptions);
            });
        };

        $scope.activateUser = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1/v1/adminRestaurantManagementRest/activeRestaurant", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.item.accountStatus = 'ACTIVE';
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError($scope.item.id, "/adminRestaurantManagementRest/activeRestaurant", err, httpOptions);
            });
        };

        $scope.changePass = function () {
            if (!$rootScope.checkFieldsEquality("newPass","newPass2"))
                return;
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.item.id,
                password: $('#newPass').val()
            };
            $http.post("http://127.0.0.1/v1/adminRestaurantManagementRest/resetRestaurantPassword", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/adminRestaurantManagementRest/resetRestaurantPassword", err, httpOptions);
            });
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

        $scope.edit = function (id) {
            $location.path('/rest-detail').search({id: id});
        };

        $scope.add = function () {
            $state.go("rest-detail");
        };

        $scope.menu = function(id){
            $location.path("/admin-food").search("id",id);
        };

        $scope.removeRest = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            return $http.post("http://127.0.0.1/v1/adminRestaurantManagementRest/delete", $scope.item.id, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.rests.splice($scope.itemIndex, 1);
                    if ($scope.rests.length === 0){
                        $scope.$broadcast('refreshMyTable');
                    }
                    $uibModalStack.dismissAll();
                    stopLoading();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                    $rootScope.handleError($scope.item.id, "/adminRestaurantManagementRest/delete", err, httpOptions);
                });
        };

        $scope.submitUploadedPaymentFile = function () {
            startLoading();
            var input = document.getElementById('uploadFile');
            var reader = new FileReader();
            reader.readAsDataURL(input.files[0]);
            reader.onload = function(e) {
                var token = localStorageService.get("my_access_token");
                var httpOptions = {
                    headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
                };
                var param = {value:e.target.result.substring(e.target.result.indexOf(",") + 1)};
                $http.post("http://127.0.0.1/v1/financial/setPaidCheques", param, httpOptions)
                    .success(function (data, status, headers, config) {
                        stopLoading();
                        $uibModalStack.dismissAll();
                        showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                    }).catch(function (err) {
                    $rootScope.handleError(param, "/financial/setPaidCheques", err, httpOptions);
                });
            };
        };

        $scope.downloadPaymentFile = function(){
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1/v1/financial/getRestaurantsChequeFile", null, httpOptions)
                .success(function (data, status, headers, config) {
                    mydownload(data,'payment.txt','plain/text');
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(null, "/financial/getRestaurantsChequeFile", err, httpOptions);
            });
        };

        $scope.adminDatabaseOperation = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1/v1/adminRestaurantManagementRest/updateDB", null, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $rootScope.handleError(null, "/adminRestaurantManagementRest/updateDB", err, httpOptions);
            });
        };

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();