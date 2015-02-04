# wow-cli
This is a World of Warcraft addon downloader, installer, uninstaller, and manager.

I don't play WoW anymore, but this thing still works fine.

## Installation
```text
$ npm install -g wow-cli
```
wow-cli is, as the name implies, a CLI tool. The tool will keep track of your installed addons in a .addons.json file in your WoW install folder. The tool works on all platforms. If you're not on Windows or installed WoW in a different place than `C:/Program Files (x86)/World Of Warcaft`, specify the `WOWPATH` environment variable to tell the tool where to work.

## Features
Implemented:
* Install addons from Curse and TukUI.org
* Uninstall addons
* Update addons
* List installed addons
* Cache of addon zip files for reinstalling and the like
* Folder blame

Planned (in no particular order):
* Install addons from git/svn/hg repos
* Better user interface
* .addons.json backups
* Metadata display
* (far future) GUI
* logcat
* Saved variable messing with


## Usage
```text
$ wow
wow: World Of Warcraft Addon Manager
     Completely unassociated with Blizzard

    install <addon-name>: Install an addon
        -s --source Select the source of the addon. Defaults to `curse`
    update [addon]: Updates all addons, or the addon in the first argument.
    uninstall <addon-name>: Uninstall a previously installed addon
    installed: List installed addons
    sources: List available addon sources
```
Currently only supports Curse and TukUI.org addons.

## Legal
Licensed under the MIT license.

**THIS TOOL IS NO WAY AFFILIATED OR APPROVED BY BLIZZARD OR IT'S AFFILIATES.**