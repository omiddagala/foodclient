/**
 * @author v.lugovsky
 * created on 25.02.2019
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.feedgram-list', [])
        .config(routeConfig)
        .controller('feedgramListCtrl', feedgramListCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('feedgram-list', {
                url: '/feedgram-list',
                templateUrl: 'app/pages/feedgram/list/list.html',
                title: 'فیدگرام',
                controller: feedgramListCtrl
            });
    }

    function feedgramListCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, $state) {
        $rootScope.pageTitle = 'فیدگرام';
        $rootScope.currentMobileActiveMenu = "feedgram";
        $scope.page = 0;
        $scope.size = 10;

        setTimeout(function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
            };
            var params = {
                "id": "57",
                "pageableDTO": {
                    "direction": 'ASC',
                    "page": $scope.page,
                    "size": $scope.size,
                    "sortBy": 'id'
                }
            };
            $http.post("http://127.0.0.1:9000/v1/feedgram/employee/getPostList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.posts = data.data;
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/feedgram/employee/post", err, httpOptions);
            });
        },700);

        $scope.goToDetail = function () {
            $state.go("feedgram-detail");
        }

    }
})();

