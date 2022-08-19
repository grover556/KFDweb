//https://mdn.github.io/dom-examples/web-crypto/encrypt-decrypt/index.html
//https://github.com/google/web-serial-polyfill
//https://groups.google.com/a/chromium.org/g/chromium-dev/c/iS3HhY_Tm6E
//https://codesandbox.io/examples/package/web-serial-polyfill
//https://mobile.twitter.com/rocksetta/status/1537304616395689985
//https://hpssjellis.github.io/my-examples-of-arduino-webUSB-webSerial/public/index.html
//https://hpssjellis.github.io/web-serial-polyfill/index.html
//https://github.com/hpssjellis/web-serial-polyfill
//https://github.com/google/web-serial-polyfill/issues

let inputType = "dec";
let xmlDoc;
//let outerContainer, innerContainer;
//let stuff;

//const url = ("https:" == document.location.protocol ? "wss://" : "ws:") + "saver-cpd.coc.ads/websocket/?userName=" + userName + "&userGroup=" + userGroup + "&userGroups=" + userGroups.join() + "&userAgency=" + userAgency + "&mdcId=" + _MDC_ID;

//console.log(document.location.protocol);

let secureContext = false;
if (document.location.protocol.includes("https")) secureContext = true;
else if ((document.location.host == "127.0.0.1") || (document.location.host == "localhost")) secureContext = true;

// Use this for decompressing Base64 salt from XML file, "/OuterContainer/KeyDerivation/Salt"
//https://developer.mozilla.org/en-US/docs/Web/API/atob
//var compressedData = "";
//var decompressedData = atob(compressedData);
//console.log(decompressedData);

//GZip decompression
//https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API
async function DecompressBlob(blob) {
    const ds = new DecompressionStream('gzip');
    const decompressedStream = blob.stream().pipeThrough(ds);
    return await new Response(decompressedStream).blob();
}

//https://github.com/mdn/dom-examples/blob/master/web-crypto/encrypt-decrypt/aes-cbc.js
let key = window.crypto.subtle.generateKey(
    {
        name: "AES-CBC",
        length: 256
    },
    true,
    [ "encrypt", "decrypt" ]
);

//https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
const fileInputElement = document.getElementById("inputFile");
//const input = document.querySelector("input[type=file]");
//fileInputElement.addEventListener("change", importFile, false);

$(document).ready(function() {
    let status, description;
    if (secureContext) {
        status = "Secure context";
        description = "All features available";
    }
    else {
        status = "<a href='https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts'>Insecure context</a>";
        description = "This page is being hosted on a non-HTTPS server. Because of this, you are unable to communicate with the KFDtool or open or save key containers. Please ensure the page is hosted either on a HTTPS server or a localhost instance.";
    }
    $("#secureContextStatus").text(status);
    $("#secureContextDetails").text(description);
    if (navigator.serial) {
        $("#connectionMethod").text("Web Serial API");
    }
    else {
        $("#connectionMethod").text("Web USB Polyfill");
    }
});

$(".menuItem").on("click", function() {
    var menuName = $(this).attr("id").replace("menu_", "");
    //console.log(menuName);
    $(".menu_divs").hide();
    $("#" + menuName).show();
    $("#panelMenu").panel("close");
    
    if (menuName == "manageKeys") {
        //PopulateKeys();
    }
    else if (menuName == "manageGroups") {
        //PopulateGroups();
    }
    else if (menuName == "loadKeyMultiple") {
        
    }
});

$("input:file").change(function() {
    //var fileName = $(this).val();
    //console.log(fileName);
});

$("#buttonImportFile").click(function() {
    $("#popupImportEkc").popup("open");
});
$("#buttonCancelEkc").click(function() {
    $("#popupImportEkc").popup("close");
    clearPopupEkc();
});
$("#buttonOpenEkc").click(function() {
    if ($("#passwordEkc").val() == "") {
        alert("Please enter a password");
        return;
    }
    if (fileInputElement.files.length == 0) {
        alert("Please select a valid EKC file");
        return;
    }
    $("#popupImportEkc").popup("close");
    importFile($("#passwordEkc").val());
    //loadFile();
    clearPopupEkc();
});
$("#buttonManageGroup_addGroup").on("click", function() {
    $(".menu_divs").hide();
    $("#addGroup").show();
});
$("#buttonManageKeyActions").on("click", function() {
    $("#popupMenuKeyOptions").popup("open");
});
$("#buttonLoadKeyToContainer").on("click", function() {
    let base = 10;
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "hex") {
        base = 16;
    }
    let keyItem = {};
    let auto = false;
    let tek = false;
    let kek = false;
    if ($("input[name='radioKeyType']:checked").val() == "auto") auto = true;
    else if ($("input[name='radioKeyType']:checked").val() == "tek") tek = true;
    else if ($("input[name='radioKeyType']:checked").val() == "kek") kek = true;
    
    keyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSlider").val() == "yes" ? true : false;
    if (keyItem.ActiveKeyset) $("#loadKeySingle_keysetId").val("1");
    
    if ($("#loadKeySingle_name").val() == "") {
        alert("Key name cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_keysetId").val() == "") {
        alert("Keyset ID cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_SlnCkr").val() == "") {
        alert("SLN/CKR cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_keyId").val() == "") {
        alert("Key ID cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_key").val() == "") {
        alert("Key cannot be empty");
        return;
    }
    let keylen = parseInt($("#loadKeySingle_algorithm option:selected").data("length"));
    if (!isNaN(keylen)) {
        if ($("#loadKeySingle_key").val().length != keylen*2) {
            alert("Invalid key length");
            return;
        }
    }
    let matchingKeys = _keyContainer.keys.filter(function(obj) { return obj.Name === key.Name; });
    if (matchingKeys.length) {
        alert("Key name must be unique");
        return;
    }
    
    keyItem.Id = _keyContainer.nextKeyNumber;
    keyItem.Name = $("#loadKeySingle_name").val();
    keyItem.KeysetId = parseInt($("#loadKeySingle_keysetId").val(), base);
    //keyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSlider").val() == "yes" ? true : false;
    keyItem.Sln = parseInt($("#loadKeySingle_SlnCkr").val(), base);
    keyItem.KeyId = parseInt($("#loadKeySingle_keyId").val(), base);
    keyItem.AlgorithmId = parseInt($("#loadKeySingle_algorithmOther").val(), base);
    keyItem.Key = $("#loadKeySingle_key").val();
    if (auto) {
        if (keyItem.Sln >=0 && keyItem.Sln <= 61439) tek = true;
        else if (keyItem.Sln >= 61440 && keyItem.Sln <= 65535) kek = true;
    }
    keyItem.KeyTypeAuto = auto;
    keyItem.KeyTypeTek = tek;
    keyItem.KeyTypeKek = kek;
    
    
    if ((key.KeysetId < 1) || (key.KeysetId > 255)) {
        alert("Keyset ID out of range");
        return;
    }
    else if ((key.Sln < 0) || (key.Sln > 65535)) {
        alert("SLN/CKR out of range");
        return;
    }
    else if ((key.KeyId < 0) || (key.KeyId > 65535)) {
        alert("Key ID out of range");
        return;
    }
    
    if (key.KeyTypeTek && (key.Sln >= 61440)) {
        alert("Key type set to TEK, but SLN indicates KEK");
        return;
    }
    else if (key.KeyTypeKek && (key.Sln <= 61439)) {
        alert("Key type set to KEK, but SLN indicates TEK");
        return;
    }
    
    //console.log(keyItem);
    /*
    let validated = CheckKeyValidation(keyItem);
    if (!validated.valid) {
        alert(validated.reason);
        return;
    }
    */
    AddKey(keyItem);
    ClearKeyInfo();
});
$("#buttonLoadKeyToRadio").on("click", function() {
    SendKeyToRadio("test");
    return;
    
    let base = 10;
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "hex") {
        base = 16;
    }
    let keyItem = {};
    let auto = false;
    let tek = false;
    let kek = false;
    if ($("input[name='radioKeyType']:checked").val() == "auto") auto = true;
    else if ($("input[name='radioKeyType']:checked").val() == "tek") tek = true;
    else if ($("input[name='radioKeyType']:checked").val() == "kek") kek = true;
    
    keyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSlider").val() == "yes" ? true : false;
    if (keyItem.ActiveKeyset) $("#loadKeySingle_keysetId").val("1");
    
    if ($("#loadKeySingle_name").val() == "") {
        alert("Key name cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_keysetId").val() == "") {
        alert("Keyset ID cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_SlnCkr").val() == "") {
        alert("SLN/CKR cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_keyId").val() == "") {
        alert("Key ID cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_key").val() == "") {
        alert("Key cannot be empty");
        return;
    }
    let keylen = parseInt($("#loadKeySingle_algorithm option:selected").data("length"));
    if (!isNaN(keylen)) {
        if ($("#loadKeySingle_key").val().length != keylen*2) {
            alert("Invalid key length");
            return;
        }
    }
    let matchingKeys = _keyContainer.keys.filter(function(obj) { return obj.Name === key.Name; });
    if (matchingKeys.length) {
        alert("Key name must be unique");
        return;
    }
    
    keyItem.Id = _keyContainer.nextKeyNumber;
    keyItem.Name = $("#loadKeySingle_name").val();
    keyItem.KeysetId = parseInt($("#loadKeySingle_keysetId").val(), base);
    //keyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSlider").val() == "yes" ? true : false;
    keyItem.Sln = parseInt($("#loadKeySingle_SlnCkr").val(), base);
    keyItem.KeyId = parseInt($("#loadKeySingle_keyId").val(), base);
    keyItem.AlgorithmId = parseInt($("#loadKeySingle_algorithmOther").val(), base);
    keyItem.Key = $("#loadKeySingle_key").val();
    if (auto) {
        if (keyItem.Sln >=0 && keyItem.Sln <= 61439) tek = true;
        else if (keyItem.Sln >= 61440 && keyItem.Sln <= 65535) kek = true;
    }
    keyItem.KeyTypeAuto = auto;
    keyItem.KeyTypeTek = tek;
    keyItem.KeyTypeKek = kek;
    
    
    if ((key.KeysetId < 1) || (key.KeysetId > 255)) {
        alert("Keyset ID out of range");
        return;
    }
    else if ((key.Sln < 0) || (key.Sln > 65535)) {
        alert("SLN/CKR out of range");
        return;
    }
    else if ((key.KeyId < 0) || (key.KeyId > 65535)) {
        alert("Key ID out of range");
        return;
    }
    
    if (key.KeyTypeTek && (key.Sln >= 61440)) {
        alert("Key type set to TEK, but SLN indicates KEK");
        return;
    }
    else if (key.KeyTypeKek && (key.Sln <= 61439)) {
        alert("Key type set to KEK, but SLN indicates TEK");
        return;
    }
    
    //console.log(keyItem);
    SendKeyToRadio(keyItem);
    //AddKey(keyItem);
    ClearKeyInfo();
});

function SendKeyToRadio(key) {
    console.log("SendKeyToRadio", key);
    
    let ki = new KeyItem();
    
    ki.SLN = 0x01;
    ki.KeyId = 0x01;
    ki.Key = [0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0x0C, 0x0D, 0x0E, 0x0F];
    
    console.log(ki);
    console.log(ki.ToBytes());
}

function ClearKeyInfo() {
    // Reset all key fields to default
    $("#loadKeySingle_name").val("");
    $("#loadKeySingle_activeKeysetSlider").val("yes").slider("refresh");
    $("#loadKeySingle_keysetId").val("");
    $("#loadKeySingle_SlnCkr").val("");
    $("input:radio[name='radioKeyType']").prop("checked", false).checkboxradio("refresh");
    $("input:radio[id='radioKeyType_auto']").prop("checked", true).checkboxradio("refresh");
    $("#loadKeySingle_keyId").val("");
    $("#loadKeySingle_algorithm").val("132");
    $("#loadKeySingle_algorithm").selectmenu("refresh");
    $("#loadKeySingle_algorithmOther").val("132");
    $("#loadKeySingle_key").val("");
}
$("#keyContainerKeyList").on("click", "li", function() {
    //console.log($(this).data("key-id"));
    
});
$("#keyContainerGroupList").on("click", "li", function() {
    //console.log($(this).data("group-id"));
    
});
$("#createEkc").on("click", function() {
    if ($("#exportKeyContainer_password").val() != $("#exportKeyContainer_passwordVerify").val()) {
        alert("Passwords do not match, please verify password");
        return;
    }
    if ($("#exportKeyContainer_filename").val() == "") {
        alert("Please enter a valid file name");
        return;
    }
    //if ($("#exportKeyContainer_filename").val().includes('[\\/:"*?<>|]+')) { }
    //ExportEkc(_keyContainer, $("#exportKeyContainer_passwordVerify").val(), $("#exportKeyContainer_filename").val());
    DownloadEkc(_keyContainer, $("#exportKeyContainer_passwordVerify").val(), $("#exportKeyContainer_filename").val());
    $("#exportKeyContainer_password").val("");
    $("#exportKeyContainer_passwordVerify").val("");
    $("#exportKeyContainer_filename").val("");
});
$("#buttonResetEkc").on("click", function() {
    ResetKeyContainer();
    alert("All keys and groups have been cleared from memory");
});

$("#buttonGenerateRandomKey").click(function() {
    // Generate a random key
    let key = "";
    let keylen = $("#loadKeySingle_algorithm option:selected").data("length");
    let parity = $("#loadKeySingle_algorithm option:selected").data("parity");
    key = generateRandomKey(keylen, parity);
    $("#loadKeySingle_key").val(key);
    $("#label_loadKeySingle_key").text("Key (hex): (" + keylen*2 + "/" + keylen*2 + " digits)");
    // Flash the key field to indicate that a new key has been generated
    $("#loadKeySingle_key").fadeTo(100, 0.25, function() { $(this).fadeTo(500, 1.0); });
});

$("#passwordEkc").keyup(function(event) {
    //console.log(event);
    //event.key = "Enter", event.which = 13, event.keyCode = 13
    if (event.which == 13) {
        $("#buttonOpenEkc").trigger("click");
    }
});

$("#inputFile").on("change", function() {
    $("#passwordEkc").focus();
});

$(".hex-input").keyup(function() {
    // Ensure that only hexidecimal values are input
    if ($(this).hasClass("key-input")) {
        //loadKeySingleKey
        let eleId = $(this).attr("id");
        let textInput = $("#" + eleId);
        //console.log(eleId);
        //console.log($("#label_" + eleId));
        let maxKeylenBytes = parseInt($("#loadKeySingle_algorithm option:selected").data("length")*2);
        if (maxKeylenBytes == 0) maxKeylenBytes = 512;
        //$("#label_" + eleId).text("Key (hex): (" + $(this).val().length + "/" + maxKeylenBytes + ") bytes");
        textInput.val(textInput.val().replace(/[^a-fA-F0-9\n\r]+/g, '').toUpperCase());
        if (textInput.val().length > maxKeylenBytes) {
            //textInput.val(textInput.val().slice(0, -1));
            textInput.val(textInput.val().slice(0, maxKeylenBytes));
        }
        $("#label_" + eleId).text("Key (hex): (" + textInput.val().length + "/" + maxKeylenBytes + " digits)");
    }
    else {
        let curVal = $(this).val();
        $(this).val(curVal.replace(/[^a-fA-F0-9\n\r]+/g, '').toUpperCase());
    }
});

$(".dec-input").keyup(function() {
    let curVal = $(this).val();
    $(this).val(curVal.replace(/[^0-9\n\r]+/g, ''));
});

$(".hexdec-input").keyup(function() {
    // Ensure that only decimal or hexidecimal values are input
    let curVal = $(this).val();
    if (inputType == "dec") {
        $(this).val(curVal.replace(/[^0-9\n\r]+/g, ''));
    }
    else if (inputType = "hex") {
        $(this).val(curVal.replace(/[^a-fA-F0-9\n\r]+/g, '').toUpperCase());
    }
});

$("#loadKeySingle_keysetId").keyup(function() {
    let decValue = 0;
    let maxValue = parseInt($("#loadKeySingle_keysetId").data("max-value"));
    /*
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "hex") {
        let decVal = parseInt($("#loadKeySingle_keysetId").val(), 16);
        if (decVal > maxValue) {
            $("#loadKeySingle_keysetId").parent().addClass("invalid");
        }
        else {
            $("#loadKeySingle_keysetId").parent().removeClass("invalid");
        }
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "dec") {
        if ($("#loadKeySingle_keysetId").val() > maxValue) {
            $("#loadKeySingle_keysetId").parent().addClass("invalid").change();
        }
        else {
            $("#loadKeySingle_keysetId").parent().removeClass("invalid").change();
        }
    }
    */
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "hex") {
        decValue = parseInt($("#loadKeySingle_keysetId").val(), 16);
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "dec") {
        decValue = parseInt($("#loadKeySingle_keysetId").val());
    }
    if (decValue > maxValue) {
        $("#loadKeySingle_keysetId").parent().addClass("invalid");
    }
    else {
        $("#loadKeySingle_keysetId").parent().removeClass("invalid");
    }
});

$("#loadKeySingle_key").focusin(function(evt) {
    // Show the key when the user clicks inside the key entry input
    // Disregard if the focus is caused by a tab from the field above
    if (evt.relatedTarget == null) {
        return;
    }
    if ((evt.relatedTarget.id == "loadKeySingle_algorithm") || (evt.relatedTarget.id == "loadKeySingle_algorithmOther")) {
        return;
    }
    $("#loadKeySingle_toggleKeyVis").val("show").slider("refresh");
    $("#loadKeySingle_key").attr("type", "text");
});

$("#loadKeySingle_algorithm").change(function() {
    // Clear the key entry input when a new algorithm is selected
    if ($("#loadKeySingle_algorithm").val() == "256") {
        $("#loadKeySingle_algorithmOtherDiv").show();
        $("#loadKeySingle_algorithmOther").val("");
    }
    else {
        $("#loadKeySingle_algorithmOtherDiv").hide();
        $("#loadKeySingle_algorithmOther").val($("#loadKeySingle_algorithm").val());
    }
    if ($("#loadKeySingle_algorithm option:selected").data("length") != "") {
        let maxKeylenBytes = parseInt($("#loadKeySingle_algorithm option:selected").data("length")*2);
        $("#buttonGenerateRandomKey").attr("disabled", false);
        $("#label_loadKeySingle_key").text("Key (hex): (0/" + maxKeylenBytes + " digits)");
    }
    else {
        $("#buttonGenerateRandomKey").attr("disabled", true);
        $("#label_loadKeySingle_key").text("Key (hex):");
    }
    $("#loadKeySingle_key").val("");
});

$("#loadKeySingle_toggleKeyVis").change(function() {
    //if ($("#loadKeySingle_key").attr("type") == "text") $("#loadKeySingle_key").attr("type", "password");
    //else if ($("#loadKeySingle_key").attr("type") == "password") $("#loadKeySingle_key").attr("type", "text");
    
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_toggleKeyVis-label']").attr("aria-valuenow") == "show") {
        $("#loadKeySingle_key").attr("type", "text");
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_toggleKeyVis-label']").attr("aria-valuenow") == "hide") {
        $("#loadKeySingle_key").attr("type", "password");
    }
});

$("#loadKeySingle_HexDec").change(function() {
    //console.log($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow"));
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "hex") {
        SwitchHexDec("hex");
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "dec") {
        SwitchHexDec("dec");
    }
});

$("#loadKeySingle_activeKeysetSlider").change(function() {
    //console.log($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow"));
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_activeKeysetSlider-label']").attr("aria-valuenow") == "no") {
        $("#loadKeySingle_keysetDiv").show();
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_activeKeysetSlider-label']").attr("aria-valuenow") == "yes") {
        $("#loadKeySingle_keysetDiv").hide();
    }
});

//$("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow");

$("#buttonConnectKfd").click(function() {
    //console.log("buttonConnectKfd clicked");
    ConnectToDevice();
});
$("#buttonGetDevices").click(function() {
    //console.log("buttonGetDevices clicked");
    
});

$("#buttonDisconnectKfd").click(function() {
    console.log("buttonDisconnectKfd clicked");
});

function DownloadEkc(keyContainer, password, filename) {
    $.mobile.loading("show", { text: "Processing...", textVisible: true});
    let outerContainerCompressed = CreateEkc(keyContainer, password);
    $.mobile.loading("hide");
    
    let link = document.createElement("a");
    if (filename == "") filename = Date.now();
    link.download = filename + ".ekc";
    let blob = new Blob([outerContainerCompressed]);
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
}

function clearPopupEkc() {
    $("#passwordEkc").val("");
    $("#inputFile").val("");
}

async function ConnectToDevice() {
    if (connected) {
        alert("KFD device already connected");
        return;
    }
    
    if (navigator.serial) {
        // Use Web Serial API
        console.log("Web Serial API supported");
        $("#connectionMethod").text("Web Serial API");
        connectionMethod = "ws";
        await connectSerial();
        //await connectPolyfill();
        ReadDeviceSettings();
    }
    else {
        // Use Polyfill API
        console.log("Web Serial API not supported, switching to Polyfill");
        $("#connectionMethod").text("Web Serial Polyfill");
        connectionMethod = "poly";
        await connectPolyfill();
        ReadDeviceSettings();
    }
}

async function ReadDeviceSettings() {
    let device = {};
    
    device.type = "KFDtool P25 KFD";
    
    let serial = await ReadSerialNumber();
    let serialString = serial.map(hex => String.fromCharCode(hex));
    device.serial = serialString.join("");
    $("#deviceProperties").html(device.serial);
    return;
    let fwVersion = await ReadFirmwareVersion();
    device.firmwareVersion = fwVersion.join(".");
    
    let apVersion = await ReadAdapterProtocolVersion();//NOTHING
    //device.adapterProtocolVersion = apVersion.join(".");
    
    let uniqueId = await ReadUniqueId();
    device.uniqueId = uniqueId.join("");
    
    let modelId = await ReadModelId();
    //device.modelId = modelId.join();
    device.modelId = modelId;
    
    let hwVersion = await ReadHardwareRevision();
    device.hardwareVersion = hwVersion.join(".");
    
    //console.log("device", device);
    
    $("#deviceProperties").html(
        "Device type: " + device.type + "<br>" +
        "Model: " + "KFD" + device.modelId + "00" + "<br>" +
        "Revision: " + device.hardwareVersion + "<br>" +
        "Firmware: " + device.firmwareVersion + "<br>" +
        "Serial: " + device.serial + "<br>" +
        "Unique ID: " + device.uniqueId
    );
}

function importFile(password) {
    ResetKeyContainer();
    
    var fr = new FileReader();
    fr.onload = async function() {
        let enc = new TextEncoder("utf-8");
        let dec = new TextDecoder("utf-8");
        let stuff = fr.result;
        var sliced = fr.result.slice(0, 4);
        var dataLength = new DataView(fr.result, 0, 4).getInt32(0, true);
        var compressedData = fr.result.slice(4);
        //console.log(compressedData);
        var inflated;
        try {
            inflated = pako.inflate(compressedData);
            //inflated = pako.inflate(new Uint8Array(compressedData) , {"to":"string"});
        }
        catch(e) {
            console.error(e);
            alert(e);
            return;
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

function LookupAlgId(algId) {
    switch(algId) {
        case 0: return "ACCORDION";
        case 1: return "BATON_ODD";
        case 2: return "FIREFLY";
        case 3: return "MAYFLY";
        case 4: return "SAVILLE";
        case 5: return "PADSTONE";
        case 65: return "BATON_EVEN";
        case 128: return "CLEAR";
        case 129: return "DESOFB";
        case 131: return "TDES";
        case 132: return "AES256";
        case 133: return "AES128";
        case 159: return "DESXL";
        case 160: return "DVIXL";
        case 161: return "DVPXL";
        case 170: return "ADP";
        default: return "UNKNOWN";
    }
}

function CheckKeyValidation(key) {
    //console.log(key);
    let returnVal = {
        valid: true,
        reason: ""
    };
    let matchingKeys = _keyContainer.keys.filter(function(obj) { return obj.Name === key.Name; });
    if (matchingKeys.length) {
        returnVal.valid = false;
        returnVal.reason = "Key name must be unique";
    }
    if (key.KeyTypeTek && (key.Sln >= 61440)) {
        returnVal.valid = false;
        returnVal.reason = "Key type set to TEK, but SLN indicates KEK";
    }
    else if (key.KeyTypeKek && (key.Sln <= 61439)) {
        returnVal.valid = false;
        returnVal.reason = "Key type set to KEK, but SLN indicates TEK";
    }
    return returnVal;
}

function PopulateKeys() {
    $("#keyContainerKeyList").empty();
    $("#addGroupKeyList").empty();
    //$("#addGroupKeyList").append('<div id="checkboxControls" class="ui-controlgroup-controls">');
    _keyContainer.keys.forEach(key => {
        //<li><a href="#"><h2>key 1</h2><p>AES-256, TEK, 3, 0002</p></a></li>
        //console.log(key);
        let keyType = "";
        if (key.KeyTypeAuto) {
            if (key.Sln >=0 && key.Sln <= 61439) keyType = "TEK";
            else if (key.Sln >= 61440 && key.Sln <= 65535) keyType = "KEK";
            else keyType = "Auto";
        }
        else {
            if (key.KeyTypeTek) keyType = "TEK";
            else keyType = "KEK";
        }
        
        // Add to listview
        let keyListItem = '<li data-key-id=' + key.Id + '><a href="#"><h2>' + key.Name + '</h2><p>' + LookupAlgId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</p></a></li>';
        $("#keyContainerKeyList").append(keyListItem);
        
        // Add to group checkbox
        //<label for="checkbox-1a"><p>key 1</p><p>AES-256, TEK, 3, 0002</p></label>
        //<input type="checkbox" name="checkbox-1a" id="checkbox-1a">
        
        //let groupItem = '<div class="ui-checkbox"><label for="checkbox-' + key.Id + '" class="ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-checkbox-off"><p data-key-id=' + key.Id + '>' + key.Name + '</p><p>' + LookupAlgId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</p></label>';
        //groupItem += '<input type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
        //$("#checkboxControls").append(groupItem);
        
        let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><span data-key-id=' + key.Id + '>' + key.Name + '</span><br><span class="keyCheckbox-small">' + LookupAlgId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</span></label>';
        groupCheckbox += '<input type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
        $("#addGroupKeyList").append(groupCheckbox);
    });
    $("#addGroupKeyList").append('</div>');
    $("#keyContainerKeyList").listview("refresh");
    $("[data-role=controlgroup]").enhanceWithin().controlgroup("refresh");
}

function PopulateGroups() {
    $("#keyContainerGroupList").empty();
    _keyContainer.groups.forEach(group => {
        //<li><a href="#"><h2>group 1</h2><p>5 keys</p></a></li>
        //console.log(group);
        let groupListItem = '<li data-group-id=' + group.Id + '><a href="#"><h2>' + group.Name + '</h2><p>' + group.Keys.length + ' keys</p></a></li>';
        $("#keyContainerGroupList").append(groupListItem);
        $("#keyContainerGroupList").listview("refresh");
    });
}

function AddKey(key) {
    //console.log(key);
    // Add key to _keyContainer as well as listviews and comboboxes
    key.Id = _keyContainer.nextKeyNumber;
    _keyContainer.keys.push(key);
    _keyContainer.nextKeyNumber++;
    
    let keyType = "";
    if (key.KeyTypeAuto) {
        if (key.Sln >=0 && key.Sln <= 61439) keyType = "TEK";
        else if (key.Sln >= 61440 && key.Sln <= 65535) keyType = "KEK";
        else keyType = "Auto";
    }
    else {
        if (key.KeyTypeTek) keyType = "TEK";
        else keyType = "KEK";
    }
    let keyListItem = '<li data-key-id=' + key.Id + '><a href="#"><h2>' + key.Name + '</h2><p>' + LookupAlgId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</p></a></li>';
    $("#keyContainerKeyList").append(keyListItem);
    let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><p data-key-id=' + key.Id + '>' + key.Name + '</p><p>' + LookupAlgId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</p></label>';
    groupCheckbox += '<input type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
    $("#addGroupKeyList").append(groupCheckbox);
    $("#keyContainerKeyList").listview("refresh");
    $("[data-role=controlgroup]").enhanceWithin().controlgroup("refresh");
}

function AddGroup(groupItem) {
    // Add key to _keyContainer as well as listviews and comboboxes
    groupItem.Id = _keyContainer.nextGroupNumber;
    _keyContainer.groups.push(groupItem);
    _keyContainer.nextGroupNumber++;
    
    let groupItemText = '<li data-group-id=' + group.Id + '><a href="#"><h2>' + group.Name + '</h2><p>' + group.Keys.length + ' keys</p></a></li>';
    $("#keyContainerGroupList").append(groupItem);
    $("#keyContainerGroupList").listview("refresh");
}

function DeleteKey(key_id) {
    // Remove key from _keyContainer as well as listviews and comboboxes and key groups
    _keyContainer.keys = _keyContainer.keys.filter(function(obj) {
        return obj.Id !== id;
    });
    $("li[data-key-id='" + key_id +"']").remove();
    $("div[data-checkbox-id='" + key_id +"']").remove();
    RemoveKeyFromAllGroups(key_id);
}

function DeleteGroup(group_id) {
    // Remove group from _keyContainer as well as listviews
    _keyContainer.groups = _keyContainer.groups.filter(function(obj) {
        return obj.Id !== id;
    });
    $("li[data-group-id='" + group_id +"']").remove();
}

function ResetKeyContainer() {
    // Clear all pages back to default
    _keyContainer = {
        keys: [],
        nextKeyNumber: 1,
        groups: [],
        nextGroupNumber: 1
    };
    
    $("#keyContainerKeyList").empty();
    $("#addGroupKeyList").empty();
    $("#keyContainerGroupList").empty();
}

function AddKeyToGroup(key_id, group_id) {
    for (let i=0;i<_keyContainer.groups.length;i++) {
        if (_keyContainer.groups[i].Id == group_id) {
            if (_keyContainer.groups[i].Keys.includes(key_id)) {
                console.log("Key already exists in group");                
            }
            else {
                _keyContainer.groups[i].Keys.push(key_id);
                console.log("Key added to group");
            }
            return;
        }
    }
    console.log("Group not found");
    return;
    /*
    let tempGroup = _keyContainer.groups.filter(function(obj) { return obj.Id === group_id; });
    console.log(tempGroup);
    alert("Check console to make sure tempGroup was found (=== vs ==)");
    if (tempGroup.keys.includes(key_id)) {
        alert("Group already includes key!");
        return;
    }
    tempGroup.keys.push(key_id);
    _keyContainer.groups = _keyContainer.groups.filter(function(obj) { return obj.Id !== group_id; });
    _keyContainer.groups.push(tempGroup);
    */
}

function RemoveKeyFromGroup(key_id, group_id) {
    for (let i=0;i<_keyContainer.groups.length;i++) {
        if (_keyContainer.groups[i].Id == group_id) {
            _keyContainer.groups[i].Keys = _keyContainer.groups[i].Keys.filter(function(e) { return e !== key_id; });
            console.log("Key removed from group");
            return;
        }
    }
    console.log("Key not found in group");
    return;
    /*
    let tempGroup = _keyContainer.groups.filter(function(obj) { return obj.Id === group_id; });
    console.log(tempGroup);
    alert("Check console to make sure tempGroup was found (=== vs ==)");
    if (!tempGroup.keys.includes(key_id)) {
        alert("Group does not include the key!");
        return;
    }
    tempGroup.keys = tempGroup.keys.filter(function(e) { return e !== key_id; });
    _keyContainer.groups = _keyContainer.groups.filter(function(obj) { return obj.Id !== group_id; });
    _keyContainer.groups.push(tempGroup);
    */
}

function RemoveKeyFromAllGroups(key_id) {
    let counter = 0;
    for (let i=0;i<_keyContainer.groups.length;i++) {
        if (_keyContainer.groups[i].Keys.includes(key_id)) {
            counter++;
            _keyContainer.groups[i].Keys = _keyContainer.groups[i].Keys.filter(function(e) { return e !== key_id; });
        }
    }
    console.log("Key removed from " + counter + " groups");
}

async function getDerivation(hash, salt, password, iterations, keyLength) {
    const textEncoder = new TextEncoder("utf-8");
    const passwordBuffer = textEncoder.encode(password);
    const importedKey = await window.crypto.subtle.importKey("raw", passwordBuffer, "PBKDF2", false, ["deriveBits","deriveKey"]);
    //const saltBuffer = textEncoder.encode(salt);
    const saltBuffer = salt;
    const params = {name: "PBKDF2", hash: hash, salt: saltBuffer, iterations: iterations};
    //const derivation = await window.crypto.subtle.deriveBits(params, importedKey, keyLength);
    const derivation = await window.crypto.subtle.deriveKey(params, importedKey, { name:"AES-CBC", length:256 }, true, ["encrypt","decrypt","unwrapKey","wrapKey"]);
    return derivation;
}

async function encrypt(text, keyObject) {
    const textEncoder = new TextEncoder("utf-8");
    const textBuffer = textEncoder.encode(text);
    const encryptedText = await window.crypto.subtle.encrypt({ name: 'AES-CBC', iv: keyObject.iv }, keyObject.key, textBuffer);
    return encryptedText;
}

async function decrypt(encrypedText, keyObject) {
    const textDecoder = new TextDecoder("utf-8");
    //const textBuffer = textDecoder.decode(text);
    const decryptedText = crypto.subtle.decrypt({ name: 'AES-CBC', iv: keyObject.iv }, keyObject.key, encrypedText);
    //console.log(decryptedText);
    return decryptedText;
    //return textDecoder.decode(decryptedText);
}

async function exportCryptoKey(key) {
    const exported = await window.crypto.subtle.exportKey(
        "raw",
        key
    );
    const exportedKeyBuffer = new Uint8Array(exported);
    return exportedKeyBuffer;
}

// Encryption examples
// https://stackoverflow.com/questions/64067812/how-to-properly-decrypt-text-via-subtle-crypto-which-was-encrypted-via-cryptojs
// https://stackoverflow.com/questions/59035805/crypto-subtle-derivekey-always-returns-undefined
// http://anandam.name/pbkdf2/
// https://diafygi.github.io/webcrypto-examples/
// https://github.com/diafygi/webcrypto-examples

function bytesToArrayBuffer(bytes) {
    const bytesAsArrayBuffer = new ArrayBuffer(bytes.length);
    const bytesUint8 = new Uint8Array(bytesAsArrayBuffer);
    bytesUint8.set(bytes);
    return bytesAsArrayBuffer;
}

//const port = await navigator.serial.requestPort({ filters: [filter] });


function SwitchHexDec(newVal) {
    inputType = newVal;
    if (newVal == "dec") {
        // Convert hexidecimal values to decimal
        $(".hexdec-input").each(function() {
            //console.log($(this));
            if ($(this).val() == "") return;
            let hexVal = $(this).val();
            let decVal = parseInt(hexVal, 16);
            $(this).val(decVal);
        });
    }
    else if (newVal = "hex") {
        // Convert decimal values to hexidecimal
        $(".hexdec-input").each(function() {
            //console.log($(this));
            if ($(this).val() == "") return;
            let decVal = parseInt($(this).val());
            let hexVal = decVal.toString(16).toUpperCase();
            $(this).val(hexVal);
        });
    }
}


