(function () {
    'use strict';

    angular.module('BlurAdmin.pages.emp-buy-report', [])
        .config(routeConfig)
        .controller('empBuyReport', empBuyReport);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('buy-report', {
                url: '/buy-report',
                templateUrl: 'app/pages/employee/buy-report/buy-report.html',
                controller: 'empBuyReport'
            });
    }

    function empBuyReport($scope, $filter, $uibModalStack, $state, $rootScope, $q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.smartTablePageSize = 10;
        var preventTwiceLoad = true;

        $scope.$on('$locationChangeStart', function () {
            var a = location.href;
            $rootScope.employee_params = a.substring(a.indexOf("?") + 1);
        });

        $scope.initCtrl = function() {
            if ($rootScope.employee_params && !$rootScope.isMobile())
                $location.search($rootScope.employee_params);
            $scope.fromDate = $location.search().rs1 ? $location.search().rs1 : moment(new Date()).subtract('days', 7).format('jYYYY/jM/jD');
            $scope.toDate = $location.search().re1 ? $location.search().re1 : moment(new Date()).format('jYYYY/jM/jD');
        };

        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
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
            $location.search('rs1', $scope.fromDate);
            $location.search('re1', $scope.toDate);
            var param = {
                "startDate": moment.utc($scope.fromDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "endDate": moment.utc($scope.toDate, 'jYYYY/jM/jD HH:mm').format('YYYY-MM-DDTHH:mmZ'),
                "pageableDTO": {
                    "direction": sort.reverse ? 'DESC' : 'ASC',
                    "page": pagination.start / pagination.number,
                    "size": pagination.number,
                    "sortBy": sort.predicate ? sort.predicate : 'deliveryDate'
                }
            };
            return $http.post("http://127.0.0.1:9000/v1/employee/getOrderList", param, httpOptions)
                .then(function (data, status, headers, config) {
                    stopLoading();
                    $scope.orders = data.data.list;
                    return data.data;
                }).catch(function (err) {
                    $rootScope.handleError(param, "/employee/getOrderList", err, httpOptions);
                });
        };

        $scope.openModal = function (page, size, item) {
            $scope.item = item;
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
        };

        $scope.orderIsForPast = function(o) {
            return moment.utc(o,"YYYY-MM-DDTHH:mmZ").isBefore(new Date());
        };

        $scope.feedback = function () {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                id: $scope.item.id,
                comment: $("#desc").val()
            };
            $http.post("http://127.0.0.1:9000/v1/employee/addCustomerFeedback", params, httpOptions)
                .success(function (data, status, headers, config) {
                    $uibModalStack.dismissAll();
                    showMessage(toastrConfig, toastr, "پیام", "عملیات با موفقیت انجام شد", "success");
                    stopLoading();
                }).catch(function (err) {
                $rootScope.handleError(params, "/employee/addCustomerFeedback", err, httpOptions);
            });
        };

        $scope.dateChanged = function (date, isFromDate) {
            if (isFromDate) {
                $scope.fromDate = date;
            } else {
                $scope.toDate = date;
            }
            var end = moment($scope.toDate);
            if (end.isBefore($scope.fromDate)) {
                showMessage(toastrConfig, toastr, "خطا", "تاریخ پایان از تاریخ آغاز کوچکتر است", "error");
                return;
            }
            if (end.diff($scope.fromDate, 'days') > 30) {
                showMessage(toastrConfig, toastr, "خطا", "حداکثر بازه زمانی ۳۰ روزه انتخاب نمایید", "error");
                return;
            }
            $scope.$broadcast('refreshMyTable');
        };

        $scope.goToDetail = function (id) {
            $location.path("/buy-report-detail").search('brid', id);
        }

    }
})();