(function () {
    'use strict';

    angular.module('BlurAdmin.pages.feedbacks', [])
        .config(routeConfig)
        .controller('feedbacksCtrl', feedbacksCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('feedbacks', {
                url: '/feedbacks',
                templateUrl: 'app/pages/admin/feedbacks/list.html',
                controller: 'feedbacksCtrl'
            });
    }

    function feedbacksCtrl($scope, $filter, editableOptions, editableThemes,$rootScope, $state, $q, $http, localStorageService, $location, $uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;

        $scope.search = function (pagination, sort) {
            if (preventTwiceLoad){
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                pageableDTO: {
                    direction: sort.reverse ? 'DESC' : 'ASC',
                    page: pagination.start / pagination.number,
                    size: pagination.number,
                    sortBy: sort.predicate ? sort.predicate : 'createDate'
                },
                status: "NEW"
            };
            return $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/getFeedbacks", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.feedbacks = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/getFeedbacks", err, httpOptions);
                });
        };

        $scope.toggleSidebar = function (e) {
            // console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        };

    }
})();