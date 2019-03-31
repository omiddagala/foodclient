/**
 * @author v.lugovsky
 * created on 25.02.2019
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.feedgram-profile', [])
        .config(routeConfig)
        .controller('feedgramProfileCtrl', feedgramProfileCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('feedgram-profile', {
                url: '/feedgram-profile',
                templateUrl: 'app/pages/feedgram/profile/profile.html',
                title: 'فیدگرام',
                controller: feedgramProfileCtrl
            });
    }

    function feedgramProfileCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, $state) {
        $rootScope.pageTitle = 'پروفایل';
        $rootScope.currentMobileActiveMenu = "feedgram-profile";

    }
})();

