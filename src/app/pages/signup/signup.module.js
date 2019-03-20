(function () {
    'use strict';

    angular.module('BlurAdmin.pages.signup', [])
        .config(routeConfig)
        .controller('signupCtrl', signupCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('signup', {
                url: '/signup',
                templateUrl: 'app/pages/signup/signup.html'
            });
    }

    function signupCtrl($scope, $uibModal, baProgressModal,$http,localStorageService) {


    }
})();