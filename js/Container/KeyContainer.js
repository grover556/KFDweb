let _keyContainer = {
    keys: [],
    nextKeyNumber: 1,
    groups: [],
    nextGroupNumber: 1
};

async function CreateEkc(keyContainer, password) {
    let innerContainer, innerContainerEncrypted, outerContainer, outerContainerCompressed;
    
    innerContainer = await CreateInnerContainer(keyContainer);
    innerContainerEncrypted = await EncryptInnerContainer(innerContainer, password);
    outerContainerContent = await CreateOuterContainer(innerContainerEncrypted.content, innerContainerEncrypted.params);
    outerContainerCompressed = await CompressOuterContainer(outerContainerContent);
    
    return outerContainerCompressed;
}

async function OpenEkc(file, password) {
    ResetKeyContainer();

    let fileContents = await ReadFileAsync(file);//ArrayBuffer
    
    let enc = new TextEncoder("utf-8");
    let dec = new TextDecoder("utf-8");
    
    let dataLength = new DataView(fileContents, 0, 4).getInt32(0, true);
    let compressedData = fileContents.slice(4);//ArrayBuffer
    let inflated = await Decompress(compressedData);
    
    if (inflated.length != dataLength) {
        alert("File size mismatch - file may be corrupt.");
        return;
    }
    let outerString = dec.decode(inflated);
    let outerXml = $.parseXML(outerString);
    
    let cipherValue = $(outerXml).find("CipherValue").text();
    let saltB64 = $(outerXml).find("Salt").text();
    saltBytes = Uint8Array.from(atob(saltB64), c => c.charCodeAt(0));
    
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
        ["deriveKey"]
    );
    
    let params = {name: "PBKDF2", hash: "SHA-512", salt: saltBytes, iterations: 100000};
    let derivation = await window.crypto.subtle.deriveKey(
        params,
        importedKey,
        {
            name: "AES-CBC",
            length: 256
        },
        true,
        ["decrypt"]
    );
    let decrypted_content;
    try {
        decrypted_content = await window.crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv
            },
            derivation,
            cipher_data
        );
    }
    catch(e) {
        console.log(e);
        alert("Unable to decrypt encyrpted key container. Please make sure to use a Key Container from KFDtool v1.5.1 or newer");
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

        // Populate the UI
        PopulateKeys();
        PopulateGroups();
        
        //$(".menu_divs").hide();
        //$("#manageKeys").show();
    }
}

async function CreateInnerContainer(keyContainer) {
    //https://developer.mozilla.org/en-US/docs/Web/API/Document_object_model/How_to_create_a_DOM_tree
    // Create InnerContainer
    let ic = document.implementation.createDocument("", "", null);
    
    let icEle = ic.createElement("InnerContainer");
    icEle.setAttribute("version", "1.0")
    ic.appendChild(icEle);
    
    // Create Keys
    let keys = ic.createElement("Keys");
    
    keyContainer.keys.forEach(key => {
        let keyItem = ic.createElement("KeyItem");
        let ele, eleVal;
        
        ele = ic.createElement("Id");
        eleVal = ic.createTextNode(key.Id);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("Name");
        eleVal = ic.createTextNode(key.Name);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("ActiveKeyset");
        eleVal = ic.createTextNode(key.ActiveKeyset);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("KeysetId");
        eleVal = ic.createTextNode(key.KeysetId);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("Sln");
        eleVal = ic.createTextNode(key.Sln);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("KeyTypeAuto");
        eleVal = ic.createTextNode(key.KeyTypeAuto);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("KeyTypeTek");
        eleVal = ic.createTextNode(key.KeyTypeTek);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("KeyTypeKek");
        eleVal = ic.createTextNode(key.KeyTypeKek);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("KeyId");
        eleVal = ic.createTextNode(key.KeyId);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("AlgorithmId");
        eleVal = ic.createTextNode(key.AlgorithmId);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        ele = ic.createElement("Key");
        eleVal = ic.createTextNode(key.Key);
        ele.appendChild(eleVal);
        keyItem.appendChild(ele);
        
        keys.appendChild(keyItem);
    });
    icEle.appendChild(keys);
    
    // Create NextKeyNumber
    let nknElement = ic.createElement("NextKeyNumber");
    let nkn = ic.createTextNode(keyContainer.nextKeyNumber);
    nknElement.appendChild(nkn);
    ic.documentElement.appendChild(nknElement);
    
    // Create Groups
    let groups = ic.createElement("Groups");
    
    keyContainer.groups.forEach(group => {
        //console.log(group);
        let groupItem = ic.createElement("GroupItem");
        let ele, eleVal;
        
        ele = ic.createElement("Id");
        eleVal = ic.createTextNode(group.Id);
        ele.appendChild(eleVal);
        groupItem.appendChild(ele);
        ele = ic.createElement("Name");
        eleVal = ic.createTextNode(group.Name);
        ele.appendChild(eleVal);
        groupItem.appendChild(ele);
        
        keys = ic.createElement("Keys");
        group.Keys.forEach(keyId => {
            let eleKey = ic.createElement("int");
            let eleKeyVal = ic.createTextNode(keyId);
            eleKey.appendChild(eleKeyVal);
            keys.appendChild(eleKey);
        });
        groupItem.appendChild(keys);
        
        
        groups.appendChild(groupItem);
    });
    icEle.appendChild(groups);
    
    // Create NextGroupNumber
    let ngnElement = ic.createElement("NextGroupNumber");
    let ngn = ic.createTextNode(keyContainer.nextGroupNumber);
    ngnElement.appendChild(ngn);
    ic.documentElement.appendChild(ngnElement);
    
    const ser = new XMLSerializer();
    //const str = ser.serializeToString(ic);
    return ser.serializeToString(ic);
}

async function EncryptInnerContainer(decrypted_content, password) {
    //https://stackoverflow.com/questions/51000585/javascript-equivilant-of-c-sharp-frombase64string
    //https://stackoverflow.com/questions/57928974/reproduce-aes-decryption-method-from-c-sharp-in-javascript
    let parameters = {
        derivationAlgorithm: "PBKDF2",
        hashAlgorithm: "SHA512",
        iterationCount: 100000,
        keyLength: 32
    };
    let enc = new TextEncoder("utf-8");
    
    let decrypted_data = enc.encode(decrypted_content).buffer;
    let passwordBuffer = enc.encode(password);
    
    let iv = window.crypto.getRandomValues(new Uint8Array(16));
    let saltBytes = window.crypto.getRandomValues(new Uint8Array(32));
    
    parameters.saltBytes = saltBytes;
    
    let importedKey = await window.crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        "PBKDF2",
        false,
        ["deriveKey"]
    );
    let keyParams = {name: "PBKDF2", hash: "SHA-512", salt: saltBytes, iterations: 100000};
    let derivation = await window.crypto.subtle.deriveKey(
        keyParams,
        importedKey,
        {
            name: "AES-CBC",
            length: 256
        },
        true,
        ["encrypt"]
    );
    let encrypted_data = await window.crypto.subtle.encrypt(
        {
            name: "AES-CBC",
            iv//Uint8Array
        },
        derivation,//CryptoKey
        decrypted_data//Uint8Array
    );
    
    encrypted_data = new Uint8Array(encrypted_data);
    
    //https://stackoverflow.com/questions/49129643/how-do-i-merge-an-array-of-uint8arrays
    var mergedArray = new Uint8Array(encrypted_data.length + iv.length);
    mergedArray.set(iv);
    mergedArray.set(encrypted_data, iv.length);
    encrypted_data = mergedArray;
    
    return { content: encrypted_data, params: parameters };
}

async function CreateOuterContainer(cipherValue, params) {
    // Need to convert cipherValue and params.saltBytes into base64 text
    var cipherB64 = btoa(String.fromCharCode.apply(null, new Uint8Array(cipherValue)));
    var saltB64 = btoa(String.fromCharCode.apply(null, new Uint8Array(params.saltBytes)));
    
    let oc = document.implementation.createDocument("", "", null);
    
    let ocEle = oc.createElement("OuterContainer");
    ocEle.setAttribute("version", "1.0");
    oc.appendChild(ocEle);
    
    // Create KeyDerivation
    let ele, eleVal;
    let kd = oc.createElement("KeyDerivation");
    ele = oc.createElement("DerivationAlgorithm");
    eleVal = oc.createTextNode(params.derivationAlgorithm);
    ele.appendChild(eleVal);
    kd.appendChild(ele);
    ele = oc.createElement("HashAlgorithm");
    eleVal = oc.createTextNode(params.hashAlgorithm);
    ele.appendChild(eleVal);
    kd.appendChild(ele);
    ele = oc.createElement("Salt");
    eleVal = oc.createTextNode(saltB64);
    ele.appendChild(eleVal);
    kd.appendChild(ele);
    ele = oc.createElement("IterationCount");
    eleVal = oc.createTextNode(params.iterationCount);
    ele.appendChild(eleVal);
    kd.appendChild(ele);
    ele = oc.createElement("KeyLength");
    eleVal = oc.createTextNode(params.keyLength);
    ele.appendChild(eleVal);
    kd.appendChild(ele);
    ocEle.appendChild(kd);
    
    let ed = oc.createElement("EncryptedData");
    ed.setAttribute("xmlns", "http://www.w3.org/2001/04/xmlenc#");
    ed.setAttribute("Type", "http://www.w3.org/2001/04/xmlenc#Element");
    
    let ed2 = oc.createElement("EncryptionMethod");//has rogue xmlns=""
    ed2.setAttribute("Algorithm", "http://www.w3.org/2001/04/xmlenc#aes256-cbc");
    ed.appendChild(ed2);
    
    let cd = oc.createElement("CipherData");//has rogue xmlns=""
    ele = oc.createElement("CipherValue");//has rogue xmlns=""
    eleVal = oc.createTextNode(cipherB64);
    ele.appendChild(eleVal);
    cd.appendChild(ele);
    ed.appendChild(cd);
    ocEle.appendChild(ed);
    
    //console.log(oc);
    //console.log('<?xml version="1.0" encoding="UTF-8"?>' + oc.documentElement.outerHTML);
    // XMLSerializer adds rogue xmlns="" to EncryptionMethod, CipherData, CipherValue and also indents CipherData
    //const ser = new XMLSerializer();
    //const str = ser.serializeToString(ic);
    //return ser.serializeToString(oc);
    //let xmlDoc = '<?xml version="1.0" encoding="UTF-8"?>' + ser.serializeToString(oc.documentElement);
    //console.log($.parseXML(xmlDoc));
    //https://stackoverflow.com/questions/17670973/converting-xmldocument-object-to-string-in-javascript
    let xmlDoc = '<?xml version="1.0" encoding="UTF-8"?>' + oc.documentElement.outerHTML;
    return xmlDoc;
    
}

async function CompressOuterContainer(content) {
    //https://stackoverflow.com/questions/15761790/convert-a-32bit-integer-into-4-bytes-of-data-in-javascript
    let inflatedLength = content.length;
/*
    let deflated;
    console.log(content);
    if (window.CompressionStream) {
        let decompressedBlob = new Blob([content], { type: "text/plain" });
        console.log(decompressedBlob);
        const compressor = new CompressionStream("gzip");
        const compression_stream = decompressedBlob.stream().pipeThrough(compressor);
        console.log(compression_stream);
        const compressed_ab = await new Response(compression_stream).arrayBuffer();
        console.log(compressed_ab);
        deflated = new Uint8Array(compressed_ab);
        console.log(deflated);
    }
    else {
        console.log("DecompressionStream not supported, using pako");
        deflated = pako.deflate(content);//returns Uint8Array
        console.log(deflated);
    }
*/
    let deflated = await Compress(content);
    
    let arr = new ArrayBuffer(4);
    let view = new DataView(arr);
    view.setUint32(0, inflatedLength, true);
    let sizeArray = new Uint8Array(arr);
    
    //https://stackoverflow.com/questions/49129643/how-do-i-merge-an-array-of-uint8arrays
    var mergedArray = new Uint8Array(sizeArray.length + deflated.length);
    mergedArray.set(sizeArray);
    mergedArray.set(deflated, sizeArray.length);
    deflated_final = mergedArray;
    
    return deflated_final;
}

function ImportKeys(innerContainer) {
    let keyCount = innerContainer.contents("Keys").children("KeyItem");
    
    _keyContainer.nextKeyNumber = parseInt(innerContainer.contents("NextKeyNumber").text());
    for (var i=0;i<keyCount.length;i++) {
        let keyInfo = innerContainer.contents("Keys").children("KeyItem")[i].childNodes;
        let keyItem = {};
        
        for (const value of keyInfo.values()) {
            switch(value.nodeName) {
                case "Id":
                    keyItem.Id = parseInt(value.textContent);
                    break;
                case "Name":
                    keyItem.Name = value.textContent;
                    break;
                case "ActiveKeyset":
                    keyItem.ActiveKeyset = (value.textContent === "true");
                    break;
                case "KeysetId":
                    keyItem.KeysetId = parseInt(value.textContent);
                    break;
                case "Sln":
                    keyItem.Sln = parseInt(value.textContent);
                    break;
                case "KeyTypeAuto":
                    keyItem.KeyTypeAuto = (value.textContent === "true");
                    break;
                case "KeyTypeTek":
                    keyItem.KeyTypeTek = (value.textContent === "true");
                    break;
                case "KeyTypeKek":
                    keyItem.KeyTypeKek = (value.textContent === "true");
                    break;
                case "KeyId":
                    keyItem.KeyId = parseInt(value.textContent);
                    break;
                case "AlgorithmId":
                    keyItem.AlgorithmId = parseInt(value.textContent);
                    break;
                case "Key":
                    keyItem.Key = value.textContent.split(",").map((str) => parseInt(str));
                    break;
                default:
                    console.error("KeyItem node name '" + value.nodeName + "' not expected");
            }
        }
        _keyContainer.keys.push(keyItem);
    }
}

function ImportGroups(innerContainer) {
    let groupCount = innerContainer.contents("Groups").children("GroupItem");
    
    _keyContainer.nextGroupNumber = parseInt(innerContainer.contents("NextGroupNumber").text());
    for (var i=0;i<groupCount.length;i++) {
        let groupInfo = innerContainer.contents("Groups").children("GroupItem")[i].childNodes;
        let groupItem = {};
        
        for (const value of groupInfo.values()) {
            switch(value.nodeName) {
                case "Id":
                    groupItem.Id = parseInt(value.textContent);
                    break;
                case "Name":
                    groupItem.Name = value.textContent;
                    break;
                case "Keys":
                    let groupKeyArray = [];
                    for (const keyId of value.childNodes.values()) {
                        groupKeyArray.push(parseInt(keyId.textContent));
                    }
                    groupItem.Keys = groupKeyArray;
                    break;
                default:
                    console.error("GroupItem node name '" + value.nodeName + "' not expected");
            }
        }
        _keyContainer.groups.push(groupItem);
    }
}