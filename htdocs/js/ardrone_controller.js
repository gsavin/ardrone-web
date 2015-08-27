'use strict';

function ARDroneCtrl($scope, $http) {
  $scope.doAction(what) {
    $http.get("/api/action/" + what + "/").
      success(function(data) {
      }).
      error(function() {
      });
  }
}

angular.module("ardrone")
  .controller('ARDroneCtrl', ['$scope', '$http', ARDroneCtrl]);
