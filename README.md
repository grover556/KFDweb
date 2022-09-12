# KFDweb

Open Source browser-based GUI for [KFDtool](https://github.com/KFDtool/KFDtool)
Compliant with P25 standards (TIA-102.AACD-A)


Features
----------------
KFDweb is designed to interface with the KFDtool and [KFDshield](https://store.omahacomms.com/product/kfdshield/) hardware adapters (TWI/3WI/Three Wire Interface).

[Use KFDweb here now](https://4dkfire.com/KFDweb)

**Key Fill Device (KFD)**

The KFDtool software supports KFD features through the KFDtool hardware adapter (TWI/3WI/Three Wire Interface), as well as through a IP (UDP) connection (DLI/Data Link Independent interface).

Keys and groups of keys can be saved to an AES-256 encrypted key container file, which can then be selected and loaded into a target device in one operation.

Supported Manual Rekeying Features (TIA-102.AACD-A)

* 2.3.1 Keyload
* 2.3.2 Key Erase
* 2.3.3 Erase All Keys
* 2.3.4 View Key Info
* 2.3.5 View Individual RSI
* 2.3.6 Load Individual RSI
* 2.3.7 View KMF RSI
* 2.3.8 Load KMF RSI
* 2.3.9 View MNP
* 2.3.10 Load MNP
* 2.3.11 View Keyset Info
* 2.3.12 Activate Keyset

Key validators/generators are available for the following algorithms:

* AES-256 (Algorithm ID 0x84)
* DES-OFB (Algorithm ID 0x81)
* DES-XL (Algorithm ID 0x9F)
* ADP/RC4 (Algorithm ID 0xAA)


Hardware Compatibility
----------------
* Mobile Radio (MR) Emulator is not supported at this time
* Data Link Independent (DLI) functions are not supported (IP/UDP)
* KFDtool users will need to update to the latest firmware (v1.4.0 or greater) in order to be compatible. Firmware is available for download [here](https://kfdtool.com/download#1.4.0)
* KFDshield users should be able to use current firmware without any issues


Browser and OS Compatibility
----------------
* Chrome, Edge, and Opera browsers are supported at this time, on both MacOS and Windows operating systems. Support for Android based devices is in development
* KFDweb relies on the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) to function. Currently, this is only supported on Chrome, Edge, and Opera browsers. Check [here](https://caniuse.com/web-serial) or [here](https://caniuse.com/mdn-api_serial) to see if your current browser supports this API
* KFDweb software will run on any [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) HTTP server, including HTTPS and localhost deployments


Documentation
----------------
A video showing basic features is [available for viewing here](https://github.com/grover556/KFDweb/raw/main/KFDweb_demo_final.mp4)


License/Legal
----------------
KFDweb software is distributed under the MIT License (see [LICENSE.txt](https://github.com/grover556/KFDweb/blob/main/LICENSE)).

All product names, trademarks, registered trademarks, logos, and brands are property of their respective owners.
All company, product, and service names used are for identification purposes only. Use of these names, trademarks, logos, and brands does not imply endorsement.

Included open-source components:
* [KFDtool](https://github.com/KFDtool/KFDtool) - MIT License
* [KFD-AVR](https://github.com/omahacommsys/KFDtool) - MIT License
* [pako](https://github.com/nodeca/pako) - MIT License
* [CryptoJS](https://code.google.com/archive/p/crypto-js/) - New BSD License
* [jQuery](https://jquery.org) - MIT License
* [Serial API Polyfill](https://github.com/google/web-serial-polyfill) - Apache License