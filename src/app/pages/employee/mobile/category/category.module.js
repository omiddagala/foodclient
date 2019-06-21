/**
 * @author v.lugovsky
 * created on 25.02.2019
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.category', [])
        .config(routeConfig)
        .controller('categoryCtrl', categoryCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('category', {
                url: '/category',
                templateUrl: 'app/pages/employee/mobile/category/category.html',
                title: 'دسته بندی غذا',
                controller: categoryCtrl
            });
    }

    function categoryCtrl($scope, $compile, $uibModal, baProgressModal, $http, localStorageService, $parse, $rootScope) {
        $rootScope.currentMobileActiveMenu = "category";
        $rootScope.pageTitle = 'دسته بندی غذا';
        $rootScope.selectedCategory = '';
        $scope.categorys = {};
        $scope.foodTypeChanged = function (t) {
            $rootScope.selectedCategory = t;
            var home = window.location.href.replace("category", "home");
            home = replaceUrlParam(home, "t", t);
            window.location.href = home;
            $rootScope.currentActiveMenu = "home";
            $rootScope.currentMobileActiveMenu = "home";
        }; 
    }
})();

