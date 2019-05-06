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
        $scope.page = 0;
        $scope.size = 12;
        $scope.colleagues = [[]];
        var j = 0;

        setTimeout(function () {
            $scope.getAllEmployees('1');
        }, 700);

        $scope.getAllEmployees = function (s) {
            startLoading();
            setSelectedTab(s);
            reset();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "value": "",
                "pageableDTO": {
                    "direction": 'ASC',
                    "page": $scope.page,
                    "size": $scope.size,
                    "sortBy": 'id'
                }
            };
            $http.post("http://127.0.0.1:9000/v1/feedgram/employee/getCompanyEmployeeList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.colleagues = data;
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/feedgram/employee/getCompanyEmployeeList", err, httpOptions);
            });
        };

        $scope.follow = function (id) {
            startLoading();
            reset();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": id
            };
            $http.post("http://127.0.0.1:9000/v1/feedgram/employee/followPage", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/feedgram/employee/followPage", err, httpOptions);
            });
        };

        $scope.getFollowers = function (s) {
            startLoading();
            setSelectedTab(s);
            reset();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "value": "",
                "pageableDTO": {
                    "direction": 'ASC',
                    "page": $scope.page,
                    "size": $scope.size,
                    "sortBy": 'id'
                }
            };
            $http.post("http://127.0.0.1:9000/v1/feedgram/employee/getFollowerList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    for (var i = 0; i < data.length; i++) {
                        $scope.colleagues.push(data[i].follower);
                    }
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/feedgram/employee/getFollowerList", err, httpOptions);
            });
        };

        $scope.getFollowings = function (s) {
            startLoading();
            setSelectedTab(s);
            reset();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "value": "",
                "pageableDTO": {
                    "direction": 'ASC',
                    "page": $scope.page,
                    "size": $scope.size,
                    "sortBy": 'id'
                }
            };
            $http.post("http://127.0.0.1:9000/v1/feedgram/employee/getFollowingList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    for (var i = 0; i < data.length; i++) {
                        $scope.colleagues.push(data[i].following);
                    }
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/feedgram/employee/getFollowingList", err, httpOptions);
            });
        };

        function reset() {
            $scope.page = 0;
            $scope.size = 12;
            $scope.colleagues = [[]];
            j = 0;
        }

        function setSelectedTab(selected) {
            $(".tab-item").each(function () {
                if ($(this).hasClass("active")) {
                    $(this).toggleClass("active");
                }
            });
            $("#" + selected).toggleClass("active");
        }

        $scope.goToProfile = function () {
            $state.go("feedgram-profile");
        }

    }
})();

