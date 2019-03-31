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

        $scope.goToDetail = function () {
            $state.go("feedgram-detail");
        }

    }
})();

