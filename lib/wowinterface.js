'use strict';
var request = require('request');
var log = require('npmlog');
var util = require('util');

var wowinterface = {};
var mockingstring = 'minion-sucks';
wowinterface.idRegex = /(?:info|download)?([0-9]+)(?:\-(?:[A-Za-z0-9-_]+)?(?:\.html)?)?/;
wowinterface.versionRegex = /<div id="version">Version: ([A-Za-z0-9\s-_.]+)<\/div>/;
wowinterface.nameRegex = /http:\/\/www\.wowinterface\.com\/downloads\/info([0-9]+)\-([A-Za-z0-9-_.]+).html/;

wowinterface.craftDownloadURL = function(addonid, name) {
  return util.format('http://cdn.wowinterface.com/downloads/file%s/%s.zip', addonid, name);
};

wowinterface.craftInfoURL = function(addonid) {
  return util.format('http://www.wowinterface.com/downloads/info%s-%s.html', addonid, mockingstring);
};

wowinterface.extractID = function(input) {
  var result = wowinterface.idRegex.exec(input);
  //if result found && result is number
  if (result && result[1] && String(parseInt(result[1])) === result[1]) {
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
    var versionresult = wowinterface.versionRegex.exec(body);
    var nameresult = wowinterface.nameRegex.exec(body);
    var name, version;
    if (versionresult[1]) {
      version = versionresult[1];
    } else {
      return cb(new Error('Unable to find version string in webpage. Did wowinterface change something?'));
    }

    if (nameresult && parseInt(nameresult[1]) === addonid && nameresult[2]) {
      name = nameresult[2];
    } else {
      return cb(new Error('Unable to find name string in webpage. Did wowinterface change something?'));
    }

    var newAddonName = util.format('%s-%s', addonid, name);
    cb(null, wowinterface.craftDownloadURL(addonid, name), version, newAddonName);
  });
};

module.exports = wowinterface;