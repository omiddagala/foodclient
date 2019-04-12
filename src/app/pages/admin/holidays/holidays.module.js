(function () {
    'use strict';

    angular.module('BlurAdmin.pages.holidays', [])
        .config(routeConfig)
        .controller('holidaysCtrl', holidaysCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('holidays', {
                url: '/holidays',
                templateUrl: 'app/pages/admin/holidays/holidays.html',
                controller: 'holidaysCtrl'
            });
    }

    function holidaysCtrl($scope, $filter, editableOptions, editableThemes,$rootScope, $state, $q, $http, localStorageService, $location, $uibModal, $uibModalStack, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;
        $scope.holidayType = "ramadan";
        $scope.h = [];

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

        $scope.holidayTypeChanged = function (h) {
            $scope.holidayType = h;
            preventTwiceLoad = true;
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
            var url;
            if ($scope.holidayType === 'ramadan'){
                url = "http://127.0.0.1:9000/v1/vacation/getRamadan";
            } else if ($scope.holidayType === 'vacation'){
                url = "http://127.0.0.1:9000/v1/vacation/getVacationList";
            } else {
                url = "http://127.0.0.1:9000/v1/vacation/getOffDaysList";
            }
            return $http.post(url, null, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.h = data.data;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(null, url, err, httpOptions);
                });
        };
        $scope.openModal = function (page, size, id, index) {
            $scope.hId = id;
            $scope.hIndex = index;
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
            if ($scope.holidayType === 'ramadan') {
                setTimeout(function () {
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
                },1000);
            }
        };

        $scope.doAddRamadanHoliday = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                startDate: moment.utc($("#fromDate").find('input').val() , 'jYYYY/jM/jD').format('YYYY-MM-DD'),
                endDate: moment.utc($("#toDate").find('input').val() , 'jYYYY/jM/jD').format('YYYY-MM-DD'),
                startTime: Number($('#fromTime').val().replace(':','')),
                endTime: Number($('#toTime').val().replace(':',''))
            };
            $http.post("http://127.0.0.1:9000/v1/vacation/addRamadan", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $uibModalStack.dismissAll();
                    $scope.h = [];
                    $scope.h.push(data.data);
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, "/vacation/addRamadan", err, httpOptions);
            });
        };

        $scope.doAddVacationHoliday = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                date: moment.utc($("#date").find('input').val() , 'jYYYY/jM/jD').format('YYYY-MM-DD')
            };
            var url;
            if ($scope.holidayType === 'vacation'){
                url = "http://127.0.0.1:9000/v1/vacation/addVacation";
            } else {
                url = "http://127.0.0.1:9000/v1/vacation/addKarafeedOffDay";
            }
            $http.post(url, param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.h.push(data.data);
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, url, err, httpOptions);
            });
        };

        $scope.deleteHoliday = function () {
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                id: $scope.hId
            };
            var url;
            if ($scope.holidayType === 'vacation'){
                url = "http://127.0.0.1:9000/v1/vacation/deleteVacation";
            } else {
                url = "http://127.0.0.1:9000/v1/vacation/deleteOffDays";
            }
            $http.post(url, param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.h.splice($scope.hIndex, 1);
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig,toastr,"پیام","عملیات با موفقیت انجام شد","success");
                }).catch(function (err) {
                $uibModalStack.dismissAll();
                $rootScope.handleError(param, url, err, httpOptions);
            });
        };
        $scope.formatMyTime = function(d) {
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

        editableOptions.theme = 'bs3';
        editableThemes['bs3'].submitTpl = '<button type="submit" class="btn btn-primary btn-with-icon"><i class="ion-checkmark-round"></i></button>';
        editableThemes['bs3'].cancelTpl = '<button type="button" ng-click="$form.$cancel()" class="btn btn-default btn-with-icon"><i class="ion-close-round"></i></button>';

    }
})();