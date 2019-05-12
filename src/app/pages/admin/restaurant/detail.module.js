(function () {
    'use strict';

    angular.module('BlurAdmin.pages.rest-detail', [])
        .config(routeConfig)
        .controller('restaurantDetailCtrl', restaurantDetailCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('rest-detail', {
                url: '/rest-detail',
                templateUrl: 'app/pages/admin/restaurant/detail.html'
            });
    }

    function restaurantDetailCtrl($scope, fileReader, $filter, $uibModal, $http, $rootScope, localStorageService, $location, $state, toastrConfig, toastr) {
        var id;
        $scope.selectedType = [];
        $scope.initCtrl = function () {
            $scope.submitted = false;
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
                if (id) {
                    startLoading();
                    var token = localStorageService.get("my_access_token");
                    var httpOptions = {
                        headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
                    };
                    $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/findById", id, httpOptions)
                        .then(function (data, status, headers, config) {
                            stopLoading();
                            $scope.restInfo = data.data.restaurant;
                            $scope.selectedType = $rootScope.getRestaurantTypeByNames($scope.restInfo.restaurantType);
                            prepareMapForDeliveryZone(data.data.points);
                            prepareMapForLocation();
                            initClocks();
                        }).catch(function (err) {
                        $rootScope.handleError(id, "/adminRestaurantManagementRest/findById", err, httpOptions);
                    });
                } else {
                    $scope.restInfo = {
                        deliveryPrice: 0,
                        address: {
                        },
                        restaurantInfo:{
                        }
                    };
                    prepareMapForDeliveryZone(null);
                    prepareMapForLocation();
                    initClocks();
                }
                $('#pass + .glyphicon').on('click', function () {
                    $(this).toggleClass('glyphicon-eye-close').toggleClass('glyphicon-eye-open'); // toggle our classes for the eye icon
                    var x = document.getElementById("pass");
                    if (x.type === "password") {
                        x.type = "text";
                    } else {
                        x.type = "password";
                    }
                });
            }, 1000)
        };
        $scope.typeChanged = function (a) {
            $scope.selectedType = a;
        };

        $scope.saveOrUpdate = function (form) {
            $scope.submitted = true;
            if (!form.$valid) {
                return;
            }
            startLoading();
            var path = [];
            var pointArray = poly.getPath().getArray();
            if (pointArray.length !== 0) {
                for (var i = 0; i < pointArray.length; i++) {
                    path.push({
                        x: pointArray[i].lat(),
                        y: pointArray[i].lng()
                    })
                }
                if (path.length > 0) {
                    path.push(path[0]);
                }
            }
            if (!$scope.restInfo.restaurantInfo){
                $scope.restInfo.restaurantInfo = {
                    endTimeOfWork : null,
                    startTimeOfWork: null,
                    description: null
                }
            }
            $scope.restInfo.restaurantInfo.endTimeOfWork = Number($('#toTime').val().replace(':', ''));
            $scope.restInfo.restaurantInfo.startTimeOfWork = Number($('#fromTime').val().replace(':', ''));
            $scope.restInfo.address.point = marker.getPosition().lat() + "," + marker.getPosition().lng();
            $scope.restInfo.serviceAria = {
                points: path.length === 0 ? null : path
            };
            var selectedTypes = jQuery.map($scope.selectedType, function(v, i){
                return v.value;
            });
            var selectedTypesInFarsi = jQuery.map($scope.selectedType, function(v, i){
                return v.label;
            });
            $scope.restInfo.restaurantType = selectedTypes.sort().join(",");
            $scope.restInfo.restaurantTypeInFarsi = selectedTypesInFarsi.join(",");
            if (!$scope.restInfo.id) {
                $scope.restInfo.username = $("#username").val().toLowerCase();
                $scope.restInfo.password = $("#pass").val();
                if (!$rootScope.isValid($scope.restInfo.username)){
                    stopLoading();
                    showMessage(toastrConfig,toastr,"خطا","لطفا در فیلد نام کاربری از کاراکترهای مجاز استفاده کنید","error");
                    return;
                }
            }
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/addOrUpdate", $scope.restInfo, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.restInfo = data.data.restaurant;
                    $location.url($location.path());
                    $location.search({id: $scope.restInfo.id});
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError($scope.restInfo, "/adminRestaurantManagementRest/addOrUpdate", err, httpOptions);
            });

        };

        $scope.setHasTax = function (hasTax) {
            $scope.restInfo.hasTax = hasTax;
        };

        $scope.setWorkAtVacation = function (w) {
            $scope.restInfo.workAtVacation = w;
        };

        $scope.setRestaurantIsKarafeed = function(k){
            $scope.restInfo.restaurantLevel = k
        };

        var poly;

        function prepareMapForDeliveryZone(points) {
            var mapCanvas = document.getElementById('google-maps');
            var mapOptions = {
                center: new google.maps.LatLng(35.747262, 51.451300),
                zoom: 14,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                scaleControl: true
            };
            var map = new google.maps.Map(mapCanvas, mapOptions);
            var isClosed = false;
            var paths = [];
            if (points) {
                points = points.split("((");
                points = points[1].split("))");
                points = points[0].split(",");
                for (var i = 0; i < points.length; i++) {
                    var point = points[i].split(" ");
                    paths.push({
                        lat: Number(point[0]),
                        lng: Number(point[1])
                    })
                }
            }

            poly = new google.maps.Polyline({
                map: map,
                path: paths,
                strokeColor: "#FF0000",
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            google.maps.event.addListener(map, 'click', function (clickEvent) {
                if (isClosed)
                    return;
                var markerIndex = poly.getPath().length;
                var isFirstMarker = markerIndex === 0;
                var marker = new google.maps.Marker({map: map, position: clickEvent.latLng, draggable: true});
                if (isFirstMarker) {
                    google.maps.event.addListener(marker, 'click', function () {
                        if (isClosed)
                            return;
                        var path = poly.getPath();
                        poly.setMap(null);
                        poly = new google.maps.Polygon({
                            map: map,
                            path: path,
                            strokeColor: "#FF0000",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                            fillColor: "#FF0000",
                            fillOpacity: 0.35
                        });
                        isClosed = true;
                    });
                }
                google.maps.event.addListener(marker, 'drag', function (dragEvent) {
                    poly.getPath().setAt(markerIndex, dragEvent.latLng);
                });
                poly.getPath().push(clickEvent.latLng);
            });
        }

        $scope.clearZoneMap = function () {
            poly.setMap(null);
            prepareMapForDeliveryZone(null);
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
                $scope.restInfo.address.point = location.lat() + "," + location.lng();
            }

            $('#map').parent().css('height', '400px');
        }

        function initClocks() {
            var fromTime = $('#fromTime');
            fromTime.clockTimePicker({
                duration: false,
                durationNegative: false,
                precision: 5,
                onAdjust: function (newVal, oldVal) {
                }
            });
            var toTime = $('#toTime');
            toTime.clockTimePicker({
                duration: false,
                durationNegative: false,
                precision: 5,
                onAdjust: function (newVal, oldVal) {
                }
            });
            if ($scope.restInfo && $scope.restInfo.restaurantInfo.startTimeOfWork) {
                fromTime.val(formatMyTime($scope.restInfo.restaurantInfo.startTimeOfWork));
            }
            if ($scope.restInfo && $scope.restInfo.restaurantInfo.endTimeOfWork) {
                toTime.val(formatMyTime($scope.restInfo.restaurantInfo.endTimeOfWork));
            }
        }

        function formatMyTime(d) {
            var rt;
            switch (d.toString().length) {
                case 1:
                    rt = "000" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 2:
                    rt = "00" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 3:
                    rt = "0" + d;
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
                case 4:
                    rt = d.toString();
                    return [rt.slice(0, 2), ':', rt.slice(2)].join('');
            }
        }

        $scope.removePicture = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/removeProfileImage", $scope.restInfo.id, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    $scope.restInfo.imageAddress = data;
                }).catch(function (err) {
                $rootScope.handleError($scope.restInfo.id, "/adminRestaurantManagementRest/removeProfileImage", err, httpOptions);
            });
        };

        $scope.uploadPicture = function () {
            var fileInput = document.getElementById('uploadFile');
            //fileInput.addEventListener("change", handleFiles, false);
            //vahid seraj updated code (1397.10.03)
            $(fileInput).off('change');
            $(fileInput).on('change', handleFiles);

            function handleFiles() {
                var img = new Image();
                var _URL = window.URL || window.webkitURL;
                var file = this.files[0];
                if (!file)
                    return;
                if(!file.type || $.inArray(file.type.substr(file.type.indexOf("/") + 1), ['png','jpg','jpeg']) === -1) {
                    showMessage(toastrConfig, toastr, "خطا", "لطفا فایل عکس آپلود کنید", "error");
                    return;
                }
                startLoading();
                img.onload = function () {
                    if (this.width > 1600){
                        showMessage(toastrConfig, toastr, "خطا", "عرض عکس باید کمتر از ۱۶۰۰ پیکسل باشد", "error");
                        stopLoading();
                        return;
                    }
                    if (this.height>1600){
                        showMessage(toastrConfig, toastr, "خطا", "ارتفاع عکس باید کمتر از ۱۶۰۰ پیکسل باشد", "error");
                        stopLoading();
                        return;
                    }
                    if (!(this.width > this.height)){
                        showMessage(toastrConfig, toastr, "خطا", "لطفا عکس با قالب مستطیلی انتخاب کنید", "error");
                        stopLoading();
                        return;
                    }
                    canvasResize(file, {
                        width: 300,
                        height: 0,
                        crop: false,
                        quality: 80,
                        //rotate: 90,
                        callback: function (data, width, height) {
                            if ((4 * Math.ceil((data.length / 3))*0.5624896334383812)/1000 > 600){
                                showMessage(toastrConfig, toastr, "خطا", "حجم فایل زیاد است", "error");
                                stopLoading();
                                return;
                            }
                            uploadPic(data, data.substring(data.indexOf("/") + 1, data.indexOf(";")));
                        }
                    });
                };
                img.src = _URL.createObjectURL(file);
            }

            fileInput.click();
        };

        function uploadPic(img, postfix) {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": $scope.restInfo.id,
                "image": img.substring(img.indexOf(",") + 1),
                "postfix": postfix
            };
            $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/uploadProfileImage", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.restInfo.imageAddress = data;
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/adminRestaurantManagementRest/uploadProfileImage", err, httpOptions);
            });
        }

        $scope.goBack = function () {
            $state.go("rest-list");
        }
    }
})();