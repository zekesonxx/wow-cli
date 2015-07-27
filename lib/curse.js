'use strict';
var log = require('npmlog');
var request = require('request');


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
    var durl = /data-href="(http:\/\/addons\.curse\.cursecdn\.com\/files\/[^\n"]*)"/.exec(body)[1];
    var version = parseInt(/data-file="([0-9]+)"/.exec(body)[1]);
    log.http(res.statusCode, url + ' (%d)', version);
    cb(null, durl, version);
  });
};