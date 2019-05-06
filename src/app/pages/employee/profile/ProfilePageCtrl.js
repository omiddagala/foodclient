/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
    'use strict';

    angular.module('BlurAdmin.pages.profile')
        .controller('ProfilePageCtrl', ProfilePageCtrl);

    /** @ngInject */
    function ProfilePageCtrl($scope, fileReader, $filter, $http, localStorageService, $state, $rootScope, toastrConfig, toastr) {
        $rootScope.currentMobileActiveMenu = "profile";

        $rootScope.pageTitle = 'حساب کاربری';
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
                $http.post("http://127.0.0.1:9000/v1/employee/getProfileData", null, httpOptions)
                    .success(function (data, status, headers, config) {
                        $scope.employee = data;
                        // console.log(data);
                        if ($scope.employee.employeeInfo === null){
                            $scope.employee.employeeInfo = {
                                gender: "FEMALE"
                            }
                        }
                        stopLoading();
                    }).catch(function (err) {
                    $rootScope.handleError(null, "/employee/getProfileData", err, httpOptions);
                });
            }, 1000)
        };  

        // $scope.onFileSelect = function ($files) {
        //   alert($files);
        // };

        $scope.removePicture = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/employee/removeProfileImage", null, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    $scope.employee.imageAddress = data;
                    $rootScope.myProfilePic = "assets/img/defaults/default-menu.png";
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError(null, "/employee/removeProfileImage", err, httpOptions);
            });
        };

        $scope.uploadPicture = function () {
            var fileInput = document.getElementById('uploadFile');
            $(fileInput).off('change');
            $(fileInput).on('change',  handleFiles);
            // fileInput.addEventListener("change", handleFiles, false);
            // console.log(fileInput);

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
                "id": 0,
                "image": img.substring(img.indexOf(",") + 1),
                "postfix": postfix
            };
            $http.post("http://127.0.0.1:9000/v1/employee/uploadProfileImage", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $rootScope.myProfilePic = data;
                    $scope.employee.imageAddress = data;
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/uploadProfileImage", err, httpOptions);
            });
        }

        $scope.saveOrUpdate = function (form) {
            $scope.submitted = true;
            if (!form.$valid) {
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/employee/edit", $scope.employee, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    $scope.submitted = false;
                }).catch(function (err) {
                $rootScope.handleError($scope.employee, "/employee/edit", err, httpOptions);
            });
        };

        $scope.sexChanged = function (s) {
            $scope.sex = s;
        };

        $scope.isNotNumber = function (a) {
            return a && !($.isNumeric(a));
        }
    }

})();
