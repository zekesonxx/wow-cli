'use strict';
var request = require('request');
var log = require('npmlog');

var tukui = {};

tukui._getProject = function(project, cb) {
  var url = 'http://tukui.org/api.php?project='+encodeURIComponent(project);
  log.http('GET', url);
  request.get({
    url: url,
    json: true
  }, function(err, res, body) {
    if (err) return cb(err);
    log.http(res.statusCode, url+' (%s)', body[0].version);
    cb(null, body[0]);
  });
};

tukui._getAddon = function(addon, cb) {
  var url = 'http://tukui.org/api.php?addons=all';
  log.http('GET', url);
  request.get({
    url: url,
    json: true
  }, function(err, res, body) {
    log.http(res.statusCode, url);
    if (err) return cb(err);
    console.log(body);
  });
};

tukui.getDownloadURL = function(addon, version, cb) {
  if (addon === 'tukui' || addon === 'elvui') {
    tukui._getProject(addon, function(err, data) {
      if (err) return cb(err);
      cb(null, data.url, data.version);
    });
  }
};

module.exports = tukui;