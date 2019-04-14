/**
 * @author v.lugovsky
 * created on 25.02.2019
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.feedgram-detail', [])
        .config(routeConfig)
        .controller('feedgramDetailCtrl', feedgramDetailCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('feedgram-detail', {
                url: '/feedgram-detail',
                templateUrl: 'app/pages/feedgram/detail/detail.html',
                title: 'فیدگرام',
                controller: feedgramDetailCtrl
            });
    }

    function feedgramDetailCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, toastrConfig, toastr, $location) {
        $rootScope.pageTitle = 'جزییات';
        $rootScope.currentMobileActiveMenu = "feedgram";

        setTimeout(function () {
            $scope.loadDetail();
        },700);

        $scope.loadDetail = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": $location.search().id
            };
            $http.post("http://127.0.0.1:9000/v1/feedgram/employee/getPostDetails", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.detail = data;
                    $scope.updateStar(data.food.rateCount);
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/feedgram/employee/getPostDetails", err, httpOptions);
            });
        };

        $scope.showTab = function (e) {
            var thisTab = $(e.currentTarget);
            var tabArrow = $(thisTab).find('.tab-arrow');
            if ($(tabArrow).hasClass('rotate')) {
                tabArrow.removeClass('rotate');
            } else {
                tabArrow.addClass('rotate');
            }
            thisTab.next().slideToggle(500);

        };

        $scope.updateStar = function (s) {
            $scope.stars = [];
            for (var i = 0; i < 5; i++) {
                $scope.stars.push({
                    filled: i < s
                });
            }
        };

    }
})();

