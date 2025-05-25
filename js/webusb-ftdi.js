/*
	WebUSB FTDI Driver v0.01a
	(C) 2020 Shaped Technologies (Jai B.)

	GPL v2 free for personal use / commercial or closed source use requires commercial license - contact us.

	This wouldn't have been possible without the Linux driver, so shoutout to the developers of that!

	Data Transfer Efficiency / Bulk Transfers Technical Note
	https://www.ftdichip.com/Support/Documents/TechnicalNotes/TN_103_FTDI_USB_Data_Transfer_Efficiency(FT_000097).pdf

	Chipset feature comparison:
	https://www.ftdichip.com/Support/Documents/TechnicalNotes/TN_107%20FTDI_Chipset_Feature_Comparison.pdf

	https://www.ftdichip.com/Support/Documents/AppNotes/AN232B-04_DataLatencyFlow.pdf

*/

class WebUSBSerialPort {
	/* Commands */
	#FTDI_SIO_RESET 				= 0x00; /* Reset the port */
	#FTDI_SIO_MODEM_CTRL			= 0x01; /* Set the modem control register */
	#FTDI_SIO_SET_FLOW_CTRL 		= 0x02; /* Set flow control register */
	#FTDI_SIO_SET_BAUD_RATE 		= 0x03; /* Set baud rate */
	#FTDI_SIO_SET_DATA				= 0x04; /* Set the data characteristics of the port */
	#FTDI_SIO_GET_MODEM_STATUS		= 0x05; /* Retrieve current value of modem status register */
	#FTDI_SIO_SET_EVENT_CHAR		= 0x06; /* Set the event character */
	#FTDI_SIO_SET_ERROR_CHAR		= 0x07; /* Set the error character */
	#FTDI_SIO_SET_LATENCY_TIMER		= 0x09; /* Set the latency timer */
	#FTDI_SIO_GET_LATENCY_TIMER 	= 0x0a; /* Get the latency timer */
	#FTDI_SIO_SET_BITMODE			= 0x0b; /* Set bitbang mode */
	#FTDI_SIO_READ_PINS				= 0x0c; /* Read immediate value of pins */
	#FTDI_SIO_READ_EEPROM			= 0x90; /* Read EEPROM */

	/*
		FTDI_SIO_GET_LATENCY_TIMER

		Set the timeout interval. The FTDI collects data from the
		device, transmitting it to the host when either A) 62 bytes are
		received, or B) the timeout interval has elapsed and the buffer
		contains at least 1 byte.  Setting this value to a small number
		can dramatically improve performance for applications which send
		small packets, since the default value is 16ms.

		BmRequestType:   1100 0000b
		bRequest:        FTDI_SIO_GET_LATENCY_TIMER
		wValue:          0
		wIndex:          Port
		wLength:         0
		Data:            latency (on return)
	*/
	#FTDI_SIO_GET_LATENCY_TIMER_REQUEST = this.#FTDI_SIO_GET_LATENCY_TIMER;

	/*
		FTDI_SIO_SET_LATENCY_TIMER

		Set the timeout interval. The FTDI collects data from the
		device, transmitting it to the host when either A) 62 bytes are
		received, or B) the timeout interval has elapsed and the buffer
		contains at least 1 byte.  Setting this value to a small number
		can dramatically improve performance for applications which send
		small packets, since the default value is 16ms.

		BmRequestType:   0100 0000b
		bRequest:        FTDI_SIO_SET_LATENCY_TIMER
		wValue:          Latency (milliseconds)
		wIndex:          Port
		wLength:         0
		Data:            None

		wValue:
		B0..7   Latency timer
		B8..15  0

	*/
	#FTDI_SIO_SET_LATENCY_TIMER_REQUEST = this.#FTDI_SIO_SET_LATENCY_TIMER;


	constructor(device, portConfiguration) {
		this.device = device;
		this.portConfiguration = portConfiguration;

		this.interfaceNumber = 0;
		this.endpointIn = 0;
		this.endpointOut = 0;

		this.modemStatusByte = 0;
		this.lineStatusByte = 0;

		this.packetsReceived = 0;

		this.usbMode = "none";
	}

	connect(receiveCallback, errorCallback) {
		this.onReceive = receiveCallback;
		this.onReceiveError = errorCallback;

		let readLoop = () => {
			this.device.transferIn(this.endpointIn, 64).then(result => {
				let resultArray = new Uint8Array(result.data.buffer);
				//console.warn("device.transferIn", resultArray);

				if (this.usbMode == "FTDI") {
					if (resultArray[0] != this.modemStatusByte)
					this.modemStatusByte = resultArray[0];

				if (resultArray[1] != this.lineStatusByte)
					this.lineStatusByte = resultArray[1];
				}

				if (resultArray.length > 2) {
					console.warn("device.transferIn", resultArray);
					//console.log(resultArray);
					//console.log(connectionMethod);

					let offset = 0;
					// KFDmicro
					if (serialModelId == "KFD100") offset = 0;
					else if (serialModelId == "KFD-AVR") offset = 2;
					else if (serialModelId == "KFDMicro") offset = 2;

					let dataArray = new Uint8Array(resultArray.length - offset);
					for (let x=offset;x<resultArray.length;x++) {
						dataArray[x - offset] = resultArray[x];
					}

					/*
					KFDMicro
					let dataArray = new Uint8Array(resultArray.length - 2);
					for (let x=2;x<resultArray.length;x++) {
						dataArray[x - 2] = resultArray[x];
					}
					*/
					
					/*
					// KFDtool
					let dataArray = new Uint8Array(resultArray.length);
					for (let y=0;y<resultArray.length;y++) {
						dataArray[y] = resultArray[y];
					}
					*/
					this.onReceive(dataArray);
				}
				else {
					this.packetsReceived = this.packetsReceived + 1;
				}
				readLoop();
			}, error => {
				this.onReceiveError(error);
			});
		};

		return this.device.open()
			.then(() => {
				if (this.device.configuration === null) {
					return this.device.selectConfiguration(1);
				}
			})
			.then(() => {
				var interfaces = this.device.configuration.interfaces;
				console.log("interfaces:", interfaces);
				interfaces.forEach(element => {
					element.alternates.forEach(elementalt => {
						if (elementalt.interfaceClass==0xFF) {
							this.usbMode = "FTDI";
							console.log("interfaceClass 0xFF", elementalt);
							this.interfaceNumber = element.interfaceNumber;
							elementalt.endpoints.forEach(elementendpoint => {
								if (elementendpoint.direction == "out") {
									console.log("out", elementendpoint);
									this.endpointOut = elementendpoint.endpointNumber;
								}
								if (elementendpoint.direction=="in") {
									console.log("in", elementendpoint);
									this.endpointIn = elementendpoint.endpointNumber;
								}
							});
						}
/*
						else if (elementalt.interfaceClass==0x0A) {
							this.usbMode = "CDC-ACM";
							console.log("interfaceClass 0x0A", elementalt);
							this.interfaceNumber = element.interfaceNumber;
							elementalt.endpoints.forEach(elementendpoint => {
								if (elementendpoint.direction == "out") {
									console.log("out", elementendpoint);
									this.endpointOut = elementendpoint.endpointNumber;
								}
								if (elementendpoint.direction=="in") {
									console.log("in", elementendpoint);
									this.endpointIn = elementendpoint.endpointNumber;
								}
							});
						}
*/
					});
				});
				console.log("in", this.endpointIn);
				console.log("out", this.endpointOut);
				//console.log(this);
			})
			.then(() => this.device.claimInterface(this.interfaceNumber))
			.then(() => this.device.selectAlternateInterface(this.interfaceNumber, 0))
			.then(() => {
				if (this.usbMode == "FTDI") {
					let baud = this.portConfiguration.baudrate;
					this.device.controlTransferOut({
						requestType: "vendor",
						recipient: "device",
						request: this.#FTDI_SIO_SET_BAUD_RATE,
						value: this.getBaudDivisor(baud), // divisor_value
						index: this.getBaudBase() // divisor_index
					});
				}
			})
			.then(() => {
				//console.log(this.device);
				if (this.usbMode == "FTDI") {
					return this.device.controlTransferIn({
						requestType: "vendor",
						recipient: "device",
						request: this.#FTDI_SIO_GET_LATENCY_TIMER_REQUEST,
						value: 0,
						index: 0
					}, 1);
				}
			})
			.then((res) => {
				//console.log(res);
				if (this.usbMode == "FTDI") {
					this.device.latencyTimer = new Uint8Array(res.data.buffer)[0];
					//console.log("Current Latency Timer: ");
					//console.log(this.device.latencyTimer);
					if (this.device.latencyTimer != 1) {
						//console.log("Setting latency timer to 1")
						return this.device.controlTransferOut({
							requestType: "vendor",
							recipient: "device",
							request: this.#FTDI_SIO_SET_LATENCY_TIMER_REQUEST,
							value: 1,
							index: 0
						});
					}
				}
			})
			.then((res) => {
				if (this.usbMode == "FTDI") {
					//console.log(res, this.device);
					return this.device.latencyTimer = this.device.controlTransferIn({
						requestType: "vendor",
						recipient: "device",
						request: this.#FTDI_SIO_GET_LATENCY_TIMER_REQUEST,
						value: 0,
						index: 0
					}, 1);
				}
			})
			.then((res) => {
				//console.log(res);
				/*
				if (this.usbMode == "CDC-ACM") {
					this.device.controlTransferOut({
						requestType: "class",
						recipient: "interface",
						request: 0x22,
						value: 0x01,
						index: this.interfaceNumber
					})
					.then(() => readLoop());
				}
				else {
					//this.device.latencyTimer = new Uint8Array(res.data.buffer)[0];
					//readLoop();
				}
				*/

				if (this.usbMode == "FTDI") this.device.latencyTimer = new Uint8Array(res.data.buffer)[0];
				//this.device.latencyTimer = new Uint8Array(res.data.buffer)[0];
				readLoop();
				return this.device;
			});
	}

	DIV_ROUND_CLOSEST(x, divisor)
	{						
		let __x = x;				
		let __d = divisor;			
		return ((((x))-1) > 0 ||
			(((divisor))-1) > 0 ||
			(((__x) > 0) == ((__d) > 0))) ?
			(((__x) + ((__d) / 2)) / (__d)) :
			(((__x) - ((__d) / 2)) / (__d));
	}
	
	getBaudBase() {
		return 48000000;
	}

	getBaudDivisor(baud) {
		let base = this.getBaudBase();
		let divfrac = new Uint8Array(8);
		divfrac = [ 0, 3, 2, 4, 1, 5, 6, 7 ];

		let divisor = 0;

		let divisor3 = this.DIV_ROUND_CLOSEST(base, 2 * baud);
		divisor = divisor3 >> 3;
		divisor |= divfrac[divisor3 & 0x7] << 14;
		/* Deal with special cases for highest baud rates. */
		if (divisor == 1)
			divisor = 0;
		else if (divisor == 0x4001)
			divisor = 1;
		return divisor;
	}

	send(data) {
		//console.log(this, data);
		//return this.device.transferOut(this.endpointOut, data);
		this.device.transferOut(this.endpointOut, data)
		.then((result) => console.log(result));
		return;
	}

	disconnect() {
		if (this.device.opened) this.device.close();
	}
}

class WebUSBSerialDevice {
	constructor(configuration) {
		if (!("usb" in navigator)) {
			throw new Error('USB Support not available!');
		}

		this.configuration = configuration || {
			// Whether or not to override/specify baud/bits/stop/parity
			overridePortSettings: false,
			
			// Default settings, only used when overridden
			baudrate: 9600,
			bits: 8,
			stop: 1,
			parity: false,

			// Some default FTDI device IDs
			// you can replace these with any device that has
			// an ftdi chip.
			deviceFilters: [
				/*{ 'vendorId' : 0x0403, 'productId' : 0x6000 },
				{ 'vendorId' : 0x0403, 'productId' : 0x6001 },
				{ 'vendorId' : 0x0403, 'productId' : 0x6010 },
				{ 'vendorId' : 0x0403, 'productId' : 0x6011 },
				{ 'vendorId' : 0x0403, 'productId' : 0x6014 }*/
			]
		}
		this.devices = [];
	}

	async getAvailablePorts() {
		this.devices = await navigator.usb.getDevices();
		return this.devices.map(device => new WebUSBSerialPort(device));
	}

	async requestNewPort() {
		try {
			let device = await navigator.usb.requestDevice({
				filters : this.configuration.deviceFilters
			});
			if (!(device in this.devices)) this.devices.push(device);
			return new WebUSBSerialPort(device, this.configuration);
		} catch (e) {
			throw new Error(e);
		}
	}
}