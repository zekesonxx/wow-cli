'use strict';
var downloader = require('./downloader');
var async = require('async');
var log = require('npmlog');
var fs = require('fs');
var path = require('path');
var rimraf = require('rimraf');
log.heading = 'wow';

var sources = {
  'curse': require('./curse'),
  'tukui': require('./tukui')
};

module.exports = function(wowpath) {
  var wowdir = wowpath;
  var addonsdir = path.join(wowdir, 'Interface', 'AddOns');
  var savefile = path.join(wowdir, '.addons.json');
  var save = require('../lib/save')(savefile);
  
  var wow = {};
  
  wow._install = function(url, source, addon, version, callback) {
    async.waterfall([
      downloader.downloadAddonToTempFile.bind(null, url),
      function(file, cb) {
        cb(null, file, addonsdir);
      },
      downloader.extractZip,
      function(folders, cb) {
        save._read(function(err, data) {
          if (err) cb(err);
          if (!data.addons) data.addons = {};
          data.addons[addon] = {
            source: source,
            version: version,
            folders: folders
          };
          save._update(data, function(err) {
            cb(err);
          });
        });
      }
    ], callback);
  };

  wow.install = function(source, addon, version, callback) {
    if (!callback) {
      callback = version;
      version = null;
    }
    sources[source].getDownloadURL(addon, version, function(err, url, v) {
      if (err) return callback(err);
      wow._install(url, source, addon, v, callback);
    });
  };
  
  wow.update = function(addon, callback) {
    save._read(function(err, savefile) {
      if (err) callback(err);
      var source = savefile.addons[addon].source;
      sources[source].getDownloadURL(addon, null, function(err, url, version) {
        if (err) return callback(err);
        var oldversion = savefile.addons[addon].version;
        log.info('version', '%s:%s cur: %d, latest: %d', source, addon, oldversion, version);
        if (oldversion !== version) {
          /**
           * We're assuming that a new version # means a new version
           * This is because some addon places (looking at you tukui.org)
           * don't have a standardized method of update numbers.
           */
          wow._install(url, source, addon, version, function() {
            callback(null, true);
          });
        } else {
          callback(null, false);
        }
      });
    });
  };

  wow.uninstall = function(addon, callback) {
    save._read(function(err, data) {
      if (err) return callback(err);
      if (!data.addons[addon]) {
        return callback('notfound');
      }
      async.each(data.addons[addon].folders, function(folder, cb) {
        folder = path.join(addonsdir, folder);
        log.fs('delete', folder);
        rimraf(folder, cb);
      }, function(err) {
        if (err) return callback(err);
        delete data.addons[addon];
        save._update(data, function(err) {
          callback(err);
        });
      });
    });
  };
  wow.sources = Object.keys.bind(Object, sources);

  return wow;
};