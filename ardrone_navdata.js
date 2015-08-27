'use strict';

var dgram             = require("dgram")
  , consts            = require("./ardrone_constants.js")
  , config            = require('./config.js')
  , ar_navdata_socket = dgram.createSocket('udp4');

var tags = {
  NAVDATA_TIME_TAG:             0,
  NAVDATA_RAW_MEASURES_TAG:     1,
  NAVDATA_PHYS_MEASURES_TAG:    2,
  NAVDATA_GYROS_OFFSETS_TAG:    3,
  NAVDATA_EULER_ANGLES_TAG:     4,
  NAVDATA_REFERENCES_TAG:       5,
  NAVDATA_TRIMS_TAG:            6,
  NAVDATA_RC_REFERENCES_TAG:    7,
  NAVDATA_PWM_TAG:              8,
  NAVDATA_ALTITUDE_TAG:         9,
  NAVDATA_VISION_RAW_TAG:       10,
  NAVDATA_VISION_OF_TAG:        11,
  NAVDATA_VISION_TAG:           12,
  NAVDATA_VISION_PERF_TAG:      13,
  NAVDATA_TRACKERS_SEND_TAG:    14,
  NAVDATA_VISION_DETECT_TAG:    15,
  NAVDATA_WATCHDOG_TAG:         16,
  NAVDATA_ADC_DATA_FRAME_TAG:   17,
  NAVDATA_VIDEO_STREAM_TAG:     18,
  NAVDATA_GAMES_TAG:            19,
  NAVDATA_PRESSURE_RAW_TAG:		  20,
  NAVDATA_MAGNETO_TAG:					21,
  NAVDATA_WIND_TAG:						  22,
  NAVDATA_KALMAN_PRESSURE_TAG:	23,
  NAVDATA_HDVIDEO_STREAM_TAG:	  24,
  NAVDATA_WIFI_TAG:             25
};

ar_navdata_socket.on("error", function(err) {
  console.log("[NAVDATA] *** ERROR ***", err);
  arsocket.close();
});

ar_navdata_socket.on("message", function(buf, infos) {
  var header = buf.readUInt32LE(0)
    , state  = buf.readUInt32LE(4)
    , seq    = buf.readUInt32LE(8)
    , vision = buf.readUInt32LE(12);

  if (header != 0x55667788) {
    console.log("[NAVDATA] received invalid header");
    return;
  }

  buf = buf.slice(16);

  while (buf.length > 3 && buf.readUInt16LE(2) != 0) {
    var id   = buf.readUInt16LE(0)
      , size = buf.readUInt16LE(2);

    switch (id) {
      case tags.NAVDATA_TIME_TAG:
        var time = buf.readUInt32LE(4)
          , sec  = time >> 21
          , mil  = time & 0x7FFFFF;

        console.log("[NAVDATA] Time is " + sec + "." + mil + "s");

        break;
      case tags.NAVDATA_RAW_MEASURES_TAG:
        console.log("[NAVDATA] Raw Measures");

        break;
      case tags.NAVDATA_PHYS_MEASURES_TAG:
        console.log("[NAVDATA] Phys Measures");

        break;
      case tags.NAVDATA_GYROS_OFFSETS_TAG:
        console.log("[NAVDATA] Gyros Offsets");

        break;
      case tags.NAVDATA_EULER_ANGLES_TAG:
        console.log("[NAVDATA] Euler Angles");

        break;
      case tags.NAVDATA_REFERENCES_TAG:
        console.log("[NAVDATA] References");

        break;
      case tags.NAVDATA_TRIMS_TAG:
        console.log("[NAVDATA] Trims");

        break;
      case tags.NAVDATA_RC_REFERENCES_TAG:
        console.log("[NAVDATA] RC References");

        break;
      case tags.NAVDATA_PWM_TAG:
        console.log("[NAVDATA] PWM");

        break;
      case tags.NAVDATA_ALTITUDE_TAG:
        console.log("[NAVDATA] Altitude");

        break;
      case tags.NAVDATA_VISION_RAW_TAG:
        console.log("[NAVDATA] Vision Raw");

        break;
      case tags.NAVDATA_VISION_OF_TAG:
        console.log("[NAVDATA] Vision Of");

        break;
      case tags.NAVDATA_VISION_TAG:
        console.log("[NAVDATA] Vision");

        break;
      case tags.NAVDATA_VISION_PERF_TAG:
        console.log("[NAVDATA] Vision Perf");

        break;
      case tags.NAVDATA_TRACKERS_SEND_TAG:
        console.log("[NAVDATA] Trackers Send");

        break;
      case tags.NAVDATA_VISION_DETECT_TAG:
        console.log("[NAVDATA] Vision Detect");

        break;
      case tags.NAVDATA_WATCHDOG_TAG:
        console.log("[NAVDATA] Watchdog");

        break;
      case tags.NAVDATA_ADC_DATA_FRAME_TAG:
        console.log("[NAVDATA] ADC Data Frame");

        break;
      case tags.NAVDATA_VIDEO_STREAM_TAG:
        console.log("[NAVDATA] Video Stream");

        break;
      case tags.NAVDATA_GAMES_TAG:
        console.log("[NAVDATA] Games");

        break;
      case tags.NAVDATA_PRESSURE_RAW_TAG:
        console.log("[NAVDATA] Pressure Raw");

        break;
      case tags.NAVDATA_MAGNETO_TAG:
        console.log("[NAVDATA] Magneto");

        break;
      case tags.NAVDATA_WIND_TAG:
        console.log("[NAVDATA] Wind");

        break;
      case tags.NAVDATA_KALMAN_PRESSURE_TAG:
        console.log("[NAVDATA] Kalman Pressure");

        break;
      case tags.NAVDATA_HDVIDEO_STREAM_TAG:
        console.log("[NAVDATA] HD Video Stream");

        break;
      case tags.NAVDATA_WIFI_TAG:
        console.log("[NAVDATA] WiFi");

        break;
      default:
        break;
    }

    buf = buf.slice(size);
  }
});

if (config.THIS_IS_FOR_REAL) {
  ar_navdata_socket.bind(consts.NAVDATA_PORT);

  var hello = new Buffer([1]);
  ar_navdata_socket.send(hello, 0, hello.length, consts.NAVDATA_PORT, consts.AR_ADDR);
}
