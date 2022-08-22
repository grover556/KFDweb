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

//const decoder = new TransformStream();
let inputStream;
//const encoder = new TransformStream();
//let outputStream;

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
        
        port.addEventListener("connect", (event) => {
            // Device has been connected
            //$("#iconConnectionStatus").removeClass("connection-status-disconnected");
            //$("#iconConnectionStatus").addClass("connection-status-connected");
            $("#iconConnectionStatus").css("background-color", "#aaffaa");
            $("#buttonConnectKfd").prop("disabled", true);
            console.log(event);
        });
        port.addEventListener("disconnect", (event) => {
            // Device has been disconnected
            //$("#iconConnectionStatus").removeClass("connection-status-connected");
            //$("#iconConnectionStatus").addClass("connection-status-disconnected");
            connected = false;
            //port.close();
            $("#iconConnectionStatus").css("background-color", "#ffaaaa");
            $("#buttonConnectKfd").prop("disabled", false);
            $("#connectionStatus").text("Disconnected");
            $("#deviceProperties").html("");
            console.log(event);
        });

        await port.open(serialPortSettings);
        connected = true;
        $("#iconConnectionStatus").css("background-color", "#aaffaa");
        $("#buttonConnectKfd").prop("disabled", true);
        $("#connectionStatus").text("Connected");

        
        // THIS BLOCK WORKS IN THE SIMPLE IMPLEMENTATION
        const decoder = new TransformStream();
        //port.readable.pipeTo(decoder.writable);
        
        //const inputStream = decoder.readable;
        inputStream = decoder.readable;
        //const reader = inputStream.getReader();
        

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

async function readWithTimeout(timeout) {
    //https://wicg.github.io/serial/
    //console.log("readWithTimeout", timeout);
    const reader = port.readable.getReader();
    const timer = setTimeout(() => {
        console.log("timeout");
        reader.releaseLock();
        throw "timeout exceeded";
    }, timeout);
    const result = await reader.read();
    //console.log(result);
    clearTimeout(timer);
    reader.releaseLock();
    //return result.value;
    let rsp = UnpackResponse(result.value);
    return rsp;
}

async function SendSerial(data) {
    //https://hpssjellis.github.io/web-serial-polyfill/desktop-serial05.html
    //console.log("SendSerial", data);
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
    else {
        const writer = port.writable.getWriter();
        writer.write(outData);//REMOVED await
        writer.releaseLock();
    }
}

async function readUntilClosed() {
    while (port.readable) {
        reader = port.readable.getReader();
        try {
            while (true) {
                const {value, done} = await reader.read();
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
    await port.close();
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
    rsp = Array.from(rsp);

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