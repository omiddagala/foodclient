(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-detail', [])
        .config(routeConfig)
        .controller('companyDetailCtrl', companyDetailCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-detail', {
                url: '/co-detail',
                templateUrl: 'app/pages/admin/company/detail.html'
            });
    }

    function companyDetailCtrl($scope, fileReader, $filter, $uibModal, $http,$rootScope, localStorageService, $location,$state, toastrConfig, toastr) {
        var id;
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
                    $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/findById", id, httpOptions)
                        .then(function (data, status, headers, config) {
                            stopLoading();
                            $scope.restInfo = data.data;
                            $scope.selectedRest = data.data.restaurants;
                        }).catch(function (err) {
                        $rootScope.handleError(id, "/adminCompanyManagementRest/findById", err, httpOptions);
                    });
                } else {
                    $scope.restInfo = {
                        companyType:"GOLDEN",
                        location : {
                            point : null
                        },
                        minExtraHourForPreOrder: 0
                    };
                }
                $('#pass + .glyphicon').on('click', function() {
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

        $scope.saveOrUpdate = function (form) {
            $scope.submitted = true;
            if (!form.$valid){
                return;
            }
            startLoading();
            if (!$scope.restInfo.id) {
                $scope.restInfo.userName = $("#username").val().toLowerCase();
                $scope.restInfo.password = $("#pass").val();
                if (!$rootScope.isValid($scope.restInfo.userName)){
                    stopLoading();
                    showMessage(toastrConfig,toastr,"خطا","لطفا در فیلد نام کاربری از کاراکترهای مجاز استفاده کنید","error");
                    return;
                }
            }
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/addOrUpdateCompany", $scope.restInfo, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.restInfo = data.data;
                    $location.url($location.path());
                    $location.search({id: $scope.restInfo.id});
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $rootScope.handleError($scope.restInfo, "/adminCompanyManagementRest/addOrUpdateCompany", err, httpOptions);
            });

        };

        var delayTimer;
        $scope.searchRestaurants = function (s) {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(function () {
                startLoading();
                var token = localStorageService.get("my_access_token");
                var httpOptions = {
                    headers: { 'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token }
                };
                var param = {
                    "value": s,
                    "pageableDTO": {
                        "direction": 'ASC',
                        "page": 0,
                        "size": 15,
                        "sortBy": 'name'
                    }
                };
                $http.post("http://127.0.0.1:9000/v1/adminRestaurantManagementRest/findByName",
                    param,
                    httpOptions)
                    .success(function (data, status, headers, config) {
                        $scope.rests = data.list;
                        stopLoading();
                    }).catch(function (err) {
                    stopLoading();
                    if (err.status === 401) {
                        $rootScope.logout();
                    }
                });
            }, 1000);
        };
        $scope.restChanged = function (a) {
            $scope.restInfo.rests = a;
            $scope.restInfo.rests = jQuery.map($scope.restInfo.rests, function (v, i) {
                return v.id;
            });
        };

        $scope.setRestrictionType = function (w) {
            $scope.restInfo.restrictionType = w;
        };

        $scope.setForceVAT = function (v) {
            $scope.restInfo.forceVAT = v;
        };

        $scope.removePicture = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/removeProfileImage", $scope.restInfo.id, httpOptions)
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
            $http.post("http://127.0.0.1:9000/v1/adminCompanyManagementRest/uploadProfileImage", params, httpOptions)
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
            $state.go("co-list");
        }
    }
})();
