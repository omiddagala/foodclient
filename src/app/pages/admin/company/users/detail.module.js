(function () {
    'use strict';

    angular.module('BlurAdmin.pages.ad-co-detail', [])
        .config(routeConfig)
        .controller('adminCompanyDetailCtrl', adminCompanyDetailCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-co-detail', {
                url: '/ad-co-detail',
                templateUrl: 'app/pages/admin/company/users/detail.html'
            });
    }

    function adminCompanyDetailCtrl($scope, fileReader, $filter, $uibModal, $http, $rootScope,localStorageService, $location,$state, toastrConfig, toastr) {
        var id;
        var addressId = null;
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
                id = $location.search().id;
                startLoading();
                var token = localStorageService.get("my_access_token");
                var httpOptions = {
                    headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
                };
                $http.post("https://demoapi.karafeed.com/pepper/v1/adminEmployeeManagementRest/findById", id, httpOptions)
                    .then(function (data, status, headers, config) {
                        stopLoading();
                        $scope.restInfo = data.data;
                        prepareMapForLocation();
                    }).catch(function (err) {
                    $rootScope.handleError(id, "/adminEmployeeManagementRest/findById", err, httpOptions);
                });
            }, 1000)
        };

        var marker;

        function prepareMapForLocation() {
            var mapCanvas = document.getElementById('map');
            var myLatLng;
            if ($scope.restInfo && $scope.restInfo.address.point) {
                var loc = $scope.restInfo.address.point.split(",");
                myLatLng = {lat: Number(loc[0]), lng: Number(loc[1])}
            } else {
                myLatLng = {lat: 35.747262, lng: 51.451300};
            }
            var mapOptions = {
                center: new google.maps.LatLng(myLatLng),
                zoom: 9,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(mapCanvas, mapOptions);
            marker = new google.maps.Marker({
                position: myLatLng,
                map: map
            });

            $('#map').parent().css('height', '400px');
        }

       $scope.goBack = function () {
           $state.go("ad-co-users");
       }
    }
})();