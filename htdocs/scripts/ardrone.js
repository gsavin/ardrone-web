'use strict';

function droneFactory($http) {
  var listeners = [];

  var params = {
    leftRightTilt: 0,
    frontBackTilt: 0,
    verticalSpeed: 0,
    angularSpeed:  0,
  };

  function update() {
    $http.get("/api/pcmd/" + params.leftRightTilt + "/" + params.frontBackTilt + "/" + params.verticalSpeed + "/" + params.angularSpeed + "/").
      success(function(data) {
      }).
      error(function() {
      });

    listeners.forEach(onUpdateTrigger);
  }

  function onUpdate(cb) {
    listeners.push(cb);
  }

  function onUpdateTrigger(element, index, array) {
    element();
  }

  return {
    params: params,

    reset: function() {
      params.leftRightTilt = 0;
      params.frontBackTilt = 0;
      params.verticalSpeed = 0;
      params.angularSpeed =  0;

      update();
    },

    updateMove: update,
    onUpdate: onUpdate
  };
}

angular.module("ardrone", [])
  .factory('d3', function() {
    return window.d3;
  })
  .factory('drone', ['$http', droneFactory]);
