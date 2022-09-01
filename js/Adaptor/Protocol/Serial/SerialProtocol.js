/*
const SOM_EOM = 0x61;
const SOM_EOM_PLACEHOLDER = 0x62;
const ESC = 0x63;
const ESC_PLACEHOLDER = 0x64;
*/

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
//let port = null;
let poly = null;
const serialPortSettings = {
    baudRate: 115200,
    //baudRate: 9600,
    parity: "none",
    dataBits: 8,
    stopBits: 1,
    flowControl: "none"
    //flowControl: "hardware"
};
let reader;
//let writer;
let exports = {};
let connected = false;
const filterKfdTool = {//
    usbVendorId: 0x2047
};
const filterKfdAvr = {
    usbVendorId: 0x2341
};

let serialModelId;

let frameBuffer = [];
let packetBuffer = [];

let newData = false;

//const decoder = new TransformStream();
let inputStream;
//const encoder = new TransformStream();
//let outputStream;

let polySerial = exports.serial;
let myLooping, mySerial;
let polyReader = {};
let polyWriter = {};

let connectionMethod;

let foundStart = false;
let haveStart = false;
let haveEnd = false;

//https://hpssjellis.github.io/web-serial-polyfill/desktop-serial05.html
let port;
let keepReading = true;
//let writer;
async function connectSerial() {
    console.log("connectSerial()");
    connectionMethod = "ws";
    
    try {
        port = await navigator.serial.requestPort({filters: [filterKfdTool, filterKfdAvr]});
        
        let portInfo = port.getInfo();
        if (portInfo.usbVendorId == filterKfdTool.usbVendorId) {
            serialModelId = "KFD100";
        }
        else if (portInfo.usbVendorId == filterKfdAvr.usbVendorId) {
            serialModelId = "KFD-AVR";
        }
        else {
            alert("Unsupported device type - KFDweb only supports KFDtool and KFD-AVR devices");
            return;
        }
        console.log("Connected to " + serialModelId);

        port.addEventListener("connect", (event) => {
            // Device has been connected
/*
            //$("#iconConnectionStatus").removeClass("connection-status-disconnected");
            //$("#iconConnectionStatus").addClass("connection-status-connected");
            $("#iconConnectionStatus").css("background-color", "#aaffaa");
            $("#buttonConnectKfd").prop("disabled", true);
            $("#buttonDisconnectKfd").prop("disabled", false);
*/
            console.log(event);
        });
        port.addEventListener("disconnect", (event) => {
            // Device has been disconnected
/*
            //$("#iconConnectionStatus").removeClass("connection-status-connected");
            //$("#iconConnectionStatus").addClass("connection-status-disconnected");
            connected = false;
            //port.close();
            $("#iconConnectionStatus").css("background-color", "#ffaaaa");
            $("#buttonConnectKfd").prop("disabled", false);
            $("#buttonDisconnectKfd").prop("disabled", true);
            $("#connectionStatus").text("Disconnected");
            $("#deviceProperties").html("");
*/
            console.log(port);
            console.log(event);
            
            try {
                //reader.cancel();
                port.close();
            }
            catch (error) {
                console.error(error);
            }
            DisconnectDevice();
            
        });

        await port.open(serialPortSettings);
        connected = true;

        //writer = await port.writable.getWriter();
        //reader = await port.readable.getReader();

        //readUntilClosed();
        //const closedPromise = readUntilClosed();
        
/*
        // THIS BLOCK WORKS IN THE SIMPLE IMPLEMENTATION
        const decoder = new TransformStream();
        //port.readable.pipeTo(decoder.writable);
        
        //const inputStream = decoder.readable;
        inputStream = decoder.readable;
        //const reader = inputStream.getReader();
*/


        // const encoder = new TextEncoderStream();
        //outputDone = encoder.readable.pipeTo(port.writable);
        //outputStream = encoder.writable;

        //https://codelabs.developers.google.com/codelabs/web-serial#0
        //https://github.com/GoogleChrome/web.dev/blob/main/src/site/content/en/blog/serial/index.md#read-port
        //https://rmarketingdigital.com/en/dev/read-and-write-from-a-serial-port/
        //const decoder = new TransformStream();
        /*
        port.readable.pipeTo(decoder.writable);
        
        //const inputStream = decoder.readable;
        //inputStream = decoder.readable;
        inputStream = decoder.readable
            .pipeThrough(new TransformStream(new ReadableStream() {
                start(controller) {
                    // The following function handles each data chunk
                    function push() {
                        // done is a boolean and value is a Uint8Array
                        reader.read().then(({done, value}) => {
                            // If there is no more data to read
                            if (done) {
                                console.log("done", done);
                                controller.close();
                                return;
                            }
                            // Get the data and send it to the browser via the controller
                            controller.enqueue(value);
                            // Check chunks by logging to the console
                            console.log(done, value);
                            push();
                        });
                    }
                    push();
                }
            }));
        const reader = inputStream.getReader();
        readLoop();
        */

        /*
        while (port.readable) {
            const reader = port.readable.getReader();
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        break;
                    }
                    console.log(value);
                }
            }
            catch (error) {
                console.error(error);
            }
            finally {
                reader.releaseLock();
            }
        }
        */
        
        /*
        let log = { content: [] };
        while (true) {
            const { value, done } = await reader.read();
            if (value) {
                //frameBuffer = Array.from(value.value);
                frameBuffer.push(value);
            }
            if (done) {
                console.log(value);
                console.log("readLoop DONE", done);
                reader.releaseLock();
                break;
            }
        }
        */
        
        // THIS BLOCK FROM
        //https://hpssjellis.github.io/web-serial-polyfill/desktop-serial05.html
        /*
        //const decoder = new TextDecoderStream();
        const decoder = new TransformStream();
        port.readable.pipeTo(decoder.writable);
        
        const inputStream = decoder.readable;
        const reader = inputStream.getReader();
        
        //writer = port.writable.getWriter();
        
        while (true) {
            const { value, done } = await reader.read();
            console.log(value, done);
            if (value) {
                console.log(value);
                //$("#serialNumber").text(value);
                //DecodeMessage();
            }
            if (done) {
                console.log("[readLoop] DONE", done);
                console.log(value);
                reader.releaseLock();
                break;
            }
        }
        console.log(port);
        */

        /*
        //https://wicg.github.io/serial/
        while (port.readable) {
            const reader = port.readable.getReader();
            try {
                while (true) {
                    const { value, done } = await reader.read();
                    if (done) {
                        break;
                    }
                    console.log(valeu);
                }
            }
            catch (error) {
                console.error(error);
            }
            finally {
                reader.releaseLock();
            }
        }
        */
        //readUntilClosed();
    }
    catch(e) {
        console.error("Error", e);
    }
}

async function DisconnectDevice() {
    //reader.cancel();
    console.log("disconnecting device");
    await port.close();
    connected = false;
    ShowDeviceDisconnected();
}

async function readWithTimeout(timeout) {
    //https://wicg.github.io/serial/
    console.log("readWithTimeout", timeout);
    //const reader = port.readable.getReader();
    reader = port.readable.getReader();
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
        console.log("timed out");
        console.log("releasing log 1");
        reader.releaseLock();
        console.log("released log 1");
        console.error("readWithTimeout", "timeout exceeded");
        //throw "timeout exceeded";
        //return [];
    }, timeout);
    const result = await reader.read();// Uncaught (in promise) after sending 61-17-00-C1-61
    console.log("clearing timeout");
    clearTimeout(timer);
    if (!timedOut) {
        //console.log("releasing log 2");
        reader.releaseLock();
        //console.log("released log 2");
    }
    let rsp = UnpackResponse(result.value);
    return rsp;
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
    //https://hpssjellis.github.io/web-serial-polyfill/desktop-serial05.html
    //console.log("SendSerial", data);
    if (!connected) {
        alert("No device is connected");
        return;
    }


// Native KFDtool    
/*
    let frameData = [];
    frameData.push(SOM_EOM);
    data.forEach((b) => {
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
*/

    let frameData;
    if (serialModelId == "KFD100") {
        frameData = CreateFrameKFD100(data);
    }
    else if (serialModelId == "KFD-AVR") {
        frameData = CreateFrameKFDAVR(data);
    }

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
    else {
        //console.log("here1");
        const writer = port.writable.getWriter();
        //console.log("here2");
        writer.write(outData);//REMOVED await
        //console.log("here3");
        writer.releaseLock();
    }
}

async function readUntilClosed() {
    while (port.readable && keepReading) {
        reader = port.readable.getReader();
        try {
            while (true) {
                const {value, done} = await reader.read();
                if (done) {
                    // reader has been canceled
                    //reader.releaseLock();
                    break;
                }
                //console.log("readUntilClosed", BCTS(value).join("-"));
                await OnDataReceived(Array.from(value));
                //frameBuffer = frameBuffer.concat(Array.from(value));
                //console.log("frameBuffer BCTS", BCTS(frameBuffer).join("-"));
                //let rsp = UnpackResponse(value);
                //return rsp;
            }
        }
        catch (error) {
            console.error(error);
        }
        finally {
            reader.releaseLock();
        }
    }
    //await port.close();
    await DisconnectDevice();
}

async function Send(data) {
    if (!connected) {
        alert("No device is connected");
        return;
    }
    //console.log("send", data);
    //let frameBuffer = [];
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
    // THIS BLOCK ONLY LETS ME READ IMMEDIATELY AFTER A WRITE
    let reader = inputStream.getReader();
    await reader.read()
    .then((value, done) => {
        console.log(value, done);
        frameBuffer = Array.from(value.value);
        reader.releaseLock();
        //return value.value;
        //return Array.from(value.value);
    });
    writer.releaseLock();
    return frameBuffer;
    








    /*
    const writer = port.writable.getWriter();
    writer.write(outData)
    .then(() => {
        writer.releaseLock();
        const decoder = new TransformStream();
        port.readable.pipeTo(decoder.writable);
        const inputStream = decoder.readable;
        const reader = inputStream.getReader();
        //let response = await reader.read();
        //console.log(response);
        
        reader.read()
        .then((value, done) => {
            console.log(value);
            reader.releaseLock();
            //resolve(value.value);
            //return value.value;
        })
        .finally(() => {
            console.log("reader finally");
        });
        
    })
    .finally(() => {
        console.log("writer finally");
    });
    */
    
    /*
    const writer = port.writable.getWriter();
    let writeResult = await writer.write(outData);
    //writer.releaseLock();
    const decoder = new TransformStream();
    port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable;
    const reader = inputStream.getReader();
    let readResult = await reader.read();
    //reader.releaseLock();
    writer.releaseLock();
    reader.releaseLock();
    console.log(readResult.value);
    return readResult.value;
    */
}

//https://hpssjellis.github.io/web-serial-polyfill/desktop-serial05.html
async function connectPolyfill() {
    //https://rmarketingdigital.com/en/dev/read-and-write-from-a-serial-port/
    console.log("connectPolyfill()");
    connectionMethod = "poly";
    
    //https://github.com/google/web-serial-polyfill/issues?q=is%3Aissue+is%3Aclosed
    //chrome://device-log
    //chrome://usb-internals
    //https://github.com/google/web-serial-polyfill/issues/14
    //https://stackoverflow.com/questions/67910528/tried-to-connect-a-device-to-web-via-webusb-but-failed-to-claim-interface-acc
    //https://developer.mozilla.org/en-US/docs/Web/API/USBDevice/claimInterface
    //https://stackoverflow.com/questions/65152371/is-there-a-way-to-get-chrome-to-forget-a-device-to-test-navigator-usb-requestd
    //https://github.com/WICG/webusb/issues/184#issuecomment-599790333
    //https://larsgk.github.io/webusb-tester/
    // use sample code from https://4dkfire.com/webusb/polyfill.html
    
    //if we have not gotten permission yet we need to request for the port like this
    mySerial = await exports.serial.requestPort()
    .then(async(serialPort) => {
        console.log(serialPort);
        $("#deviceProperties").text(serialPort.device_.productName);
        $("#connectionStatus").text("Connected");
        mySerial = serialPort;
        //await mySerial.open({baudRate: 115200});// Not getting past here
        await mySerial.open(serialPortSettings);
        // Uncaught (in promise) Error: Error setting up device: NetworkError: Failed to execute 'claimInterface' on 'USBDevice': Unable to claim interface. (serial.ts:308) (mac chrome)
        // Uncaught (in promose) Error: Error setting up device: SecurityError: Failed to execute 'open' on 'USBDevice': Access denied. (serial.ts:308) (windows chrome and edge)
        polyReader = mySerial.readable.getReader();
        polyWriter = mySerial.writable.getWriter();
    });
    
    //if there is already a device that we have been given permission for we can just grab it like this
    /*
    mySerial = await polySerial.requestPort();
    console.log(mySerial);
    //const myOpen = await mySerial.open(serialPortSettings);
    const myOpen = await mySerial.open({baudRate: 115200});
    polyReader = mySerial.readable.getReader();
    polyWriter = mySerial.writable.getWriter();
    */
    
    const results = mySerial.getInfo();
    console.log(results);
    
    clearInterval(myLooping);
    myLooping = setInterval(myRead, 1000);
}

/*
async function mySend(myData2) {
    polyWriter.ready.then(() => {
        let inputArrayBuffer = str2ab(myData2);
        const myWritten = polyWriter.write(inputArrayBuffer);
        console.log("myWritten", myWritten);
    });
}
*/

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


    let timer = setTimeout(() => {
        control = false;
        console.error("timeout exceeded");
        return [];
    }, timeout);
    let i=0;
    console.log("newData", newData);
    while (!newData) {
        i++;
        if (i>5000) break;
        console.log(frameBuffer.length);
        if (frameBuffer.length >= 5) {
            if (numBytes == -1) numBytes == frameBuffer.length;
            clearTimeout(timer);
            let res = frameBuffer.splice(0, numBytes);
            rsp = UnpackResponse(res);
            break;
        }
    }
    console.log("newData", newData);
    return rsp;
}

function DecodePacketKFD100(data) {
    let byteCounter = 0;
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
function DecodePacketKFDAVR(data) {
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
    //console.log("ondatareceived", BCTS(data).join("-"));
    if (data === undefined) {
        return;
    }
    else if (data.length == 0) {
        return;
    }

// Native KFDtool
/*
    let byteCounter = 0;
    data.forEach((b) => {
        if (b == SOM_EOM) {
            foundStart = true;
            if (frameBuffer.length > 0) {
                for (var i=0; i<frameBuffer.length; i++) {
                    if (frameBuffer[i] == ESC) {
                        // this won't work if more than one are removed??
                        frameBuffer = frameBuffer.splice(i + 1);
                        if (i == frameBuffer.length) {
                            console.error("escape character at end");
                        }
                        if (frameBuffer[i] == ESC_PLACEHOLDER) {
                            frameBuffer[i] = ESC;
                        }
                        else if (frameBuffer[[i] == SOM_EOM_PLACEHOLDER]) {
                            frameBuffer[i] = SOM_EOM;
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
                //console.log("packet buffer length", packetBuffer.length);
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
*/

    if (serialModelId == "KFD100") {
        DecodePacketKFD100(data);
    }
    else if (serialModelId == "KFD-AVR") {
        DecodePacketKFDAVR(data);
    }

    if (packetBuffer.length > 0) {
        packetReady = true;
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

function ReadPacketFromPacketBuffer() {
    if (packetBuffer.length == 0) {
        console.warn("no packet in packet buffer");
        return [];
    }
    let packet = packetBuffer[0];
    packetBuffer = packetBuffer.splice(1);
    return packet;
}