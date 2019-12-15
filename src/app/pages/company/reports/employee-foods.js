(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-employee-foods-reports', [])
        .config(routeConfig)
        .controller('coReports', coReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-employee-foods', {
                url: '/co-employee-foods',
                templateUrl: 'app/pages/company/reports/employee-foods.html',
                controller: 'coReports'
            });
    }

    function coReports($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.commissionDate = moment(new Date()).format('jYYYY/jM/jD');
        var preventTwiceLoad = true;
        $scope.selectedLoc = {
            title : "لطفا محل را انتخاب کنید"
        };

        $scope.initCtrl = function () {
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var param = {
                "pageableDTO": {
                    "direction": 'ASC',
                    "page": 0,
                    "size": 50,
                    "sortBy": 'id'
                }
            };
            $http.post("http://127.0.0.1:9000/v1/companyEmployeeManagement/getCompanyLocationsForEmployeeDefinition", param, httpOptions)
                .then(function (data, status, headers, config) {
                    $scope.locs = data.data;
                }).catch(function (err) {
            });
        };

        $scope.employeesFoodReport = function(){
            startLoading();
            var token = localStorageService.get("my_access_token");
            var httpOptions = {
                headers: {'Content-type': 'application/json; charset=utf-8', 'Authorization': 'Bearer ' + token}
            };
            var params = {
                "id": $scope.selectedLoc.id,
                "date": moment.utc($scope.commissionDate, 'jYYYY/jM/jD').format('YYYY-MM-DDTHH:mmZ')
            };
            $http.post("http://127.0.0.1:9000/v1/company/getEmployeesFoodList", params, httpOptions)
                .success(function (data, status, headers, config) {
                    stopLoading();
                    if (data === "-1") {
                        showMessage(toastrConfig,toastr,'پیام','رکوردی یافت نشد','success');
                        return;
                    }
                    if (data === "-2") {
                        showMessage(toastrConfig,toastr,'پیام','شما مجاز به انجام این عملیات نیستید','success');
                        return;
                    }   if (data === "-403") {
                        showMessage(toastrConfig,toastr,'پیام','انجام این عملیات برای کاربر شما غیر فعال است','success');
                        return;
                    }
                    mydownload(data,'report.pdf','application/pdf',toastrConfig,toastr);
                }).catch(function (err) {
                $rootScope.handleError(params, "/company/getEmployeesFoodList", err, httpOptions);
            });
        };


        $scope.commissionDateChanged = function (d) {
            $scope.commissionDate = d;
        };


        $scope.address_changed = function (r) {
            $scope.selectedLoc = r;
        };
        //vahid seraj updated code. (1397.10.01) ------------- [start]
        $scope.toggleSidebar = function (e) {
            console.log(this);
            $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanding');
            window.setTimeout(function () {
                $('ba-sidebar, .al-sidebar.sabad__, #mySearchSidebar').toggleClass('expanded');
            }, 10);
        }
        //vahid seraj updated code. (1397.10.01) ------------- [end]
    }
})();
