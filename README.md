# KFDweb

Open Source browser-based GUI for [KFDtool](https://github.com/KFDtool/KFDtool)
Compliant with P25 standards (TIA-102.AACD-A)

Features
----------------
KFDweb is designed to interface with the KFDtool and [KFDshield](https://store.omahacomms.com/product/kfdshield/) hardware adapters (TWI/3WI/Three Wire Interface). Currently, desktop versions of Chrome, Edge, and Opera are compatible with KFDweb, but support will soon allow for support on Android devices using Chrome.

Key Containers can be transerred back and forth between KFDtool software (Windows), version 1.5.1 and greater.

Compatibility
----------------
* KFDweb software will run on any [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) HTTP server, including localhost deployments.
* KFDweb relies on the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) to function. Currently, this is only supported on Chrome, Edge, and Opera browsers. Check [here](https://caniuse.com/web-serial) or [here](https://caniuse.com/mdn-api_serial) to see if your current browser supports this API.

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