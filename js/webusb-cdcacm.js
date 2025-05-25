class WebUSBCdcPort {
	constructor(device, portConfiguration) {
		this.device = device;
		this.portConfiguration = portConfiguration;

		this.interfaceNumber = 0;
		this.endpointIn = 0;
		this.endpointOut = 0;

		this.packetsReceived = 0;

		this.usbMode = "CDC-ACM";
	}

	connect(receiveCallback, errorCallback) {
		this.onReceive = receiveCallback;
		this.onReceiveError = errorCallback;

		let readLoop = () => {
			console.log("readLoop");
			this.device.transferIn(this.endpointIn, 64).then(result => {
				let resultArray = new Uint8Array(result.data.buffer);
				console.warn("device.transferIn", resultArray);

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
				console.log("interfaces:")
				console.log(interfaces)
				interfaces.forEach(element => {
					console.log("interface.element", element);
					element.alternates.forEach(elementalt => {
						console.log("element.alternate", elementalt);
						if (elementalt.interfaceClass==0x0A) {
							console.log("interfaceClass 0x0A", elementalt);
							this.interfaceNumber = element.interfaceNumber;
							elementalt.endpoints.forEach(elementendpoint => {
								console.log("alternate.endpointname", elementendpoint);
								if (elementendpoint.direction == "out") {
									console.log("out", elementendpoint);
									this.endpointOut = elementendpoint.endpointNumber;
								}
								if (elementendpoint.direction=="in") {
									console.log("in", elementendpoint);
									this.endpointIn = elementendpoint.endpointNumber;
								}
							})
						}
					})
				})
				console.log("in", this.endpointIn);
				console.log("out", this.endpointOut);
				//console.log(this);
			})
			.then(() => this.device.claimInterface(this.interfaceNumber))
			.then(() => this.device.selectAlternateInterface(this.interfaceNumber, 0))
/*
			.then(() => {
				this.device.controlTransferOut({
					requestType: "class",
					recipient: "interface",
					request: 0x22,
					value: 0x01,
					index: this.interfaceNumber
				});
			}).then((result) => console.log(result))
*/
/*			
			.then(() => {
				this.device.controlTransferIn({
					requestType: "standard",
					recipient: "device",
					request: 0x06,
					value: 0x0302,
					index: 0x0409
				}, 255)
			}).then((result) => console.log(result))
*/
			.then(() => {
				console.log(this);
				//console.log(res);
				readLoop();
				return this.device;
			});
	}

	send(data) {
		console.log("send", data);
		//return this.device.transferOut(this.endpointOut, data);
		this.device.transferOut(this.endpointOut, data)
		.then((result) => console.log(result));
		return;
	}

	disconnect() {
		this.device.close();
	}
}

class WebUSBCdcDevice {
	constructor(configuration) {
		if (!("usb" in navigator)) {
			throw new Error("USB Support not available!");
		}
		this.configuration = configuration || {
			deviceFilters: []
		}
		this.devices = [];
	}

	async getAvailablePorts() {
	    this.devices = await navigator.usb.getDevices();
    	return this.devices.map(device => new WebUSBCdcPort(device));
	}

	async requestNewPort() {
		try {
			let device = await navigator.usb.requestDevice({
				filters : this.configuration.deviceFilters
			});
			if (!(device in this.devices)) this.devices.push(device);
			return new WebUSBCdcPort(device, this.configuration);
		} catch (e) {
			throw new Error(e);
		}
	}
}