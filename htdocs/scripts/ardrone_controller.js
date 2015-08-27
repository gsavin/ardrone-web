'use strict';

function ARDroneCtrl($scope, $http, drone) {
  var ardrone = this;

  ardrone.doAction = function(what) {
    console.log("action", what);

    $http.get("/api/action/" + what + "/").
      success(function(data) {
      }).
      error(function() {
      });
  };

  ardrone.doNotMove = function() {
    drone.reset();
  };

  ardrone.onKeyPress = function(e) {
    console.log(e);
  };

  $scope.drone = drone;
}

angular.module("ardrone")
  .controller('ARDroneCtrl', ['$scope', '$http', 'drone', ARDroneCtrl]);
