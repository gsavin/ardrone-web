'use strict';

function createBackground(container, w, h, p) {
  container.append('rect')
    .attr('x', p)
    .attr('y', p)
    .attr('width',  w - 2 * p)
    .attr('height', h - 2 * p)
    .attr('class', 'background');

  container.append('line')
    .attr('x1', p)
    .attr('y1', h / 2)
    .attr('x2', w-p)
    .attr('y2', h / 2)
    .attr('class', 'ticks');

  container.append('line')
    .attr('x1', w / 2)
    .attr('y1', p)
    .attr('x2', w / 2)
    .attr('y2', h-p)
    .attr('class', 'ticks');

  for (var i = 0.1; i < 1; i += 0.1)
    container.append('rect')
      .attr('x', p + i * (w / 2))
      .attr('y', p + i * (h / 2))
      .attr('width',  w - 2 * p - 2 * i * (w / 2))
      .attr('height', h - 2 * p - 2 * i * (h / 2))
      .attr('class', 'ticks');
}

function createJoystick(svg, c, r, x, y) {
  return svg.append('circle')
    .attr('cx', x)
    .attr('cy', y)
    .attr('r',  r)
    .attr('class', c);
}

function joystickFactory($window, d3, drone) {
  var pad       = 15
    , precision = 10.0;

  function mm(v) {
    if (typeof v !== 'number')
      v = parseFloat(v);
    
    return Math.max(-1.0, Math.min(1.0, v));
  }

  function link(scope, element, attr) {
    var svg       = d3.select(element[0]).append('svg')
      , width     = Math.max(2*pad + 1, attr.width  || element.width())
      , height    = Math.max(width, attr.height || element.height())
      , cx        = width / 2
      , cy        = height / 2
      , radius    = Math.min(width / 2, height / 2) - 2 * pad;

    var minX = pad
      , minY = pad
      , maxX = width  - pad
      , maxY = height - pad;

    svg
      .attr('width', width)
      .attr('height', height);

    var bg = svg.append('g');
    createBackground(bg, width, height, pad);

    var joystick1 = createJoystick(svg, 'joystick1', pad, cx, cy)
      , joystick2 = createJoystick(svg, 'joystick2', pad, cx, cy);

    var drag1 = d3.behavior.drag()
      , drag2 = d3.behavior.drag();

    function createDragger(j, px, py) {
      return function() {
        var x = Math.max(minX, Math.min(maxX, d3.event.x))
          , y = Math.max(minY, Math.min(maxY, d3.event.y));

        if (Math.sqrt((cx-x)*(cx-x) + (cy-y)*(cy-y)) < 0.1 * radius) {
          x = cx;
          y = cy;
        }
        else if (Math.abs(cx - x) < 0.1 * radius)
          x = cx;
        else if (Math.abs(cy - y) < 0.1 * radius)
          y = cy;

        j.attr('cx', x).attr('cy', y);

        drone.params[px] = Math.floor(precision * (2 * (x - minX) / (maxX - minX) - 1)) / precision;
        drone.params[py] = Math.floor(precision * (2 * (y - minY) / (maxY - minY) - 1)) / precision;
        drone.updateMove();

        d3.event.sourceEvent.stopPropagation();
      }
    }

    drag1.on('drag', createDragger(joystick1, 'leftRightTilt', 'frontBackTilt'));
    drag2.on('drag', createDragger(joystick2, 'angularSpeed',  'verticalSpeed'));

    joystick1.call(drag1);
    joystick2.call(drag2);

    drone.onUpdate(function() {
      var x1 = minX + (maxX - minX) * (parseFloat(drone.params.leftRightTilt) + 1) / 2
        , x2 = minX + (maxX - minX) * (parseFloat(drone.params.angularSpeed) + 1) / 2
        , y1 = minY + (maxY - minY) * (parseFloat(drone.params.frontBackTilt) + 1) / 2
        , y2 = minY + (maxY - minY) * (parseFloat(drone.params.verticalSpeed) + 1) / 2;

      joystick1.attr('cx', x1).attr('cy', y1);
      joystick2.attr('cx', x2).attr('cy', y2);
    });

    d3.select(window).on('keypress', function() {
      var ctrl = d3.event.ctrlKey;

      switch(d3.event.keyCode) {
        case 37: /* left  */
          if (!ctrl)
            drone.params.leftRightTilt = mm(drone.params.leftRightTilt - 0.1);
          else
            drone.params.angularSpeed = mm(drone.params.angularSpeed - 0.1);

          break;
        case 38: /* up    */
          if (!ctrl)
            drone.params.frontBackTilt = mm(drone.params.frontBackTilt - 0.1);
          else
            drone.params.verticalSpeed = mm(drone.params.verticalSpeed - 0.1);

          break;
        case 39: /* right */
          if (!ctrl)
            drone.params.leftRightTilt = mm(drone.params.leftRightTilt + 0.1);
          else
            drone.params.angularSpeed = mm(drone.params.angularSpeed + 0.1);

          break;
        case 40: /* down  */
          if (!ctrl)
            drone.params.frontBackTilt = mm(drone.params.frontBackTilt + 0.1);
          else
            drone.params.verticalSpeed = mm(drone.params.verticalSpeed + 0.1);

          break;
        default:
          break;
      }

      drone.updateMove();
    });
  }

  return {
    link: link
  };
}

/*
 * Enregistrement de la directive.
 */
angular.module('ardrone')
 .directive('joystick', ['$window', 'd3', 'drone', joystickFactory])
