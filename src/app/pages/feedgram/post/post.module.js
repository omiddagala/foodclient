/**
 * @author v.lugovsky
 * created on 25.02.2019
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.feedgram-post', [])
        .config(routeConfig)
        .controller('feedgramPostCtrl', feedgramPostCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('feedgram-post', {
                url: '/feedgram-post',
                templateUrl: 'app/pages/feedgram/post/post.html',
                title: 'فیدگرام',
                controller: feedgramPostCtrl
            });
    }

    function feedgramPostCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, $ionicModal,toastrConfig, toastr) {
        $rootScope.pageTitle = 'ثبت تجربه ها';
        $rootScope.currentMobileActiveMenu = "feedgram-post";
        $scope.postImage = "/assets/img/defaults/default-food.png";
        $ionicModal.fromTemplateUrl('app/pages/feedgram/post/select-resource.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function (modal) {
            $scope.selectModal = modal;
        });
        $ionicModal.fromTemplateUrl('app/pages/feedgram/post/post-modal.html', {
            scope: $scope,
            animation: 'slide-in-up',
        }).then(function (modal) {
            $scope.postModal = modal;
        });

        $scope.selectResource = function () {
            $scope.selectModal.show();
        };

        $scope.default = function(){
            $scope.selectModal.hide();
            $scope.postModal.show();
        };

        $scope.postFeed = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "foodId": 32,
                "image": null,
                "description": $scope.desc
            };
            $http.post("http://127.0.0.1/v1/feedgram/employee/post", params, httpOptions)
                .success(function (data, status, headers, config) {
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                    $scope.postModal.hide();
                }).catch(function (err) {
                $rootScope.handleError(params, "/feedgram/employee/post", err, httpOptions);
            });
        };

    }
})();

