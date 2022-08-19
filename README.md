# KFDTool-Web

Open Source browser-based GUI for [KFDtool](https://github.com/KFDtool/KFDtool)
Compliant with P25 standards (TIA-102.AACD-A)

Features
----------------
KFDtool-Web is designed to interface with the KFDtool hardware adapter (TWI/3WI/Three Wire Interface). Currently, desktop versions of Chrome, Edge, and Opera are compatible with KFDtool-Web, but support will soon allow for support on Android devices using Chrome.

Key Containers can be transerred back and forth between KFDtool software (Windows), version 1.5.1 and greater.

Compatibility
----------------
* KFDtool-Web software will run on any [secure context](https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts) HTTP server, including localhost deployments.
* KFDtool-Web relies on the [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API) to function. Currently, this is only supported on Chrome and Opera browsers. Check [here](https://caniuse.com/web-serial) or [here](https://caniuse.com/mdn-api_serial) to see if your current browser supports this API.