/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
      .directive('pageTop', pageTop);

  /** @ngInject */
  function pageTop() {
    return {
      restrict: 'E',
      templateUrl: 'app/theme/components/pageTop/pageTop.html',
        controller: function ($scope) {
            $(document).scroll(function () {
                if ($(document).scrollTop() >= 50) {
                    $scope.$apply(function () {
                        $scope.scrolled = true;
                    })
                } else {
                    $scope.$apply(function () {
                        $scope.scrolled = false;
                    })
                }
            })
        }
    };
  }

})();