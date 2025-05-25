const KFD100_const = {
    SOM_EOM: 0x61,
    SOM_EOM_PLACEHOLDER: 0x62,
    ESC: 0x63,
    ESC_PLACEHOLDER: 0x64
};
const KFDAVR_const = {
    SOM: 0x61,
    SOM_PLACEHOLDER: 0x62,
    EOM: 0x63,
    EOM_PLACEHOLDER: 0x64,
    ESC: 0x70,
    ESC_PLACEHOLDER: 0x71
};

let device = null;
let poly = null;
const serialPortSettings = {
    baudRate: 115200,
    parity: "none",
    dataBits: 8,
    stopBits: 1,
    flowControl: "none"
};
let reader;
let writer;
let exports = {};
let connected = false;

const filterKfdTool = {
    usbVendorId: 0x2047,
    usbProductId: 0x0A7C
};
const filterKfdAvr = {
    usbVendorId: 0x2341,
    usbProductId: 0x0043
};
const filterKfdMicro = {
    usbVendorId: 0x0403,
    usbProductId: 0x6015
};
const filterKfdNano = {

};
const filterKfdPico = {
    usbVendorId: 0x2341,
    usbProductId: 0x8037
};

let serialModelId;

let frameBuffer = [];
let packetBuffer = [];
let packetReady = false;

let newData = false;

let inputStream;

let polySerial = exports.serial;
let myLooping, mySerial;
let polyReader = {};
let polyWriter = {};

let connectionMethod;

let foundStart = false;
let haveStart = false;
let haveEnd = false;

let breakNow = false;

const transferMethod = "RUC";

let port;
let keepReading = true;

async function connectSerial() {
    console.log("connectSerial()");
    connectionMethod = "webserial";
    
    try {
        //port = await navigator.serial.requestPort({filters: [filterKfdTool, filterKfdAvr, filterKfdMicro, filterKfdPico]});
        port = await navigator.serial.requestPort({filters: []});
        let portInfo = port.getInfo();
        if (portInfo.usbVendorId == filterKfdTool.usbVendorId) {
            serialModelId = "KFD100";
        }
        else if (portInfo.usbVendorId == filterKfdAvr.usbVendorId) {
            serialModelId = "KFD-AVR";
        }
        else if (portInfo.usbVendorId == filterKfdMicro.usbVendorId) {
            serialModelId = "KFDMicro";
        }
        else if (portInfo.usbVendorId == filterKfdPico.usbVendorId) {
            serialModelId = "KFDPico";
        }
        else {
            alert("Unsupported device type - KFDweb only supports KFDtool, KFD-AVR, and KFDMicro devices");
            return;
        }
        console.log("Connected to " + serialModelId);

        port.addEventListener("connect", (event) => {
            // Device has been connected
            console.log(event);
        });
        port.addEventListener("disconnect", (event) => {
            // Device has been disconnected
            DisconnectDevice();

            /*
            try {
                console.log(port);
                port.close();
            }
            catch (error) {
                console.error(error);
            }
            DisconnectDevice();
            */
            
        });

        await port.open(serialPortSettings);
        connected = true;

        reader = port.readable.getReader();
    }
    catch(error) {
        console.error("Error", error);
    }
}

async function connectCdcAcm() {
    try {

    }
    catch(error) {
        console.error("Error", error);
    }
}

async function connectPolyfill() {
    console.log("connectPolyfill()");
    connectionMethod = "webusb";

    const sps = {
        baudrate: serialPortSettings.baudRate,
        parity: serialPortSettings.parity,
        bits: serialPortSettings.dataBits,
        stop: serialPortSettings.stopBits,
        overridePortSettings: true,
        deviceFilters: [
            { vendorId: filterKfdTool.usbVendorId, productId: filterKfdTool.usbProductId },
            { vendorId: filterKfdAvr.usbVendorId, productId: filterKfdAvr.usbProductId },
            { vendorId: filterKfdMicro.usbVendorId, productId: filterKfdMicro.usbProductId },
            { vendorId: filterKfdPico.usbVendorId, productId: filterKfdPico.usbProductId }
        ]
    };
    
    let device = new WebUSBSerialDevice(sps);

    try {
        polyPort = await device.requestNewPort();
        if (polyPort.device.vendorId == filterKfdTool.usbVendorId) {
            serialModelId = "KFD100";
        }
        else if (polyPort.device.vendorId == filterKfdAvr.usbVendorId) {
            serialModelId = "KFD-AVR";
        }
        else if (polyPort.device.vendorId == filterKfdMicro.usbVendorId) {
            serialModelId = "KFDMicro";
        }
        else if (polyPort.device.vendorId == filterKfdPico.usbVendorId) {
            serialModelId = "KFDPico";
        }
        else {
            alert("Unsupported device type - KFDweb only supports KFDtool, KFD-AVR, and KFDMicro devices");
            return;
        }

        try {
            await polyPort.connect((data) => {
                //console.log(data);
                //console.log(BCTS(data).join("-"));
                OnDataReceived(Array.from(data));
                setTimeout(() => { polyPort.send(data); }, 10);
            }, (error) => {
                console.warn("Error receiving data: " + error);
            });
        }
        catch(error) {
            console.warn("Error connecting to port: " + error.error)
            console.warn(error);
        }
    }
    catch(error) {
        console.error("Error", error);
    }

    
    /*
    let frameData = CreateFrameKFDAVR([0x11,0x01]);
    frameData = CreateFrameKFDAVR([0x11,0x03]);
    //console.log(frameData);
    let outData = new Uint8Array(frameData);
    let test = polyPort.send(outData);
    //console.log(test);
    */





    

    return;

    try {
        port = await navigator.usb.requestDevice({filters: [filterKfdTool, filterKfdAvr, filterKfdMicro]});
        console.log(port);
        if (port.vendorId == filterKfdTool.usbVendorId) {
            serialModelId = "KFD100";
        }
        else if (port.vendorId == filterKfdAvr.usbVendorId) {
            serialModelId = "KFD-AVR";
        }
        else if (port.vendorId == filterKfdMicro.usbVendorId) {
            serialModelId = "KFDMicro";
        }
        else {
            alert("Unsupported device type - KFDweb only supports KFDtool, KFD-AVR, and KFDMicro devices");
            return;
        }

        //https://github.com/google/web-serial-polyfill/issues/8
        //https://github.com/webusb/arduino
        //https://github.com/Shaped/webusb-ftdi
        await port.open(serialPortSettings);
        await port.selectConfiguration(1);
        port.configuration.interfaces.forEach(element => {
            element.alternates.forEach(elementalt => {
                if (elementalt.interfaceClass==0xff) {
                    this.interfaceNumber_ = element.interfaceNumber;
                    elementalt.endpoints.forEach(elementendpoint => {
                        if (elementendpoint.direction == "out") {
                            port.endpointOut_ = elementendpoint.endpointNumber;
                        }
                        if (elementendpoint.direction=="in") {
                            port.endpointIn_ =elementendpoint.endpointNumber;
                        }
                    });
                }
            });
        });
        //console.log(port);

        //
        //await port.open();
        //
        await port.claimInterface(0);
        let frameData = CreateFrameKFDAVR([17,1]);
        let outData = new Uint8Array(frameData);
        console.log(outData);
        let to = await port.transferOut(port.endpointOut_, outData);
        let inData = await port.transferIn(port.endpointIn_, 64);
        console.log(inData);
        console.log(Array.from(inData.data));

        /*
        await port.transferOut(
            2,
            new Uint8Array(
                new TextEncoder().encode("test value\n")
            ),
        );
        await device.controlTransferOut({
            requestType: "class",
            recipient: "interface",
            request: 0x22,
            value: 0x01,
            index: 0x02
        });
        */

        //await port.close();
        connected = true;

        //reader = port.readable.getReader();

        return;
        port = await exports.serial.requestPort({filters: [filterKfdTool, filterKfdAvr, filterKfdMicro]});
        let portInfo = port.getInfo();

        if (portInfo.usbVendorId == filterKfdTool.usbVendorId) {
            serialModelId = "KFD100";
        }
        else if (portInfo.usbVendorId == filterKfdAvr.usbVendorId) {
            serialModelId = "KFD-AVR";
        }
        else if (portInfo.usbVendorId == filterKfdMicro.usbVendorId) {
            serialModelId = "KFDMicro";
        }
        else {
            alert("Unsupported device type - KFDweb only supports KFDtool, KFD-AVR, and KFDMicro devices");
            return;
        }
        console.log("Connected to " + serialModelId);

        await port.open(serialPortSettings);
        connected = true;

        reader = port.readable.getReader();
    }
    catch (error) {
        console.error(error);
    }
}

async function DisconnectDevice() {
    console.log("disconnecting device");
    if (port) {
        if (port.connected) await port.close();
    }
    else if (usbDevice) {
        if (usbDevice.opened) await usbDevice.close();
    }
    
    connected = false;
    ShowDeviceDisconnected();
}

function CreateFrameKFD100(data) {
    let frameData = [];
    frameData.push(KFD100_const.SOM_EOM);
    data.forEach((b) => {
        if (b == KFD100_const.ESC) {
            frameData.push(KFD100_const.ESC);
            frameData.push(KFD100_const.ESC_PLACEHOLDER);
        }
        else if (b == KFD100_const.SOM_EOM) {
            frameData.push(KFD100_const.ESC);
            frameData.push(KFD100_const.SOM_EOM_PLACEHOLDER);
        }
        else {
            frameData.push(b);
        }
    });
    frameData.push(KFD100_const.SOM_EOM);
    return frameData;
}
function CreateFrameKFDAVR(data) {
    let frameData = [];
    frameData.push(KFDAVR_const.SOM);
    data.forEach((b) => {
        if (b == KFDAVR_const.ESC) {
            frameData.push(KFDAVR_const.ESC);
            frameData.push(KFDAVR_const.ESC_PLACEHOLDER);
        }
        else if (b == KFDAVR_const.SOM) {
            frameData.push(KFDAVR_const.ESC);
            frameData.push(KFDAVR_const.SOM_PLACEHOLDER);
        }
        else if (b == KFDAVR_const.EOM) {
            frameData.push(KFDAVR_const.ESC);
            frameData.push(KFDAVR_const.EOM_PLACEHOLDER);
        }
        else {
            frameData.push(b);
        }
    });
    frameData.push(KFDAVR_const.EOM);
    return frameData;
}

async function SendSerial(data) {
    if (!connected) {
        alert("No device is connected");
        return;
    }
    let frameData;
    if (serialModelId == "KFD100") {
        frameData = CreateFrameKFD100(data);
    }
    else if (serialModelId == "KFD-AVR") {
        frameData = CreateFrameKFDAVR(data);
    }
    else if (serialModelId == "KFDMicro") {
        frameData = CreateFrameKFDAVR(data);
    }
    else if (serialModelId == "KFDPico") {
        frameData = CreateFrameKFDAVR(data);
    }
    
    let outData = new Uint8Array(frameData);
    
    console.log(serialModelId, connectionMethod);
    if (connectionMethod == "webserial") {
        const writer = port.writable.getWriter();
        writer.write(outData);
        writer.releaseLock();
    }
    else if (connectionMethod == "webusb") {
        //await port.send(outData);
        console.log("usb mode:", usbMode);
        //console.log(frameData, outData);
        //await usbDevice.transferOut(4, outData);
        //console.log(usbDevice);
        //if (usbMode == "CDC-ACM") await port.send(outData);//await usbDevice.transferOut(4, outData);
        if (usbMode == "CDC-ACM") await usbDevice.transferOut(usbDevice.endpointOut, outData);//4//2//usbDevice.endpointOut
        else if (usbMode == "FTDI") await port.send(outData);
    }
}

async function readCdcAsm() {
    console.log("readCdcAsm");
    while (usbDevice.opened) {
        try {
            while (true) {
                const result = await usbDevice.transferIn(3, 64);
                let uintArr = new Uint8Array(result.data.buffer);
                OnDataReceived(Array.from(uintArr));
            }
        }
        catch (error) {
            console.error(error);
        }
    }
}

async function readUntilClosed() {
    while (port.connected && port.readable && keepReading) {
        try {
            while (true) {
                const {value, done} = await reader.read();
                if (done) {
                    break;
                }
                await OnDataReceived(Array.from(value));
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            reader.releaseLock();
        }
    }
    //await DisconnectDevice();// disabled becuase it is handled by port.disconnect
}

/*
async function SendAcm(data) {
    frameData = CreateFrameKFDAVR(data);
    let outData = new Uint8Array(frameData);
    await dev.transferOut(this.endpointOut, outData);
}

async function readAcmUntilClosed() {
    let readLoop = () => {
        this.device.transferIn(this.endpointIn, 64).then(result => {
            let value = new Uint8Array(result.data.buffer);
            OnDataReceived(Array.from(value));
            readLoop();
        }, error => {
            this.onReceiveError(error);
        });
    }
}
*/
async function Send(data) {
    if (!connected) {
        alert("No device is connected");
        return;
    }
    let frameData = [];

    frameData.push(SOM_EOM);

    data.forEach(b => {
        if (b == ESC) {
            frameData.push(ESC);
            frameData.push(ESC_PLACEHOLDER);
        }
        else if (b == SOM_EOM) {
            frameData.push(ESC);
            frameData.push(SOM_EOM_PLACEHOLDER_);
        }
        else {
            frameData.push(b);
        }
    });

    frameData.push(SOM_EOM);

    let outData = new Uint8Array(frameData);

    console.log("outData:", BCTS(frameData).join("-"));
    
    if (connectionMethod == "webusb") {
        console.log("sending via polyfill");
        polyWriter.ready.then(() => {
            //let inputArrayBuffer = str2ab(myData2);
            const myWritten = polyWriter.write(frameData);
            console.log("myWritten", myWritten);
        });
        return [];
    }
    
    
    const writer = port.writable.getWriter();
    await writer.write(outData);
    writer.releaseLock();
    return [];
}

async function UnpackResponseKFD100(rsp) {
    console.warn("UnpackResponseKFD100: ", BCTS(rsp).join("-"));
    rsp = Array.from(rsp);
    if ((rsp[0] != KFD100_const.SOM_EOM) || (rsp[rsp.length - 1] != KFD100_const.SOM_EOM)) {
        console.error("invalid packet structure: ", BCTS(rsp).join("-"));
        return [];
    }
    let frameBuffer = [];
    let foundStart = false;
    rsp.forEach((b) => {
        if (b == KFD100_const.SOM_EOM) {
            foundStart = true;
            if (frameBuffer.length > 0) {
                for (var i=0; i<frameBuffer.length; i++) {
                    if (frameBuffer[i] == KFD100_const.ESC) {
                        // this won't work if more than one are removed??
                        frameBuffer = frameBuffer.splice(i + 1);
                        if (i == frameBuffer.length) {
                            console.error("escape character at end");
                        }
                        if (frameBuffer[i] == KFD100_const.ESC_PLACEHOLDER) {
                            frameBuffer[i] = KFD100_const.ESC;
                        }
                        else if (frameBuffer[[i] == KFD100_const.SOM_EOM_PLACEHOLDER]) {
                            frameBuffer[i] = KFD100_const.SOM_EOM;
                        }
                        else {
                            console.error("invalid character after escape character");
                        }
                    }
                }
                //return frameBuffer;
                //let packet = [];
                //packet = packet.concat(frameBuffer);
                //return packet;
            }
            else {
                //haveStart = true;
            }
        }
        else {
            if (foundStart) {
                frameBuffer.push(b);
            }
        }
        //console.log(frameBuffer);
    });
    //return packet;
    return frameBuffer;
}

async function UnpackResponseKFDAVR(data) {
    rsp = Array.from(data);
    //console.log("UnpackResponseKFDAVR", BCTS(rsp).join("-"));
    if ((rsp[0] != KFDAVR_const.SOM) || (rsp[rsp.length - 1] != KFDAVR_const.EOM)) {
        // invalid packet
        console.log("invalid packet structure: ", BCTS(rsp).join("-"));
        return [];
    }

    // Remove the SOM_EOM opcodes
    let temp = rsp.shift();
    temp = rsp.pop();

    let output = [];
    
    for (var i=0; i<rsp.length; i++) {
        if (rsp[i] == KFDAVR_const.ESC) {
            if (i == rsp.length) {
                console.error("escape character at end");
                return [];
            }
            if (rsp[i+1] == KFDAVR_const.ESC_PLACEHOLDER) {
                //rsp[i] = ESC;
                output.push(KFDAVR_const.ESC);
                i++;
                continue;
            }
            else if (rsp[i+1] == KFDAVR_const.SOM_PLACEHOLDER) {
                output.push(KFDAVR_const.SOM);
                i++;
                continue;
            }
            else if (rsp[i+1] == KFDAVR_const.EOM_PLACEHOLDER) {
                output.push(KFDAVR_const.EOM);
                i++;
                continue;
            }
            else {
                console.log("invalid character after escape character");
                return [];
            }
        }
        output.push(rsp[i]);
    }
    console.log("packet:", BCTS(rsp).join("-"));
    return rsp;
}

function UnpackResponse(rsp) {
    //console.log(rsp);
    rsp = Array.from(rsp);
    //console.log("rsp", BCTS(rsp).join("-"));
    if ((rsp[0] != SOM_EOM) || (rsp[rsp.length - 1] != SOM_EOM)) {
        // invalid packet
        console.log("invalid packet structure: ", BCTS(rsp).join("-"));
        return [];
    }

    // Remove the SOM_EOM opcodes
    let temp = rsp.shift();
    temp = rsp.pop();

    let output = [];
    
    for (var i=0; i<rsp.length; i++) {
        if (rsp[i] == ESC) {
            if (i == rsp.length) {
                console.error("escape character at end");
                return [];
            }
            if (rsp[i+1] == ESC_PLACEHOLDER) {
                //rsp[i] = ESC;
                output.push(ESC);
                i++;
                continue;
            }
            else if (rsp[i+1] == SOM_EOM_PLACEHOLDER) {
                //rsp[i] = SOM_EOM;
                output.push(SOM_EOM);
                i++;
                continue;
            }
            else {
                console.log("invalid character after escape character");
                return [];
            }
        }
        output.push(rsp[i]);
    }
    console.log("packet:", BCTS(rsp).join("-"));
    return rsp;
}

async function ReadBytesFromBuffer(timeout, numBytes) {
    let control = true;
    let rsp = [];
    console.log("frameBuffer", BCTS(frameBuffer).join("-"));
    console.log("frameBuffer length", frameBuffer.length);
    rsp = frameBuffer;
    frameBuffer = [];
    return rsp;
}

async function DecodePacketKFD100(data) {
    if ((data[0] != KFD100_const.SOM_EOM) || (data[data.length - 1] != KFD100_const.SOM_EOM)) {
        console.warn("incomplete packet received: ", BCTS(data).join("-"));
    }
    
    let byteCounter = 0;
    //console.log("DecodePacketKFD100:", BCTS(data).join("-"));
    data.forEach((b) => {
        if (b == KFD100_const.SOM_EOM) {
            foundStart = true;
            if (frameBuffer.length > 0) {
                for (var i=0; i<frameBuffer.length; i++) {
                    if (frameBuffer[i] == KFD100_const.ESC) {
                        // this won't work if more than one are removed??
                        //frameBuffer = frameBuffer.splice(i + 1);
                        frameBuffer = frameBuffer.slice(0, i).concat(frameBuffer.slice(i + 1));
                        if (i == frameBuffer.length) {
                            console.error("escape character at end");
                        }
                        if (frameBuffer[i] == KFD100_const.ESC_PLACEHOLDER) {
                            frameBuffer[i] = KFD100_const.ESC;
                        }
                        else if (frameBuffer[[i] == KFD100_const.SOM_EOM_PLACEHOLDER]) {
                            frameBuffer[i] = KFD100_const.SOM_EOM;
                        }
                        else {
                            console.error("invalid character after escape character");
                        }
                    }
                }
                let packet = [];
                packet = packet.concat(frameBuffer);
                packetBuffer.push(packet);
                //console.log("packet:", BCTS(packet).join("-"));
                //console.log("packetBuffer length:", packetBuffer.length);
                frameBuffer = [];
            }
            else {
                haveStart = true;
            }
        }
        else {
            if (foundStart) {
                //frameBuffer.push(b);
            }
           frameBuffer.push(b);
        }
        byteCounter++;
    });
}
async function DecodePacketKFDAVR(data) {
    //console.log("DecodePacketKFDAVR", BCTS(data).join("-"));
    let byteCounter = 0;
    data.forEach((b) => {
        if (b == KFDAVR_const.SOM) {
            foundStart = true;
        }
        else if (b == KFDAVR_const.EOM) {
            if (frameBuffer.length > 0) {
                for (var i=0; i<frameBuffer.length; i++) {
                    if (frameBuffer[i] == KFDAVR_const.ESC) {
                        // this won't work if more than one are removed??
                        //frameBuffer = frameBuffer.splice(i + 1);
                        frameBuffer = frameBuffer.slice(0, i).concat(frameBuffer.slice(i + 1));
                        if (i == frameBuffer.length) {
                            console.error("escape character at end");
                        }
                        if (frameBuffer[i] == KFDAVR_const.ESC_PLACEHOLDER) {
                            frameBuffer[i] = KFDAVR_const.ESC;
                        }
                        else if (frameBuffer[[i] == KFDAVR_const.SOM_PLACEHOLDER]) {
                            frameBuffer[i] = KFDAVR_const.SOM;
                        }
                        else if (frameBuffer[[i] == KFDAVR_const.EOM_PLACEHOLDER]) {
                            frameBuffer[i] = KFDAVR_const.EOM;
                        }
                        else {
                            console.error("invalid character after escape character");
                        }
                    }
                }
                let packet = [];
                packet = packet.concat(frameBuffer);
                packetBuffer.push(packet);
                console.log("packet:", BCTS(packet).join("-"));
                frameBuffer = [];
            }
            else {
                haveStart = true;
            }
        }
        else {
            if (foundStart) {
                frameBuffer.push(b);
            }
            //frameBuffer.push(b);
        }
        byteCounter++;
    });
}

async function OnDataReceived(data) {
    if (data === undefined) {
        return;
    }
    else if (data.length == 0) {
        return;
    }

    if (frameBuffer.length > 0) {
        //console.log("frameBufferStart", BCTS(frameBuffer).join("-"));
    }

    if (serialModelId == "KFD100") {
        await DecodePacketKFD100(data);
    }
    else if (serialModelId == "KFD-AVR") {
        await DecodePacketKFDAVR(data);
    }
    else if (serialModelId == "KFDMicro") {
        await DecodePacketKFDAVR(data);
    }
    else if (serialModelId == "KFDPico") {
        await DecodePacketKFDAVR(data);
    }

    if (packetBuffer.length > 0) {
        packetReady = true;
    }

    if (frameBuffer.length > 0) {
        //console.log("frameBufferEnd", BCTS(frameBuffer).join("-"));
    }
}

function Read(timeout) {
    // NOT DONE YET
    if (packetBuffer.length == 0) {
        if (timeout > 0) {
            if (!packetReady) {
                console.error("timeout waiting for data");
            }
        }
        else if (timeout == 0) {

        }
        else {
            console.error("timeout can not be negative");
        }
    }
    let data = [];
    let packet = ReadPacketFromPacketBuffer();
    data = data.concat(packet);
    packetReady = false;
    return data;
}

async function ReadPacketFromPacketBuffer() {
    if (packetBuffer.length == 0) {
        await CheckPacketBufferUntilPopulated();
    }
    let packet = packetBuffer[0];
    packetBuffer = packetBuffer.splice(1);
    return packet;
}

async function CheckPacketBufferUntilPopulated() {
    console.warn("CheckPacketBufferUntilPopulated");
    let counter = 0;
    while((packetBuffer.length == 0) && (breakNow == false)) {
        if (counter > 100) {
            alert("Communication error: check that radio is connected and in Keyloading mode");
            break;
        }
        console.warn("wait");
        
        if (serialModelId == "KFD100") {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        else if (serialModelId == "KFD-AVR") {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        else if (serialModelId == "KFDMicro") {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        else if (serialModelId == "KFDPico") {
            await new Promise(resolve => setTimeout(resolve, 10));
        }
        counter++;
    }
    return;
}