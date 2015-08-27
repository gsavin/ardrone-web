'use strict';

var consts     = require("./ardrone_constants.js")
  , config     = require('./config.js')
  , dgram      = require("dgram")
  , udpSock    = dgram.createSocket("udp4")
  , seq        = 1
  , express    = require("express")
  , router     = express.Router()
  , at_socket  = dgram.createSocket('udp4');

at_socket.on("error", function(err) {
  console.log("*** ERROR ***", err);
  arsocket.close();
});

at_socket.on("message", function(msg, infos) {
  console.log("[" + infos.address + ":" + infos.port + "] " + msg);
});

if (config.THIS_IS_FOR_REAL)
  at_socket.bind(consts.AT_PORT);

/**
 * Send a UDP packet containing an AT command to the AT_PORT of the drone.
 *
 * @param req the http request
 * @param res the http response
 * @param cmd the AT command
 * @param arguments other arguments will be considered as arguments of the AT command
 *          and so, will be added to the sent message
 */
function sendAT(req, res, cmd) {
  var msg = "AT*" + cmd + "=" + (seq++);

  for (var i = 3; i < arguments.length; i++)
    msg += "," + arguments[i];

  msg += "\r";

  var buf = new Buffer(msg, "ascii");

  if (buf.length > 1024) {
    res.status(400).send("*** ERROR *** Command exceeds 1024 chars.");
  }
  else {
    console.log("Exec :", msg);

    if (config.THIS_IS_FOR_REAL) {
      udpSock.send(buf, 0, buf.length, consts.AT_PORT, consts.AR_ADDR, function() {
        res.status(200).send("OK\n");
      });
    }
    else {
      res.status(200).send(msg + "\n");
    }
  }
}

function getValue(value) {
  var v = 0.25;

  if (!isNaN(value)) {
    v = parseFloat(value);
    v = Math.max(-1, Math.min(1, v));
  }

  return v;
}

router.get("/api/action/:action/", function(req, res) {
  switch (req.params.action) {
    case "ftrim":
    case "FTRIM":
      sendAT(req, res, "FTRIM");
      break;
    case "takeoff":
    case "TAKEOFF":
      sendAT(req, res, "REF", "290718208");
      break;
    case "land":
    case "LAND":
      sendAT(req, res, "REF", "290717696");
      break;
    case "emergency":
    case "EMERGENCY":
      sendAT(req, res, "REF", "290717952");
      break;
    case "standby":
    case "STANDBY":
      sendAT(req, res, "PCMD", 0, 0, 0, 0, 0);
      break;
    case "calib":
    case "CALIB":
      sendAT(req, res, "CALIB");
      break;
    default:
      res.status(400).send("invalid action \"" + req.params.action + "\"");
      return;
  }
});

router.get("/api/config/:key/:value/", function(req, res) {
  sendAT(req, res, "CONFIG", "\"" + req.params.key + "\"", "\"" + req.params.value + "\"");
});

router.get("/api/control/:mode/", function(req, res) {
  var mode = 0;

  switch (req.params.mode) {
    case "no_control":
    case "NO_CONTROL":
      mode = 0;
      break;
    case "ardrone_update":
    case "ARDRONE_UPDATE":
      mode = 1;
      break;
    case "pic_update":
    case "PIC_UPDATE":
      mode = 2;
      break;
    case "logs_get":
    case "LOGS_GET":
      mode = 3;
      break;
    case "cfg_get":
    case "CFG_GET":
      mode = 4;
      break;
    case "ack":
    case "ACK":
      mode = 5;
      break;
    default:
      res.status(400).send("invalid mode \"" + req.params.mode + "\"");
      return;
  }

  sendAT(req, res, "CTRL", mode);
});

router.get("/api/move/:direction/:value?", function(req, res) {
  var ud = 0
    , lr = 0
    , fb = 0
    , v  = getValue(req.params.value);

  switch (req.params.direction) {
    case "up":
    case "UP":
      ud = v;
      break;
    case "down":
    case "DOWN":
      ud = -v;
      break;
    case "left":
    case "LEFT":
      lr = -v;
      break;
    case "right":
    case "RIGHT":
      lr = v;
      break;
    case "front":
    case "FRONT":
      fb = -v;
      break;
    case "back":
    case "BACK":
      fb = v;
      break;
    default:
      res.status(400).send("invalid direction \"" + req.params.direction + "\"");
      return;
  }

  sendAT(req, res, "PCMD", 5, lr, fb, ud, 0);
});

function ieee754(v, b) {
  b.writeFloatLE(parseFloat(v), 0);
  return b.readInt32LE(0);
}

router.get("/api/pcmd/:lr/:fb/:ud/:spine/", function(req, res) {
  var lr = getValue(req.params.lr)
    , fb = getValue(req.params.fb)
    , ud = getValue(req.params.ud)
    , sp = getValue(req.params.spine)
    , b  = new Buffer(4);

  lr = ieee754(lr, b);
  fb = ieee754(fb, b);
  ud = ieee754(ud, b);
  sp = ieee754(sp, b);

  sendAT(req, res, "PCMD", 0x01, lr, fb, ud, sp);
});

router.get("/api/spine/:dir/:value?", function(req, res) {
  var sp = 0
    , v  = getValue(req);

  switch (req.params.dir) {
    case "left":
    case "LEFT":
      sp = v;
      break;
    case "right":
    case "RIGHT":
      sp = -v;
      break;
    default:
      res.status(400).send("invalid direction \"" + req.params.dir + "\"");
      return;
  }

  sendAT(req, res, "PCMD", 5, 0, 0, 0, sp);
});

module.exports = router;
