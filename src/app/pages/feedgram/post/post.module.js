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

    function feedgramPostCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope, $state) {
        $rootScope.pageTitle = 'ثبت تجربه ها';
        $rootScope.currentMobileActiveMenu = "feedgram-post";


    }
})();

