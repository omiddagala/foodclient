(function () {
    'use strict';

    angular.module('BlurAdmin.pages.charge-account', [])
        .config(routeConfig)
        .controller('chargeAccountCtrl', chargeAccountCtrl);

    /** @ngInject */
    function routeConfig($stateProvider) {
        $stateProvider
            .state('charge-account', {
                url: '/charge-account',
                templateUrl: 'app/pages/charge-account/charge-account-from-app.html',
                controller: 'chargeAccountCtrl'
            });
    }

    function chargeAccountCtrl($scope, fileReader, $filter, $uibModal, $http, $rootScope, localStorageService, $location) {
        $scope.accepted = false;

        $scope.pay = function (myform) {
                var form = document.createElement("form");
                form.setAttribute("method","POST");
                form.setAttribute("action","https://asan.shaparak.ir");
                form.setAttribute("target","_self");
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("name","RefId");
                hiddenField.setAttribute("value", $scope.refId);
                form.appendChild(hiddenField);
                document.body.appendChild(form);
                form.submit();
                document.body.removeChild(form);
            };

            $scope.showPreOrder = function () {
                var token = $location.search().tok ? $location.search().tok : localStorageService.get("my_access_token");
                var httpOptions = {
                    headers: {'Content-type': 'text/plain; charset=utf-8', 'Authorization': 'Bearer ' + token}
                };
                var type;
                if ($rootScope.hasRole("COMPANY") || $rootScope.hasRole("SILVER_COMPANY")){
                    type = "C"
                } else {
                    type = "E"
                }
                $scope.amount = $location.search().amount ? $location.search().amount : $scope.amount.replace(/,/g, '');
                var params = $scope.amount.slice(0,-1) + "," + type;
                startLoading();
                $http.post("http://127.0.0.1:9000/v1/payment/getRefId", params, httpOptions)
                    .then(function (data, status, headers, config) {
                        $scope.refId = data.data;
                        $scope.accepted = true;
                        stopLoading();
                    }).catch(function (err) {
                    $rootScope.handleError(params, "/payment/getRefId", err, httpOptions);
                });
            };
        }
    }

)();
