'use strict';
var fs = require('fs');
var log = require('npmlog');

log.addLevel('save', 3000, { fg: 'grey' });

module.exports = function(savefile) {
  var save = {};
  save._update = function(data, cb) {
    log.save('update', savefile);
    fs.writeFile(savefile, JSON.stringify(data, null, '  '), function(err) {
      cb(err);
    });
  };
  save._read = function(cb) {
    log.save('read', savefile);
    fs.readFile(savefile, function(err, data) {
      if (!err) {
        cb(err, JSON.parse(data));
      } else {
        log.save('read', '.addons.json file not found');
        cb(null, {addons:{}});
      }
    });
  };

  return save;
};