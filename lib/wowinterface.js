'use strict';
var request = require('request');
var log = require('npmlog');
var util = require('util');

var wowinterface = {};
var mockingstring = 'minion-sucks';
wowinterface.idRegex = /(?:info|download)?([0-9]+)(?:\-(?:[A-Za-z0-9-_]+)?(?:\.html)?)?/;
wowinterface.versionRegex = /<div id="version">Version: ([A-Za-z0-9\s-_.]+)<\/div>/;

wowinterface.craftDownloadURL = function(addonid) {
  return util.format('http://cdn.wowinterface.com/downloads/file%s/%s.zip', addonid, mockingstring);
};

wowinterface.craftInfoURL = function(addonid) {
  return util.format('http://www.wowinterface.com/downloads/info%s-%s.html', addonid, mockingstring);
};

wowinterface.extractID = function(input) {
  var result = wowinterface.idRegex.exec(input);
  //if result found && result is number
  if (result[1] && String(parseInt(result[1])) === result[1]) {
    return parseInt(result[1]);
  }
};

wowinterface.getDownloadURL = function(addon, version, cb) {
  if (version !== null) {
    log.warn('wowinterface', 'specific versions of wowinterface addons can\'t be installed (yet, is possible, will come soon).');
  }
  var addonid = wowinterface.extractID(addon);
  var url = wowinterface.craftInfoURL(wowinterface.extractID(addon));
  log.http('GET', url);
  request.get({
    url: url
  }, function(err, res, body) {
    log.http(res.statusCode, url);
    if (err) return cb(err);
    var result = wowinterface.versionRegex.exec(body);
    if (result[1]) {
      cb(null, wowinterface.craftDownloadURL(addonid), result[1]);
    } else {
      cb(new Error('Unable to find version string in webpage. Did wowinterface change something?'));
    }

  });
};

module.exports = wowinterface;