(function () {
    'use strict';

    angular.module('BlurAdmin.pages.ad-loc', [])
        .config(routeConfig)
        .controller('adminLocCtrl', adminLocCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-loc', {
                url: '/ad-loc',
                templateUrl: 'app/pages/admin/location/list.html',
                controller: 'adminLocCtrl'
            });
    }

    function adminLocCtrl($scope, $filter, editableOptions, editableThemes, $rootScope, $state, $q, $http, localStorageService, $location, $uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;
        $scope.locs = [];


        $scope.initCtrl = function () {
            setTimeout(function () {
                initLocation();
            }, 700)
        };

        $scope.search = function (pagination, sort) {
            if (preventTwiceLoad) {
                preventTwiceLoad = false;
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "id": $location.search().id,
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'id'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/getCompanyLocations", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.locs = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/adminCompanyManagementRest/getCompanyLocations", err, httpOptions);
                });

        };

        function initLocation() {
            $scope.location = {
                id: null,
                title: null,
                address: null,
                point: null,
                isActive: true,
                companyId: $location.search().id
            };
        }

        $scope.opneModal = function (page, size, item, index, isDeleteModal) {
            if (!item){
                initLocation();
            } else {
                $scope.location = item;
            }
            $scope.index = index;
            var m = $uibModal.open({
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
            if (!isDeleteModal) {
                setTimeout(function () {
                    prepareMapForLocation();
                }, 700);
            }
        };

        var marker;

        function prepareMapForLocation() {
            var mapCanvas = document.getElementById('map');
            var myLatLng;
            if ($scope.location.point) {
                var loc = $scope.location.point.split(",");
                myLatLng = {lat: Number(loc[0]), lng: Number(loc[1])}
            } else {
                myLatLng = {lat: 35.747262, lng: 51.451300};
                $scope.location.point = myLatLng.lat + "," + myLatLng.lng;
            }
            var mapOptions = {
                center: new google.maps.LatLng(myLatLng),
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var map = new google.maps.Map(mapCanvas, mapOptions);
            marker = new google.maps.Marker({
                position: myLatLng,
                map: map
            });
            google.maps.event.addListener(map, 'click', function (event) {
                placeMarker(event.latLng);
            });

            function placeMarker(location) {
                marker.setMap(null);
                marker = new google.maps.Marker({
                    position: location,
                    map: map
                });
                $scope.location.point = location.lat() + "," + location.lng();
            }

            $('#map').parent().css('height', '400px');
        }

        $scope.saveOrUpdate = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/addOrUpdateLocation", $scope.location, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    if (data.data)
                        $scope.locs.push(data.data);
                    $uibModalStack.dismissAll();
                }).catch(function (err) {
                $rootScope.handleError($scope.location, "/adminCompanyManagementRest/addOrUpdateLocation", err, httpOptions);
            });
        };

        $scope.deleteLocation = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/deleteLocation", $scope.location, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    $scope.locs.splice($scope.index, 1);
                    $uibModalStack.dismissAll();
                }).catch(function (err) {
                $rootScope.handleError($scope.location, "/adminCompanyManagementRest/deleteLocation", err, httpOptions);
            });
        };

        $scope.gotToDepartments = function (loc) {
           $rootScope.LOC = loc;
           $location.path("/departments");
        }

    }
})();
