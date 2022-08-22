async function readLoopDEPRECATED() {
    while(true) {
        const { value, done } = await reader.read();
        if (value) {
            console.log(value);
            frameBuffer.push(value);
        }
        if (done) {
            console.log("[readLoop] DONE", done);
            reader.releaseLock();
            break;
        }
    }
}

async function writeToStreamDEPRECATED(data) {
    const writer = port.writable.getWriter();

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

    let outData = new Uint8Array(frameData);

    console.log("outData:", BCTS(frameData).join("-"));

    writer.write(outData);
    writer.releaseLock();
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

async function importFileDEPRECATEDfinal(password) {
    ResetKeyContainer();

    let file = fileInputElement.files[0];
    let fileContents = await ReadFileAsync(file);//ArrayBuffer
    
    let enc = new TextEncoder("utf-8");
    let dec = new TextDecoder("utf-8");

    let dataLength = new DataView(fileContents, 0, 4).getInt32(0, true);
    let compressedData = fileContents.slice(4);//ArrayBuffer
/*
    let inflated;
    if (window.DecompressionStream) {
        //https://www.youtube.com/watch?v=ScZZoHj7mqY
        compressedData = new Uint8Array(compressedData);
        let compressedBlob = new Blob([compressedData], { type: "application/gzip" });
        const decompressor = new DecompressionStream("gzip");
        const decompression_stream = compressedBlob.stream().pipeThrough(decompressor);
        const decompressed_ab = await new Response(decompression_stream).arrayBuffer();
        inflated = new Uint8Array(decompressed_ab);
    }
    else {
        console.log("DecompressionStream not supported, using pako");
        try {
            inflated = pako.inflate(compressedData);//returns Uint8Array
        }
        catch(e) {
            console.error(e);
            alert(e);
            return;
        }
    }
*/
    let inflated = await Decompress(compressedData);
    console.log(inflated);
    if (inflated.length != dataLength) {
        alert("File size mismatch - file may be corrupt.");
        return;
    }
    let outerString = dec.decode(inflated);
    let outerXml = $.parseXML(outerString);
    //console.log(outerXml);
    let cipherValue = $(outerXml).find("CipherValue").text();
    let saltB64 = $(outerXml).find("Salt").text();
    saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    //var words = CryptoJS.enc.Base64.parse(saltB64);
    //console.log(words);
    
    let data = window.atob(cipherValue);
    data = Uint8Array.from(data, b => b.charCodeAt(0));
    let iv = data.slice(0,16);
    let cipher_data = data.slice(16);

    let keyLength = 512;
    let passwordBuffer = enc.encode(password);
    let importedKey = await window.crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        "PBKDF2",
        false,
        ["deriveBits","deriveKey"]
    );
    //console.log(importedKey);
    
    let params = {name: "PBKDF2", hash: "SHA-512", salt: saltBytes, iterations: 100000};
    let derivation = await window.crypto.subtle.deriveKey(
        params,
        importedKey,
        {
            name: "AES-CBC",
            length: 256
        },
        true,
        ["encrypt","decrypt","unwrapKey","wrapKey"]
    );

    let decrypted_content;
    try {
        decrypted_content = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv//Uint8Array
            },
            derivation,//CryptoKey
            cipher_data//Uint8Array
        );
    }
    catch(e) {
        console.log(e);
        alert("Unable to decrypt encyrpted key container");
        return;
    }

    let decrypted_data = dec.decode(decrypted_content);
    var isXml;
    try {
        isXml = $.parseXML(decrypted_data);
    }
    catch (e) {
        isXml = false;
    }
    if (!isXml) {
        alert("Invalid password for selected file");
        return;
    }
    else {
        var innerXml = $.parseXML(decrypted_data);
        innerContainer = $(innerXml).find("InnerContainer");
        
        // Convert the InnerContainer to JSON
        ImportKeys(innerContainer);
        ImportGroups(innerContainer);
        PopulateKeys();
        PopulateGroups();
        
        $(".menu_divs").hide();
        $("#manageKeys").show();
    }
}

async function ExportEkcDEPRECATED(keyContainer, password, filename) {
    //https://javascript.info/blob
    //https://dev.to/halan/4-ways-of-symmetric-cryptography-and-javascript-how-to-aes-with-javascript-3o1b
    //https://stackoverflow.com/questions/51000585/javascript-equivilant-of-c-sharp-frombase64string
    
    $.mobile.loading("show", { text: "Processing...", textVisible: true});
    
    let innerContainer, innerContainerEncrypted, outerContainer, outerContainerCompressed;
    
    innerContainer = await CreateInnerContainer(keyContainer);
    innerContainerEncrypted = await EncryptInnerContainer(innerContainer, password);
    outerContainerContent = await CreateOuterContainer(innerContainerEncrypted.content, innerContainerEncrypted.params);
    outerContainerCompressed = await CompressOuterContainer(outerContainerContent);
    
    $.mobile.loading("hide");
    
    let link = document.createElement("a");
    if (filename == "") filename = Date.now();
    link.download = filename + ".ekc";
    let blob = new Blob([outerContainerCompressed]);
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

function ReadPacketFromPacketBufferDEPRECATED(inData) {
    // This combines two functions, OnDataReceived and ReadPacketFromPacketBuffer
    console.log(inData);
    var packet = [];
    var foundStart = false;
    var hexStr = [];
    inData.forEach(item => {
        //console.log("0x" + item.toString(16));
        //console.log("0x" + item.toString(16).padStart(2,"0"));
        hexStr.push("0x" + item.toString(16).padStart(2,"0"));
        if (item == SOM_EOM) {
            foundStart = true;
            if (inData.length > 0) {
                for (var i=0; i<inData.length; i++) {
                    if (inData[i] == ESC) {
                        inData.splice(i, 1);
                        if (i == inData.length) {
                            console.error("escape character at end");
                            return;
                        }
                        if (inData[i] == ESC_PLACEHOLDER) {
                            inData[i] = ESC;
                        }
                        else if (inData[i] == SOM_EOM_PLACEHOLDER) {
                            inData[i] = SOM_EOM;
                        }
                        else {
                            console.error("invalid character after escape character");
                            return;
                        }
                    }
                }
                
                //var packet = inData;
                packet = inData;
                console.log(packet);
            }
            else {
                if (foundStart) {
                    console.log("added 0x{0:X2}");
                    inData.push(item);
                }
            }
        }
        if (inData.length > 0) {
            //PacketReady.Set();
        }
    });
    console.log(hexStr);
    alert(hexStr);
    
    //ReadPacketFromPacketBuffer
    return packet;
}

function ReadDEPRECATED(AP_TIMEOUT) {
    var packetBuffer = [];
    var reader = device.readable.getReader();
    reader.read()
    .then((value, done) => {
        //ReadPacketFromPacketBuffer(value.value);
        packetBuffer = value.value;
    })
    .catch(error => {
        console.error(error);
    })
    .finally(() => {
        reader.releaseLock();
        var data = [];
        data.push(ReadPacketFromPacketBuffer(packetBuffer));
        return data;
    });
}

function importFileDEPRECATEDWorked(password) {
    ResetKeyContainer();
    
    var fr = new FileReader();
    fr.onload = async function() {
        let enc = new TextEncoder("utf-8");
        let dec = new TextDecoder("utf-8");
        let stuff = fr.result;//ArrayBuffer
        var sliced = fr.result.slice(0, 4);
        var dataLength = new DataView(fr.result, 0, 4).getInt32(0, true);
        var compressedData = fr.result.slice(4);
        //console.log(compressedData);
        var inflated;

        if (window.DecompressionStream) {
            compressedData = new Uint8Array(compressedData);
            let compressedBlob = new Blob(compressedData);
            //console.log(compressedBlob.arrayBuffer());
            const arrayBuffer = await new Response(compressedBlob).arrayBuffer();
            console.log(arrayBuffer);
            //console.log(compressedBlob);
            const decompressor = new DecompressionStream("gzip");
            //console.log(decompressor);
            const decompression_stream = compressedBlob.stream().pipeThrough(decompressor);
            //console.log(decompression_stream);
            const decompressed_blob = await new Response(decompression_stream).blob();
            console.log("decompressed:", await decompressed_blob.text());
            return;
        }
        else {
            console.log("DecompressionStream not supported, using pako");
            try {
                inflated = pako.inflate(compressedData);//returns Uint8Array
                //inflated = pako.inflate(new Uint8Array(compressedData) , {"to":"string"});
            }
            catch(e) {
                console.error(e);
                alert(e);
                return;
            }
        }

        if (inflated.length != dataLength) {
            alert("File size mismatch - file may be corrupt.");
            return;
        }
        var outerString = dec.decode(inflated);
        var outerXml = $.parseXML(outerString);
        //console.log(outerXml);
        var cipherValue = $(outerXml).find("CipherValue").text();
        var saltB64 = $(outerXml).find("Salt").text();
        saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
        //var words = CryptoJS.enc.Base64.parse(saltB64);
        //console.log(words);
        
        let data = window.atob(cipherValue);
        data = Uint8Array.from(data, b => b.charCodeAt(0));
        let iv = data.slice(0,16);
        let cipher_data = data.slice(16);
        
        
        let keyLength = 512;
        let passwordBuffer = enc.encode(password);
        let importedKey = await window.crypto.subtle.importKey(
            "raw",
            passwordBuffer,
            "PBKDF2",
            false,
            ["deriveBits","deriveKey"]
        );
        //console.log(importedKey);
        
        let params = {name: "PBKDF2", hash: "SHA-512", salt: saltBytes, iterations: 100000};
        let derivation = await window.crypto.subtle.deriveKey(
            params,
            importedKey,
            {
                name: "AES-CBC",
                length: 256
            },
            true,
            ["encrypt","decrypt","unwrapKey","wrapKey"]
        );
        //console.log(iv);
        //console.log(derivation);
        //console.log(cipher_data);
        //console.log(data);
        
        /*
        // If Chrome, export raw key, then use CryptoJS to decrypt
        let exported = await window.crypto.subtle.exportKey(
            "raw",
            derivation
        );
        let exportedKeyBuffer = new Uint8Array(exported);
        console.log(exportedKeyBuffer);
        
        
        //https://stackoverflow.com/questions/72111641/why-does-decrypting-modified-aes-cbc-ciphertext-fail-decryption
        //https://stackoverflow.com/questions/60122638/web-crypto-api-throws-domexception-on-aes-decryption
        //http://www.ostack.cn/qa/?qa=1513357/
        //https://stackoverflow.com/questions/14958103/how-to-decrypt-message-with-cryptojs-aes-i-have-a-working-ruby-example
        //https://stackoverflow.com/questions/56949907/how-to-decrypt-message-with-cryptojs-aes-i-have-a-working-node-crypto-example
        //https://github.com/brix/crypto-js
        //https://odedhb.github.io/AES-encrypt/
        //https://cryptojs.gitbook.io/docs/
        //http://crypto.stanford.edu/sjcl/
        
        let encrypted = CryptoJS.AES.encrypt("this is text", "password");
        console.log(encrypted);
        
        
        let plaintextArray = CryptoJS.AES.decrypt(
            CryptoJS.enc.Latin1.parse(cipher_data),
            CryptoJS.enc.Hex.parse(key),
            { iv: CryptoJS.enc.Latin1.parse(iv) }
        );
        console.log(CryptoJS.enc.Utf8.stringify(plaintextArray));
        */
        
        let decrypted_content;
        try {
            decrypted_content = await window.crypto.subtle.decrypt(
                {
                    name: "AES-CBC",
                    iv//Uint8Array
                },
                derivation,//CryptoKey
                cipher_data//Uint8Array
            );
        }
        catch(e) {
            console.log(e);
            alert("Unable to decrypt encyrpted key container");
            return;
        }
        
        /*
        //https://peculiarventures.github.io/pv-webcrypto-tests/
        //http://www.ostack.cn/qa/?qa=1513357/
        decrypted_content = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv//Uint8Array
            },
            derivation,//CryptoKey
            cipher_data//Uint8Array
        );
        */
        
        /*
        if (typeof decrypted_content === "undefined") {
            alert("Unable to decrypt encyrpted key container");
            return;
        }
        */
        
        //console.log(decrypted_content);
        
        let decrypted_data = dec.decode(decrypted_content);
        var isXml;
        try {
            isXml = $.parseXML(decrypted_data);
        }
        catch (e) {
            isXml = false;
        }
        if (!isXml) {
            alert("Invalid password for selected file");
            return;
        }
        else {
            var innerXml = $.parseXML(decrypted_data);
            innerContainer = $(innerXml).find("InnerContainer");
            
            // Convert the InnerContainer to JSON
            ImportKeys(innerContainer);
            ImportGroups(innerContainer);
            PopulateKeys();
            PopulateGroups();
            
            $(".menu_divs").hide();
            $("#manageKeys").show();
        }
        
    }
    fr.readAsArrayBuffer(fileInputElement.files[0]);
}

function importFileDEPRECATED(password) {
    //https://dev.to/halan/4-ways-of-symmetric-cryptography-and-javascript-how-to-aes-with-javascript-3o1b
    // Empty existing key container
    ResetKeyContainer();
    
    var fr = new FileReader();
    fr.onload = async function() {
        let stuff = fr.result;
        //console.log(stuff);
        var sliced = fr.result.slice(0, 4);
        //console.log(sliced);
        var dataLength = new DataView(fr.result, 0, 4).getInt32(0, true);
        //console.log(dataLength);
        var compressedData = [];
        compressedData = fr.result.slice(4);
        //console.log(fr.result);//ArrayBuffer[1262]
        //console.log(compressedData);//ArrayBuffer[1258]
        var inflated;
        try {
            inflated = pako.inflate(compressedData);
        } catch (e) {
            console.error(e);
        }
        let enc = new TextEncoder("utf-8");
        var dec = new TextDecoder("utf-8");
        //console.log(inflated);//Uint8Array[1768]
        if (inflated.length != dataLength) {
            alert("File size mismatch - file may be corrupt.");
            return;
        }
        var outerString = dec.decode(inflated);
        //console.log(outerString);//ASCII
        var outerXml = $.parseXML(outerString);
        //console.log(outerXml);//XML
        var cipherValue = $(outerXml).find("CipherValue").text();
        //console.log(cipherValue);
        var saltB64 = $(outerXml).find("Salt").text();
        //console.log(saltB64);//base64: 2PNoVvAVisAIE/YRoTNmoNCGrJeSwWzAsgTTZ+ud8EQ=
        //var bs = window.atob(saltB64);//NOT USED
        //console.log(bs);//unkonwn
        saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
        //console.log(saltBytes);//Uint8Array(32)
        //cipherBytes = Uint8Array.from($(outerXml).find("CipherValue").text());
        //console.log(cipherBytes);//Uint8Array[1196]
        //_sb = saltBytes;
        //console.log(saltBytes);
        //saltBytes = Uint8Array.from([216,243,104,86,240,21,138,192,8,19,246,17,161,51,102,160,208,134,172,151,146,193,108,192,178,4,211,103,235,157,240,68]);
        
        var derivation = await getDerivation("SHA-512", saltBytes, password, 100000, 512);//256+128
        var rawKey = await exportCryptoKey(derivation);
        let key = rawKey;
        let data = cipherValue;
        //console.log(data);
        data = window.atob(data);
        data = Uint8Array.from(data, b => b.charCodeAt(0));
        //console.log(data);
        let iv = data.slice(0,16);
        data = data.slice(16);
        //_iv = iv;
        
        //console.log(iv);
        //iv = UintArray.from([167,21,140,145,240,8,107,170,237,202,191,91,11,186,89,186]);
        const key_encoded = await window.crypto.subtle.importKey(
            "raw",
            key.buffer,//ArrayBuffer[32]
            "AES-CBC",
            false,
            ["encrypt", "decrypt"]
        );
        const decrypted_content = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv//Uint8Array
            },
            key_encoded,//CryptoKey
            data//Uint8Array
        );
        let decrypted_data = dec.decode(decrypted_content);
        //console.log(key.buffer);//ArrayBuffer(32)
        //console.log(iv);//Uint8Array(16)
        //console.log(key_encoded);
        //console.log(data);//Uint8Array(880)
        //console.log(decrypted_content);//ArrayBuffer(875)
        //console.log(decrypted_data);//ASCII
        var isXml;
        try {
            isXml = $.parseXML(decrypted_data);
        }
        catch (e) {
            isXml = false;
        }
        if (!isXml) {
            alert("Invalid password for selected file");
            return;
        }
        else {
            //console.log(decrypted_data);
            var innerXml = $.parseXML(decrypted_data);
            //console.log(innerXml);
            //innerContainer = $.parseXML(decrypted_data);
            //xmlDoc = $.parseXML(decrypted_data);
            innerContainer = $(innerXml).find("InnerContainer");
            //console.log(innerContainer);
            //console.log(innerXml);
            //console.log($(innerXml).children());
            
            // Convert the InnerContainer to JSON
            ImportKeys(innerContainer);
            ImportGroups(innerContainer);
            PopulateKeys();
            PopulateGroups();
            
            //$("#iconLock").css({backgroundColor: "rgba(0,255,0,0.3)"});
            $(".menu_divs").hide();
            $("#manageKeys").show();
            
            
        }
    }
    fr.readAsArrayBuffer(fileInputElement.files[0]);
}

function handleFileDEPRECATED() {
    console.log("handling file");
    //const fileList = this.files[0];
    var fr = new FileReader();
    fr.onload = async function() {
        //console.log(fr);
        var sliced = fr.result.slice(0, 4);
        //console.log(sliced);
        var dataLength = new DataView(fr.result, 0, 4).getInt32(0, true);
        //console.log("decompressed size: " + dataLength + " bytes");
        //var dv = new DataView(fr.result, 4, fr.result.length - 4);
        //console.log(dv);
        var compressedData = [];
        compressedData = fr.result.slice(4);
        //console.log(compressedData);
        var inflated;
        try {
            inflated = pako.inflate(compressedData);
        } catch (e) {
            console.error(e);
        }
        var dec = new TextDecoder("utf-8");
        //console.log(dec.decode(inflated));
        var outerString = dec.decode(inflated);
        var outerXml = $.parseXML(outerString);
        console.log(outerXml);
        
        var saltB64 = $(outerXml).find("Salt").text();
        //console.log(saltB64);
        var bs = window.atob(saltB64);
        console.log("salt: " + bs);
        saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
        cipherBytes = Uint8Array.from($(outerXml).find("CipherValue").text());
        //console.log(salt);
        //console.log(saltBytes);
        var keyDerivation = {
            derivationAlgorithm: $(outerXml).find("DerivationAlgorithm").text(),
            hashAlgorithm: $(outerXml).find("HashAlgorithm").text(),
            salt: saltBytes,
            iterationCount: parseInt($(outerXml).find("IterationCount").text()),
            keyLength: parseInt($(outerXml).find("KeyLength").text())
        };
        
        let enc = new TextEncoder("utf-8");
        
        let pwenc = enc.encode("osu4192@CFD556");
        var cipherValue = $(outerXml).find("CipherValue").text();
        
        //https://medium.com/coinmonks/fun-times-with-webcrypto-part-1-pbkdf2-815b1c978c9d
        //https://medium.com/perimeterx/fun-times-with-webcrypto-part-2-encrypting-decrypting-dfb9fadba5bc
        
        console.log("Key derivation...");
        //console.log(enc.encode(salt));// returns Uint8Array
        console.log(saltBytes);// returns ArrayBuffer
        var derivation = await getDerivation("SHA-512", saltBytes, "osu4192@CFD556", 100000, 512);//256+128
        //var derivation = getDerivation("SHA-512", bs, "osu4192@CFD556", 100000, 256);
        //console.log(derivation);
        //var keyObject = await getKey(derivation);
        //console.log(keyObject);
        var rawKey = await exportCryptoKey(derivation);
        console.log(rawKey);//Uint8Array THIS IS THE AES-CBC KEY
        //var keyObject = getKey(derivation);
        //console.log(keyObject);
        //console.log(cipherValue);
        
        //let iv = window.crypto.getRandomValues(new Uint8Array(16));
        //iv = Uint8Array.from([167,21,140,145,240,8,107,170,237,202,191,91,11,186,89,186]);//ACTUAL IV from test.ekc
        //let key = Uint8Array.from([87,2,120,35,73,68,250,226,94,182,94,225,224,236,64,99,207,201,101,159,160,163,15,54,5,76,189,134,244,128,237,111]);
        //console.log(iv);
        let key = rawKey;
        //console.log(rawKey);
        let data = cipherValue;
        data = window.atob(data);
        //console.log(Uint8Array.from(data, b => b.charCodeAt(0)));//THIS MAKES FIRST 16 BYTES EQUAL IV
        data = Uint8Array.from(data, b => b.charCodeAt(0));
        let iv = data.slice(0,16);
        data = data.slice(16);
        console.log(iv);
        console.log(data);
        const key_encoded = await crypto.subtle.importKey(
            "raw",
            key.buffer,
            "AES-CBC",
            false,
            ["encrypt", "decrypt"]
        );
        const decrypted_content = await crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv
            },
            key_encoded,
            data
        );
        let decrypted_data = dec.decode(decrypted_content);
        //console.log(decrypted_content);//Should be 875 bytes in the end
        //console.log(dec.decode(decrypted_content));
        
        var innerXml = $.parseXML(decrypted_data);
        console.log(innerXml);
        
        
        
        //https://stackoverflow.com/questions/27019165/encrypt-text-using-aes-in-javascript-then-decrypt-in-c-sharp-wcf-service
        //https://stackoverflow.com/questions/57928974/reproduce-aes-decryption-method-from-c-sharp-in-javascript
        //https://stackoverflow.com/questions/47891104/compatible-aes-encryption-and-decryption-for-c-sharp-and-javascript
        //https://stackoverflow.com/questions/43280170/how-to-c-net-encrypt-then-js-webcryptoapi-decrypt-using-aes-gcm
        //https://stackoverflow.com/questions/14958103/how-to-decrypt-message-with-cryptojs-aes-i-have-a-working-ruby-example
        //https://stackoverflow.com/questions/53769391/aes-encryption-in-js-equivalent-of-c-sharp
        //https://www.google.com/search?q=javascript+decrypt+c%23+%22aes-cbc%22+site:stackoverflow.com&client=safari&rls=en&ei=gBnwYuSxE7irqtsPo-WR4Ag&start=10&sa=N&ved=2ahUKEwjk8fiIwrX5AhW4lWoFHaNyBIwQ8NMDegQIHhBK&biw=1324&bih=912&dpr=2
        //var decryptedText = CryptoJS.AES.decrypt(data, rawKey, { keySize: 256 / 8, iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        //console.log(decryptedText);
        //console.log(decryptedText.toString(CryptoJS.enc.Utf8));
        
        /*
        console.log("Crypto-JS PBKDF2");
        var hasher = CryptoJS.algo.SHA512;
        var key256Bits = CryptoJS.PBKDF2(
            "osu4192@CFD556",
            "safsfdasfd",
            {
                hasher: hasher,
                keySize: 256 / 32,
                iterations: 100
            }
        );
        console.log(key256Bits);
        */
        
        //var decryptedObject2 = await decrypt(cipherValue, keyObject);
        //console.log(decryptedObject2);
        //console.log(dec.decode(decryptedObject2));
        //console.log(dec.decode(decryptedObject));
        
        /*
        // Hello world!
        console.log("*** CONTROL TEST");
        var plainText = "Hello world!";
        console.log(plainText);
        var encyrptedObject = await encrypt(plainText, keyObject);//eO is an ArrayBuffer
        console.log(encyrptedObject);
        console.log(dec.decode(encyrptedObject));
        var decryptedObject = await decrypt(encyrptedObject, keyObject);//dO is an ArrayBuffer
        //console.log(decryptedObject);
        console.log(dec.decode(decryptedObject));
        
        console.log("*** REAL WORLD");
        plainText = cipherValue;
        //plainText = window.atob(cipherValue);
        console.log(plainText);
        //var eO = await encrypt(plainText, keyObject);
        eO = enc.encode(plainText).buffer;
        console.log(eO);
        var dO = await decrypt(eO, keyObject);
        console.log(dec.decode(dO));
        */
        
        //var bytes = fflate.strToU8(atob(fr.result), true);
        //console.log(fflate.strFromU8(fflate.gunzipSync(bytes.subarray(4))));
        //console.log(DecompressBlob(fr.result));
    }
    //fr.readAsText(this.files[0]);
    //fr.readAsDataURL(this.files[0]);
    //fr.readAsArrayBuffer(this.files[0]);
    fr.readAsArrayBuffer(fileInputElement.files[0]);
    // Deflate (compress)
    //const data = new Uint8Array([1,2,3,4,5,6,7,8,9]);
    //console.log(pako.deflate(data));
}

function loadFileDEPRECATED() {
    var fileReader = new FileReader();
    fileReader.readAsArrayBuffer(fileInputElement.files[0]);
    fileReader.onload = fileReadComplete;
    fileReader.onerror = fileReadError;
}

function fileReadCompleteDEPRECATED(evt) {
    //console.log(evt);
    let fileContents = evt.target.result;
    var sliced = fileContents.slice(0, 4);
    var dataLength = new DataView(fileContents, 0, 4).getInt32(0, true);
    var compressedData = [];
    compressedData = fileContents.slice(4);
    var inflated;
    try {
        inflated = pako.inflate(compressedData);
    } catch (e) {
        console.error(e);
    }
    let enc = new TextEncoder("utf-8");
    var dec = new TextDecoder("utf-8");
    var outerString = dec.decode(inflated);
    var outerXml = $.parseXML(outerString);
    var cipherValue = $(outerXml).find("CipherValue").text();
    
    var saltB64 = $(outerXml).find("Salt").text();
    var bs = window.atob(saltB64);
    saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    cipherBytes = Uint8Array.from($(outerXml).find("CipherValue").text());
    
    var password = $("#passwordEkc").val();
    //var derivation = await getDerivation("SHA-512", saltBytes, password, 100000, 512);//256+128
    
    getDerivation(
        "SHA-512",
        saltBytes,
        password,
        100000,
        512
    )
    .then((derivation) => {
        //console.log(derivation);
        exportCryptoKey(derivation)
        .then((rawKey) => {
            cipherValue = window.atob(cipherValue);
            cipherValue = Uint8Array.from(cipherValue, b => b.charCodeAt(0));
            let iv = cipherValue.slice(0,16);
            cipherValue = cipherValue.slice(16);
            crypto.subtle.importKey(
                "raw",
                rawKey.buffer,
                "AES-CBC",
                false,
                ["encrypt", "decrypt"]
            )
            .then((key_encoded) => {
                crypto.subtle.decrypt(
                    {
                        name: "AES-CBC",
                        iv
                    },
                    key_encoded,
                    cipherValue
                )
                .then((decrypted_content) => {
                    console.log(decrypted_content);
                    let decrypted_data = dec.decode(decrypted_content);
                    var innerXml;
                    try {
                        innerXml = $.parseXML(decrypted_data);
                    }
                    catch (e) {
                        alert("Invalid password for selected file");
                    }
                    console.log(innerXml);
                });
            });
        });
    });
    
    
    
    /*
    var rawKey = await exportCryptoKey(derivation);
    let key = rawKey;
    let data = cipherValue;
    data = window.atob(data);
    data = Uint8Array.from(data, b => b.charCodeAt(0));
    let iv = data.slice(0,16);
    data = data.slice(16);
    
    const key_encoded = await crypto.subtle.importKey(
        "raw",
        key.buffer,
        "AES-CBC",
        false,
        ["encrypt", "decrypt"]
    );
    const decrypted_content = await crypto.subtle.decrypt(
        {
            name: "AES-CBC",
            iv
        },
        key_encoded,
        data
    );
    let decrypted_data = dec.decode(decrypted_content);
    var isXml;
    try {
        isXml = $.parseXML(decrypted_data);
    }
    catch (e) {
        isXml = false;
    }
    if (!isXml) {
        alert("Invalid password for selected file");
        return;
    }
    var innerXml = $.parseXML(decrypted_data);
    console.log(innerXml);
    */
}

function fileReadErrorDEPRECATED(evt) {
    console.error(evt.target.error.name);
}

async function asyncReadDEPRECATED() {
    while (device.readable) {
        const reader = device.readable.getReader();
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
}

async function handleClickDEPRECATED() {
    //alert("HERE");
    const filePromises = files.map((file) => {
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const response = await this.submitFile(
                    reader.result,
                    file.name,
                    fileType
                );
                // Resolve the promise with the response value
                resolve(response);
            }
            catch (e) {
                reject(e);
            }
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsDataURL(file);
    });
    
    const fileInfos = await Promise.all(filePromises);
    console.log("COMPLETED");
    return fileInfos;
}

function ExportKeysDEPRECATED() {
    
}

function ExportGroupsDEPRECATED() {
    
}