(function () {
    'use strict';

    angular.module('BlurAdmin.pages.co-reports', [])
        .config(routeConfig)
        .controller('coReports', coReports);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('co-reports', {
                url: '/co-reports',
                templateUrl: 'app/pages/company/reports/reports.html',
                controller: 'coReports'
            });
    }

    function coReports($scope, $filter, editableOptions, editableThemes, $state, $rootScope,$q, $http, localStorageService, $location, $uibModal, $timeout, toastrConfig, toastr) {
        $scope.commissionDate = moment(new Date()).format('jYYYY/jM/jD');
        $scope.fromDate = moment(new Date()).format('jYYYY/jM/jD');
        $scope.toDate = moment(new Date()).add('days', 30).format('jYYYY/jM/jD');
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
