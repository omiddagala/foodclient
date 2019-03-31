/**
 * @author v.lugovsky
 * created on 25.02.2019
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.feedgram-co', [])
        .config(routeConfig)
        .controller('feedgramCoCtrl', feedgramCoCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('feedgram-co', {
                url: '/feedgram-co',
                templateUrl: 'app/pages/feedgram/co/co.html',
                title: 'فیدگرام',
                controller: feedgramCoCtrl
            });
    }

    function feedgramCoCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, $state) {
        $rootScope.pageTitle = 'همکاران';
        $rootScope.currentMobileActiveMenu = "feedgram-co";

        $scope.goToProfile = function () {
            $state.go("feedgram-profile");
        }

    }
})();

