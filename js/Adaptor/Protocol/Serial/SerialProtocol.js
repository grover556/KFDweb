const SOM_EOM = 0x61;
const SOM_EOM_PLACEHOLDER = 0x62;
const ESC = 0x63;
const ESC_PLACEHOLDER = 0x64;

let device = null;
//let port = null;
let poly = null;
const serialPortSettings = {
    baudRate: 115200,
    parity: "none",
    dataBits: 8,
    stopBits: 1
};
//let reader;
//let writer;
let exports = {};
let connected = false;
const filter = { usbVendorId: 0x2047 };

//let frameBuffer = [];

const decoder = new TransformStream();
let inputStream;

let polySerial = exports.serial;
let myLooping, mySerial;
let polyReader = {};
let polyWriter = {};

let connectionMethod;


//https://hpssjellis.github.io/web-serial-polyfill/desktop-serial05.html
let port;
//let writer;
async function connectSerial() {
    console.log("connectSerial()");
    connectionMethod = "ws";
    
    try {
        port = await navigator.serial.requestPort({filters: [filter]});
        await port.open(serialPortSettings);
        
        $("#connectionStatus").text("Connected");
        
        //const decoder = new TransformStream();
        port.readable.pipeTo(decoder.writable);
        
        //const inputStream = decoder.readable;
        inputStream = decoder.readable;
        //const reader = inputStream.getReader();
        
        /*
        while (true) {
            const { value, done } = await reader.read();
            if (value) {
                frameBuffer = Array.from(value.value);
            }
        }
        */
        
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
                $("#serialNumber").text(value);
                DecodeMessage();
            }
            if (done) {
                console.log('[readLoop] DONE', done);
                console.log(value);
                reader.releaseLock();
                break;
            }
        }
        console.log(port);
        */
    }
    catch(e) {
        console.log(e);
    }
}
async function mySendIt(myData) {
    if (navigation.serial) {
        const encoder = new TextEncoder();
        const writer = port.writable.getWriter();
        await writer.write(encoder.encode(myData));
        writer.releaseLock();
    }
    else {
        mySend(myData);
    }
}

async function Send(data) {
    console.log("send", data);
    let frameBuffer = [];
    let frameData = [];
    frameData.push(SOM_EOM);
    data.forEach(item => {
        if (item == ESC) {
            frameData.push(ESC);
            frameData.push(ESC_PLACEHOLDER);
        }
        else if (item == SOM_EOM) {
            frameData.push(ESC);
            frameData.push(SOM_EOM_PLACEHOLDER_);
        }
        else {
            frameData.push(item);
        }
    });
    frameData.push(SOM_EOM);
    var outData = new Uint8Array(frameData);
    console.log("frame data", frameData);
    
    if (connectionMethod == "poly") {
        polyWriter.ready.then(() => {
            //let inputArrayBuffer = str2ab(myData2);
            const myWritten = polyWriter.write(frameData);
            console.log("myWritten", myWritten);
        });
        return [];
    }
    
    
    const writer = port.writable.getWriter();
    await writer.write(outData);
    let reader = inputStream.getReader();
    await reader.read()
    .then((value, done) => {
        //console.log(value.value);
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

async function SendTest2DEPRECATED(data) {
    console.log("send", data);
    var returnData;
    var frameData = [];
    frameData.push(SOM_EOM);
    data.forEach(item => {
        if (item == ESC) {
            frameData.push(ESC);
            frameData.push(ESC_PLACEHOLDER);
        }
        else if (item == SOM_EOM) {
            frameData.push(ESC);
            frameData.push(SOM_EOM_PLACEHOLDER_);
        }
        else {
            frameData.push(item);
        }
    });
    frameData.push(SOM_EOM);
    var outData = new Uint8Array(frameData);
    console.log("frameData", outData);
    //console.log(temp);
    //return temp;
    
    /*
    const writer = port.writable.getWriter();
    await writer.write(outData);
    writer.releaseLock();
    */
    
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
    
    const writer = port.writable.getWriter();
    let writeResult = await writer.write(outData);
    const decoder = new TransformStream();
    port.readable.pipeTo(decoder.writable);
    const inputStream = decoder.readable;
    const reader = inputStream.getReader();
    let readResult = await reader.read();
    console.log(readResult);
    return readResult.value;
    
}

//https://hpssjellis.github.io/web-serial-polyfill/desktop-serial05.html
str2ab = function(str) {
    var buf = new Uint8Array(str.length);
    for (let i=0,strLen=str.length;i<strLen;i++) {
        buf[i] = str.charCodeAt(i);
    }
    return buf;
}
ab2str = function(buf) {
    return String.fromCharCode.apply(null, buf);
}

async function myRead() {
    polyReader.read().then(({value}) => {
        let receivedText = ab2str(value);
        console.log("received text: " + receivedText);
        alert("received text: " + receivedText);
    },
    error => {
        console.error("error from read", error);
    });
}

async function connectPolyfill() {
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

async function mySend(myData2) {
    polyWriter.ready.then(() => {
        let inputArrayBuffer = str2ab(myData2);
        const myWritten = polyWriter.write(inputArrayBuffer);
        console.log("myWritten", myWritten);
    });
}

async function SendDEPRECATED(data) {
    var returnData;
    var frameData = [];
    frameData.push(SOM_EOM);
    data.forEach(item => {
        if (item == ESC) {
            frameData.push(ESC);
            frameData.push(ESC_PLACEHOLDER);
        }
        else if (item == SOM_EOM) {
            frameData.push(ESC);
            frameData.push(SOM_EOM_PLACEHOLDER_);
        }
        else {
            frameData.push(item);
        }
    });
    frameData.push(SOM_EOM);
    var outData = new Uint8Array(frameData);
    //console.log(temp);
    //return temp;
    
    var writer = device.writable.getWriter();
    writer.write(outData)
    .then(() => {
        writer.releaseLock();
        const reader = device.readable.getReader();
        reader.read()
        .then((value, done) => {
            //ReadPacketFromPacketBuffer(value.value);
            console.log(value.value);
            returnData = value.value;
            return returnData;
        })
        .catch(error => {
            console.error(error);
        })
        .finally(() => {
            console.log("reader finally");
            reader.releaseLock();
            return returnData;
        });
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => {
        console.log("writer finally");
        return returnData;
        //if (device.writable.locked) writer.releaseLock();
        //if (device.readable.locked) reader.releaseLock();
    });
    return returnData;
}

function UnpackResponse(rsp) {
    rsp = Array.from(rsp);
    if ((rsp[0] != SOM_EOM) || (rsp[rsp.length - 1] != SOM_EOM)) {
        // invalid packet
        console.error("invalid packet structure: ", rsp);
        return [];
    }
    let temp = rsp.shift();
    temp = rsp.pop();
    
    for (var i=0; i<rsp.length; i++) {
        if (rsp[i] == ESC) {
            if (i == rsp.length) {
                console.error("escape character at end");
                return [];
            }
            if (rsp[i] == ESC_PLACEHOLDER) {
                rsp[i] = ESC;
            }
            else if (rsp[i] == SOM_EOM_PLACEHOLDER) {
                rsp[i] = SOM_EOM;
            }
            else {
                console.log("invalid character after escape character");
                return [];
            }
        }
    }
    return rsp;
}