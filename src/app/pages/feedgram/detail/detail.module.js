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

        $scope.updateStar(3);

    }
})();

