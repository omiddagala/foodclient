(function () {
    'use strict';

    angular.module('BlurAdmin.pages.ad-cheques', [])
        .config(routeConfig)
        .controller('adminChequeCtrl', adminChequeCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('admin-cheque', {
                url: '/admin-cheque',
                templateUrl: 'app/pages/admin/cheques/cheques.html',
                controller: 'adminChequeCtrl'
            });
    }

    function adminChequeCtrl($scope, $filter, editableOptions, editableThemes,$rootScope, $state, $q, $http, localStorageService, $location,$uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;

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


        $scope.openModal = function (page, size) {
            $scope.submitted = false;
            var m =$uibModal.open({
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

        $scope.issueIncomeCheque = function (form) {
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
            $http.post("http://127.0.0.1/v1/financial/createAdminIncomeCheque", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/financial/createAdminIncomeCheque", err, httpOptions);
            });
        };

        $scope.issueTaxCheque = function (form) {
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
            $http.post("http://127.0.0.1/v1/financial/createAdminTaxCheque", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/financial/createAdminTaxCheque", err, httpOptions);
            });
        };

        $scope.report = function (id) {
            if (id) {
                $location.path('/ad-cheque-report').search({id: id});
            } else {
                $location.path('/ad-cheque-report').search({});
            }
        };


        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();