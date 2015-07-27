### 0.0.4 (in progress)
* Fix broken caching, use `--cache false` to disable and `--cache true` to ensure enabled.
* Added WoWInterface support

### 0.0.3
* Now caches downloaded files in $WOWPATH/Interface/ZipFiles, making for faster reinstalls and makes downgrades possible with TukUI addons. Can be bypassed with `--no-cache`
* Find out which addon created that folder using `wow blame`


### 0.0.2
* Added detection to prevent a shared folder getting removed when only one of the addons is removed
* Fix crash when $WOWPATH/.addons.json is not present.
* Better addon update checking

### 0.0.1
* Inital Release