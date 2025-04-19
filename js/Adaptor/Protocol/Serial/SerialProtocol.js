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
    usbVendorId: 0x2341
};
const filterKfdMicro = {
    //usbVendorId: 0x2341
    usbVendorId: 0x0403
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
    connectionMethod = "ws";
    
    try {
        port = await navigator.serial.requestPort({filters: [filterKfdTool, filterKfdAvr, filterKfdMicro]});
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

        port.addEventListener("connect", (event) => {
            // Device has been connected
            console.log(event);
        });
        port.addEventListener("disconnect", (event) => {
            // Device has been disconnected
            try {
                port.close();
            }
            catch (error) {
                console.error(error);
            }
            DisconnectDevice();
            
        });

        await port.open(serialPortSettings);
        connected = true;

        reader = port.readable.getReader();
    }
    catch(error) {
        console.error("Error", error);
    }
}

async function connectPolyfill() {
    console.log("connectPolyfill()");
    connectionMethod = "poly";
    try {
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
    await port.close();
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

    let outData = new Uint8Array(frameData);
    
    if (connectionMethod == "poly") {
        //console.log("sending via polyfill");
        polyWriter.ready.then(() => {
            const myWritten = polyWriter.write(frameData);
            //console.log("myWritten", myWritten);
        });
        return [];
    }
    else {
        const writer = port.writable.getWriter();
        writer.write(outData);
        writer.releaseLock();
    }
}

async function readUntilClosed() {
    while (port.readable && keepReading) {
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
    await DisconnectDevice();
}

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
    
    if (connectionMethod == "poly") {
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
                        frameBuffer = frameBuffer.splice(i + 1);
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
        if (counter > 100) break;
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
        counter++;
    }
    return;
}