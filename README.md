# nordvpn-extension

## What
A browser extension to toggle your machine's NordVPN connection status.

## Why
For NordVPN users who need to quickly turn on/off their VPN service before visiting certain websites.

### `extension` directory
Contains code which runs in the browser (Chrome or Firefox)

### `host` directory
Contains code which will run on the users machine. Includes scripts for installation and removal.

### TODO's
- Add support for Firefox extension
- Add install script for both Chrome and Firefox locations
- Add uninstall script for both Chrome and Firefox locations
- Rename index.js to something more descriptive of it's purpose
- Refactor nordvpn_toggle.js (make it look production ready, for other people to take a look)
- Add README section for getting your NordVPN credentials into the script (`.env` file)
- Initialize connection status with result of `nordvpn status`