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
  'tukui': require('./tukui'), 
  'wowinterface': require('./wowinterface')
};

module.exports = function(wowpath) {
  var wowdir = wowpath;
  var addonsdir = path.join(wowdir, 'Interface', 'AddOns');
  var cachedir = path.join(wowdir, 'Interface', 'ZipFiles');
  require('mkdirp').sync(cachedir);
  var savefile = path.join(wowdir, '.addons.json');
  var save = require('../lib/save')(savefile);
  
  var wow = {};
  
  wow._install = function(url, source, addon, version, nocache, callback) {
    async.waterfall([
      downloader.obtainZipFile.bind(null, source, addon, url, nocache, cachedir),
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

  wow.install = function(source, addon, version, nocache, callback) {
    if (!nocache) {
      callback = nocache;
      nocache = false;
    }
    if (!callback) {
      callback = version;
      version = null;
    }
    sources[source].getDownloadURL(addon, version, function(err, url, v) {
      if (err) return callback(err);
      wow._install(url, source, addon, v, nocache, callback);
    });
  };
  
  wow.update = function(addon, callback) {
    wow.checkupdate(addon, function(err, result, source, url, version){
      if (err) callback(err);
      if (!result) {
        callback(null, false);
      } else {
        wow._install(url, source, addon, version, false, function(err) {
          callback(err, true);
        });
      }
    });
  };

  wow.checkupdate = function(addon, callback) {
    save._read(function(err, savefile) {
      if (err) callback(err);
      var source = savefile.addons[addon].source;
      sources[source].getDownloadURL(addon, null, function(err, url, version) {
        if (err) return callback(err);
        var oldversion = savefile.addons[addon].version;
        log.info('version', '%s:%s cur: %s, latest: %s%s', source, addon, oldversion, version, (version !== oldversion ? '!':''));
        if (oldversion !== version) {
          /**
           * We're assuming that a new version # means a new version
           * This is because some addon places (looking at you tukui.org)
           * don't have a standardized method of update numbers.
           */
          callback(null, true, source, url, version);
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
      async.each(data.addons[addon].folders, function(foldername, cb) {
        var folder = path.join(addonsdir, foldername);
        var needed = false;
        Object.keys(data.addons).forEach(function(name) {
          if (!needed && data.addons[name].folders.indexOf(foldername) !== -1 && name !== addon) {
            log.fs('delete', 'folder %s needed by %s, not deleting', foldername, name);
            needed = true;
          }
        });
        if (!needed) {
          log.fs('delete', folder);
          rimraf(folder, cb);
        } else {
          cb(null);
        }
      }, function(err) {
        if (err) return callback(err);
        delete data.addons[addon];
        save._update(data, function(err) {
          callback(err);
        });
      });
    });
  };

  wow.blame = function(folder, callback) {
    save._read(function(err, data) {
      if (err) return callback(err);
      var addons = [];
      Object.keys(data.addons).forEach(function(addon) {
        if (data.addons[addon].folders.indexOf(folder) !== -1) {
          addons.push(data.addons[addon].source + ':' + addon);
        }
      });
      callback(null, addons);
    });
  };


  wow.sources = Object.keys.bind(Object, sources);

  return wow;
};