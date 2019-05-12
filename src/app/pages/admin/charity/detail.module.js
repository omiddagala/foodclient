(function () {
    'use strict';

    angular.module('BlurAdmin.pages.ad-charity-detail', [])
        .config(routeConfig)
        .controller('adminCharityDetailCtrl', adminCharityDetailCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('ad-charity-detail', {
                url: '/ad-charity-detail',
                templateUrl: 'app/pages/admin/charity/detail.html'
            });
    }

    function adminCharityDetailCtrl($scope, fileReader, $filter, $uibModal, $http, localStorageService, $location,$state, toastrConfig, toastr,$rootScope) {
        var id;
        var addressId = null;
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
                    $http.post("http://127.0.0.1:9000/v1/adminCharityManagementRest/findById", id, httpOptions)
                        .then(function (data, status, headers, config) {
                            stopLoading();
                            $scope.restInfo = data.data;
                            addressId = $scope.restInfo.address ? $scope.restInfo.address.id : null;
                            prepareMapForLocation();
                        }).catch(function (err) {
                        $rootScope.handleError(id, "/adminCharityManagementRest/findById", err, httpOptions);
                    });
                } else {
                    $scope.restInfo = {
                        address : {
                            point : null
                        }
                    };
                    prepareMapForLocation();
                }
            }, 1000)
        };

        $scope.saveOrUpdate = function (form) {
            $scope.submitted = true;
            if (!form.$valid){
                return;
            }
            startLoading();
            var param = {
                "address": {
                    "address": $scope.restInfo.address.address, //$('#adr').val(),
                    "id": addressId,
                    "mobile": $scope.restInfo.address.mobile, // $('#mobile').val(),
                    "phone": $scope.restInfo.address.phone, // $('#phone').val(),
                    "point": marker.getPosition().lat() + "," + marker.getPosition().lng()
                },
                "name": $scope.restInfo.name, // $('#name').val(),
                "id": id,
                "password": $scope.restInfo.user.password, // $('#pass').val(),
                "userName": $scope.restInfo.userName.toLowerCase(), // $('#username').val()
            };

            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCharityManagementRest/addOrUpdateCharity", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.restInfo = data.data;
                    $location.url($location.path());
                    $location.search({id: $scope.restInfo.id});
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $rootScope.handleError(param, "/adminCharityManagementRest/addOrUpdateCharity", err, httpOptions);
            });

        };

        var marker;

        function prepareMapForLocation() {
            var mapCanvas = document.getElementById('map');
            var myLatLng;
            if ($scope.restInfo && $scope.restInfo.address.point){
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

        $scope.removePicture = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCharityManagementRest/removeProfileImage", $scope.restInfo.id, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    $scope.restInfo.imageAddress = data;
                }).catch(function (err) {
                stopLoading();
                // menuService.stopLoading();
                // menuService.myHandleError(err);
            });
        };

        $scope.uploadPicture = function () {
            var fileInput = document.getElementById('uploadFile');
            $(fileInput).off('change');
            $(fileInput).on('change',  handleFiles);
            // fileInput.addEventListener("change", handleFiles, false);

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
            $http.post("http://127.0.0.1:9000/v1/adminCharityManagementRest/uploadProfileImage", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.restInfo.imageAddress = data;
                    stopLoading();
                }).catch(function (err) {
                stopLoading();
                // menuService.stopLoading();
                // menuService.myHandleError(err);
            });
        }

        $scope.goBack = function () {
            $state.go("ad-charity");
        }
    }
})();