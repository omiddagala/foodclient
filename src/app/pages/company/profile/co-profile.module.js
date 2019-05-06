(function () {
    'use strict';

    angular.module('BlurAdmin.pages.company-profile', [])
        .config(routeConfig)
        .controller('companyProfileCtrl', companyProfileCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-profile', {
                url: '/co-profile',
                templateUrl: 'app/pages/company/profile/co-profile.html'
            });
    }

    function companyProfileCtrl($scope, fileReader, $filter, $uibModal, $http, localStorageService, $state,$rootScope, toastrConfig, toastr) {

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
                startLoading();
                var token = localStorageService.get("my_access_token");
                var httpOptions = {
                    headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
                };
                $http.post("http://127.0.0.1/v1/company/getProfileData", null, httpOptions)
                    .then(function (data, status, headers, config) {
                        stopLoading();
                        $scope.restInfo = data.data;
                        if (!$scope.restInfo.imageAddress)
                            $scope.restInfo.imageAddress = 'assets/img/defaults/default-company.png';
                        prepareMapForLocation();
                    }).catch(function (err) {
                    $rootScope.handleError(null, "/company/getProfileData", err, httpOptions);
                });
            }, 1000)
        };

        $scope.removePicture = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1/v1/company/removeProfileImage", null, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    $scope.restInfo.imageAddress = data;
                    $rootScope.myProfilePic = "assets/img/defaults/default-menu.png";
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $rootScope.handleError(null, "/company/removeProfileImage", err, httpOptions);
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
            $http.post("http://127.0.0.1/v1/company/uploadProfileImage", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.restInfo.imageAddress = data;
                    $rootScope.myProfilePic = data;
                    stopLoading();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $rootScope.handleError(params, "/company/uploadProfileImage", err, httpOptions);
            });
        }

        $scope.saveOrUpdate = function (form) {
            $scope.submitted = true;
            if (!form.$valid){
                return;
            }
        };

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
            var marker = new google.maps.Marker({
                position: myLatLng,
                map: map
            });
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

        $scope.goBack = function () {
            $state.go("co-active-users");
        };

        $scope.switches = [true, true, false, true, true, false];
    }
})();