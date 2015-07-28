'use strict';
var log = require('npmlog');
var request = require('request');

var downloadRegex = /data-href="(http:\/\/addons\.curse\.cursecdn\.com\/files\/[^\n"]*)"/;
var versionRegex = /data-file="([0-9]+)"/;

/**
 * Scrapes a download URL from curse.com
 * @param  {String}   slug    The addon slug
 * @param  {String}   version Addon version, can be null.
 * @param  {Function} cb      Callback
 */
exports.getDownloadURL = function(slug, version, cb) {
  var url = 'http://www.curse.com/addons/wow/' + slug + '/' + (version || 'download');
  log.http('GET', url);
  request.get(url, function(err, res, body) {
    if (err) return cb(err);
    var durl = downloadRegex.exec(body);
    if (!durl || !durl[1]) {
      return cb(new Error('Failed scraping download URL. Does the addon exist, or did Curse change something?'));
    }
    var version = versionRegex.exec(body);
    if (!version || !version[1]) {
      return cb(new Error('Failed scraping download URL. Did Curse change something?'));
    }
    log.http(res.statusCode, url + ' (%d)', version[1]);
    cb(null, durl[1], version[1]);
  });
};