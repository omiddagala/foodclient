(function () {
    'use strict';

    angular.module('BlurAdmin.pages.admin-fooddetail', [])
        .config(routeConfig)
        .controller('adminFooddetailCtrl', adminFooddetailCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('admin-fooddetail', {
                url: '/admin-fooddetail',
                templateUrl: 'app/pages/admin/restaurant/fooddetail/detail.html',
                controller: 'adminFooddetailCtrl'
            });
    }

    function adminFooddetailCtrl($scope, $filter, editableOptions, editableThemes, $location, $state, $http, $rootScope, localStorageService, toastrConfig, toastr) {
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
            }, 1000);
            $scope.foodid = $location.search().foodid;
            // in add food that food.restaurant.restaurantLevel is not available
            $scope.restaurantLevel = $location.search().l;
            if ($scope.foodid) {
                startLoading();
                var token = localStorageService.get("my_access_token");
                var httpOptions = {
                    headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
                };
                return $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/getFoodById", {id: $scope.foodid}, httpOptions)
                    .then(function (data, status, headers, config) {
                        $scope.food = data.data;
                        stopLoading();
                    }).catch(function (err) {
                        $rootScope.handleError($scope.foodid, "/adminRestaurantManagementRest/getFoodById", err, httpOptions);
                    });
            } else {
                $scope.food = {
                    id: null,
                    name: null,
                    foodType: 'IRANIAN',
                    mealAverageCalorie: 0,
                    availableDates: [],
                    price: {
                        foodPrice: 0,
                        containerPrice: 0,
                        dailyDiscountRate: 0,
                        oneDayPreOrderDiscountRate: 0,
                    },
                    restaurant: {
                        id : $location.search().id
                    }
                }
            }
        };
        $scope.saveOrUpdateFood = function (form) {
            $scope.submitted = true;
            if (!form.$valid) {
                return;
            }
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            return $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/addFood", $scope.food, httpOptions)
                .then(function (data, status, headers, config) {
                    if (!$scope.foodid)
                        $scope.food = data.data;
                    $location.search('foodid', $scope.food.id);
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError($scope.food, "/adminRestaurantManagementRest/addFood", err, httpOptions);
                });
        };

        $scope.saveOrUpdateAvailableDate = function (index, dayId) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var dayOfWeek = $('#dayOfWeek-' + index).next().find('select').val();
            dayOfWeek = dayOfWeek.replace('number:', '');
            var count = $('#count-' + index).next().find('input').val();
            var param = {
                count: count,
                dayOfWeek: Number(dayOfWeek),
                endTime: $('#to-' + index).val().replace(':', ''),
                foodId: $scope.food.id,
                id: dayId,
                startTime: $('#from-' + index).val().replace(':', '')
            };
            return $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/addFoodAvailableDate", param, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.food.availableDates = data.data;
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    setTimeout(function () {
                        $('#edit-' + index).click();
                    }, 100);
                    $rootScope.handleError(param, "/adminRestaurantManagementRest/addFoodAvailableDate", err, httpOptions);
                });
        };

        $scope.days = [
            {value: 6, text: 'شنبه'},
            {value: 0, text: 'یکشنبه'},
            {value: 1, text: 'دوشنبه'},
            {value: 2, text: 'سه شنبه'},
            {value: 3, text: 'چهارشنبه'},
            {value: 4, text: 'پنجشنبه'},
            {value: 5, text: 'جمعه'},
            {value: 7, text: 'شنبه تا چهارشنبه'},
            {value: 8, text: 'شنبه تا پنجشنبه'},
            {value: 9, text: 'تمام هفته'}
        ];

        function getValueOfDay(d) {


        }

        $scope.showDay = function (day) {
            var selected = [];
            if (day.dayOfWeek || day.dayOfWeek === 0) {
                selected = $filter('filter')($scope.days, {value: day.dayOfWeek});
            }
            return selected.length ? selected[0].text : 'Not set';
        };
        $scope.showStatus = function (id, time) {
            var elem = $('#' + id);
            if (!elem.val())
                elem.val(formatMyTime(time));
            elem.clockTimePicker({
                duration: false,
                durationNegative: false,
                precision: 5,
                onAdjust: function (newVal, oldVal) {
                }
            });
        };

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
        };

        $scope.removeDay = function (index, dayId) {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            return $http.post("https://demoapi.karafeed.com/v1/adminRestaurantManagementRest/deleteFoodAvailableDate", dayId, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.food.availableDates.splice(index, 1);
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                    $rootScope.handleError(dayId, "/adminRestaurantManagementRest/deleteFoodAvailableDate", err, httpOptions);
                });
        };

        $scope.removeEmptyRow = function (index, id) {
            if (!id) {
                $scope.food.availableDates.splice(index, 1);
            }
        };

        $scope.addDay = function () {
            $scope.inserted = {
                id: null,
                dayOfWeek: 6,
                count: 0,
                startTime: '00:00',
                endTime: '23:59'
            };
            $scope.food.availableDates.push($scope.inserted);
        };

        $scope.removePicture = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            $http.post("https://demoapi.karafeed.com/v1/restaurant/food/removeFoodImage", $scope.food.id, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    $scope.food.imageAddress = data;
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError($scope.food.id, "/restaurant/food/removeFoodImage", err, httpOptions);
            });
        };

        $scope.uploadPicture = function () {
            var fileInput = document.getElementById('uploadFile');
            //fileInput.addEventListener("change", handleFiles, false);
            $(fileInput).off('change');
            $(fileInput).on('change', handleFiles);

            function handleFiles() {
                var img = new Image();
                var _URL = window.URL || window.webkitURL;
                var file = this.files[0];
                if (!file)
                    return;
                if (!file.type || $.inArray(file.type.substr(file.type.indexOf("/") + 1), ['png', 'jpg', 'jpeg']) === -1) {
                    showMessage(toastrConfig, toastr, "خطا", "لطفا فایل عکس آپلود کنید", "error");
                    return;
                }
                startLoading();
                img.onload = function () {
                    if (this.width > 1600) {
                        showMessage(toastrConfig, toastr, "خطا", "عرض عکس باید کمتر از ۱۶۰۰ پیکسل باشد", "error");
                        stopLoading();
                        return;
                    }
                    if (this.height > 1600) {
                        showMessage(toastrConfig, toastr, "خطا", "ارتفاع عکس باید کمتر از ۱۶۰۰ پیکسل باشد", "error");
                        stopLoading();
                        return;
                    }
                    if (!(this.width > this.height)) {
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
                            if ((4 * Math.ceil((data.length / 3)) * 0.5624896334383812) / 1000 > 600) {
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
                "id": $scope.food.id,
                "image": img.substring(img.indexOf(",") + 1),
                "postfix": postfix
            };
            $http.post("https://demoapi.karafeed.com/v1/restaurant/food/uploadFoodImage", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $scope.food.imageAddress = data;
                    stopLoading();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                }).catch(function (err) {
                $rootScope.handleError(params, "/restaurant/food/uploadFoodImage", err, httpOptions);
            });
        }

        $scope.goBack = function () {
            $location.path("/admin-food");
        };

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();