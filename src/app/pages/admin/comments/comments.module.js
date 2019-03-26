(function () {
    'use strict';

    angular.module('BlurAdmin.pages.comments', [])
        .config(routeConfig)
        .controller('commentsCtrl', commentsCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('comments', {
                url: '/comments',
                templateUrl: 'app/pages/admin/comments/comments.html',
                controller: 'commentsCtrl'
            });
    }

    function commentsCtrl($scope, $filter, editableOptions, editableThemes,$rootScope, $state, $q, $http, localStorageService, $location, $uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;
        $scope.commentType = "F";

        $scope.initCtrl = function () {
            setTimeout(function () {
                $('.mycontent').scroll(function () {
                    if ($('.mycontent').scrollTop() >= 50) {
                        $('.page-top').addClass('scrolled');
                        $('.menu-top').addClass('scrolled');
                        $('#backTop').fadeIn(500);
                    } else {
                        $('.page-top').removeClass('scrolled');
                        $('.menu-top').removeClass('scrolled');
                        $('#backTop').fadeOut(500);
                    }
                });
                $('#backTop').click(function () {
                    $('.mycontent').animate({scrollTop: 0}, 800);
                    return false;
                });
            }, 1000)
        };

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
                direction: sort.reverse ? 'DESC' : 'ASC',
                page: pagination.start / pagination.number,
                size: pagination.number,
                sortBy: sort.predicate ? sort.predicate : 'date'
            };
            var url;
            if ($scope.commentType === "F"){
                url = "https://demoapi.karafeed.com/pepper/v1/adminCommentManagementRest/getNewComments";
            } else {
                url = "https://demoapi.karafeed.com/pepper/v1/adminCommentManagementRest/getNewCommentsOfRestaurant";
            }
            return $http.post(url, param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.comments = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, url, err, httpOptions);
                });
        };
        $scope.openModal = function (page, size, id, index) {
            $scope.commentId = id;
            $scope.commentIndex = index;
            var m =$uibModal.open({
                animation: true,
                templateUrl: page,
                size: size,
                scope: $scope
            });

            m.rendered.then(function (e) {
                if ($('.modal-dialog .modal-content .modal-content.modal-fit').length > 0) {
                    $('.modal-dialog').addClass('fit-height-imp');
                }                
            }); 
        };

        $scope.approve = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var url;
            if ($scope.commentType === "F"){
                url = "https://demoapi.karafeed.com/pepper/v1/adminCommentManagementRest/approve";
            } else {
                url = "https://demoapi.karafeed.com/pepper/v1/adminCommentManagementRest/approveRestaurantComment";
            }
            $http.post(url, $scope.commentId, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.comments.splice($scope.commentIndex, 1);
                    if ($scope.comments.length === 0){
                        $scope.$broadcast('refreshMyTable');
                    }
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError($scope.commentId, url, err, httpOptions);
            });
        };

        $scope.rejectC = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var url;
            if ($scope.commentType === "F"){
                url = "https://demoapi.karafeed.com/pepper/v1/adminCommentManagementRest/reject";
            } else {
                url = "https://demoapi.karafeed.com/pepper/v1/adminCommentManagementRest/rejectRestaurantComment";
            }
            $http.post(url, $scope.commentId, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.comments.splice($scope.commentIndex, 1);
                    if ($scope.comments.length === 0){
                        $scope.$broadcast('refreshMyTable');
                    }
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError($scope.commentId, url, err, httpOptions);
            });
        };
        $scope.toggleSidebar = function (e) {
            // console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        };
        $scope.setCommentType = function (t) {
            $scope.commentType = t;
            $scope.$broadcast('refreshMyTable');
        }

    }
})();