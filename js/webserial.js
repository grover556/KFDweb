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
let inputBase = 10;
let xmlDoc;

let secureContext = false;
if (document.location.protocol.includes("https")) secureContext = true;
else if ((document.location.host == "127.0.0.1") || (document.location.host == "localhost")) secureContext = true;

// Use this for decompressing Base64 salt from XML file, "/OuterContainer/KeyDerivation/Salt"
//https://developer.mozilla.org/en-US/docs/Web/API/atob
//var compressedData = "";
//var decompressedData = atob(compressedData);
//console.log(decompressedData);

//https://github.com/mdn/dom-examples/blob/master/web-crypto/encrypt-decrypt/aes-cbc.js

//https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications
const fileInputElement = document.getElementById("inputFile");

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


$("#buttonImportFile").on("click", function() {
    $("#popupImportEkc").popup("open");
});
$("#buttonCancelEkc").on("click", function() {
    $("#popupImportEkc").popup("close");
    clearPopupEkc();
});
$("#buttonOpenEkc").on("click", function() {
    if ($("#passwordEkc").val() == "") {
        alert("Please enter a password");
        return;
    }
    if (fileInputElement.files.length == 0) {
        alert("Please select a valid EKC file");
        return;
    }
    $("#popupImportEkc").popup("close");
    //importFile($("#passwordEkc").val());
    OpenEkc(fileInputElement.files[0], $("#passwordEkc").val());
    //loadFile();
    clearPopupEkc();
});
$("#buttonEraseKeysFromRadio").on("click", function() {
    if (window.confirm("Warning: this will erase all keys from the radio. Do you wish to continue?")) {
        
    }
});
$(".key-delete").on("click", function() {
    //console.log($(this).parent().data("keyset"));
    //console.log($(this).parent().data("sln"));
    let th = $(this).parent().parent();
    let keyset = th.data("keyset");
    let sln = th.data("sln");
    console.log(th, keyset, sln);
    if (window.confirm("WARNING: this will erase the key (Keyset ID: " + keyset + ", SLN/CKR: " + sln + ") from the radio. Do you wish to continue?")) {
        
    }
});
$(".keyset-activate").on("click", function() {
    //console.log($(this).parent().data("keyset"));
    //console.log($(this).parent().data("sln"));
    let th = $(this).parent().parent();
    let keyset_activate = th.data("keyset");
    //let keyset_active = th.data("active");
    let th2 = $("table#table_keysets tr[data-active='true']")[0];
    let keyset_deactivate = th2.attributes.getNamedItem("data-keyset").value;
    if (keyset_deactivate == 255) {
        alert("Error: Cannot deactivate KEK keyset");
        return;
    }
    //let keyset_deactivate = th2.data("keyset");
    //console.log(th2, keyset_activate, keyset_deactivate);
    if (window.confirm("WARNING: this will deactivate Keyset " + keyset_deactivate + ", and activate Keyset " + keyset_activate + " on the radio. Do you wish to continue?")) {
        
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
$("#buttonManageGroup_addGroup").on("click", function() {
    $(".menu_divs").hide();
    $("#addGroup").show();
});
$("#buttonManageKeyActions").on("click", function() {
    $("#popupMenuKeyOptions").popup("open");
});
$("#buttonLoadKeyToContainer").on("click", function() {
    let keyItem = CreateKeyFromFields("container");
    
    if (keyItem === undefined) {
        return;
    }

    let validation = KeyloadValidate(keyItem.KeysetId, keyItem.Sln, keyItem.KeyTypeKek, keyItem.KeyId, keyItem.AlgorithmId, keyItem.Key);
    if (validation.status == "Success") {
        AddKey(keyItem);
        ClearKeyInfo();
    }
    else if (validation.status == "Warning") {
        if (window.confirm("Warning: " + validation.message + " - do you wish to continue anyways?")) {
            AddKey(keyItem);
            ClearKeyInfo();
        }
    }
    else if (validation.status == "Error") {
        alert("Error: " + validation.message);
    }
});
$("#buttonLoadKeyToRadio").on("click", function() {
    let keyItem = CreateKeyFromFields("radio");
    
    if (keyItem === undefined) {
        return;
    }

    let validation = KeyloadValidate(keyItem.KeysetId, keyItem.Sln, keyItem.KeyTypeKek, keyItem.KeyId, keyItem.AlgorithmId, keyItem.Key);
    if (validation.status == "Success") {
        SendKeysToRadio([keyItem]);
        ClearKeyInfo();
    }
    else if (validation.status == "Warning") {
        if (window.confirm("Warning: " + validation.message + " - do you wish to continue anyways?")) {
            SendKeysToRadio([keyItem]);
            ClearKeyInfo();
        }
    }
    else if (validation.status == "Error") {
        alert("Error: " + validation.message);
    }
});


function CreateKeyFromFields(target) {
    // Disabled for use of inputBase, and replaced below on assigning keyItem fields
    /*
    let base = 10;
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "hex") {
        base = 16;
    }
    */
    let keyItem = {};
    let auto = false;
    let tek = false;
    let kek = false;
    if ($("input[name='radioKeyType']:checked").val() == "auto") auto = true;
    else if ($("input[name='radioKeyType']:checked").val() == "tek") tek = true;
    else if ($("input[name='radioKeyType']:checked").val() == "kek") kek = true;
    
    keyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSlider").val() == "yes" ? true : false;
    if (keyItem.ActiveKeyset) $("#loadKeySingle_keysetId").val("1");
    if ((target == "container") && ($("#loadKeySingle_name").val() == "")) {
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
    /*
    let keylen = parseInt($("#loadKeySingle_algorithm option:selected").data("length"));
    if (!isNaN(keylen)) {
        if ($("#loadKeySingle_key").val().length != keylen*2) {
            alert("Invalid key length");
            return;
        }
    }
    */
    keyItem.Name = $("#loadKeySingle_name").val();
    let matchingKeys = _keyContainer.keys.filter(function(obj) { return obj.Name === keyItem.Name; });
    if (matchingKeys.length) {
        alert("Key name must be unique");
        return;
    }
    
    keyItem.Id = _keyContainer.nextKeyNumber;
    keyItem.KeysetId = parseInt($("#loadKeySingle_keysetId").val(), inputBase);
    //keyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSlider").val() == "yes" ? true : false;
    keyItem.Sln = parseInt($("#loadKeySingle_SlnCkr").val(), inputBase);
    keyItem.KeyId = parseInt($("#loadKeySingle_keyId").val(), inputBase);
    keyItem.AlgorithmId = parseInt($("#loadKeySingle_algorithmOther").val(), inputBase);
    keyString = $("#loadKeySingle_key").val();
    if (keyString.length % 2 != 0) {
        alert("Key length is not valid");
        return;
    }
    let keyArray = [];
    for (var i = 0; i< keyString.length; i=i+2) {
        let pair = keyString[i] + keyString[i+1];
        keyArray.push(parseInt(pair , 16));
    }
    keyItem.Key = keyArray;
    if (auto) {
        if (keyItem.Sln >=0 && keyItem.Sln <= 61439) tek = true;
        else if (keyItem.Sln >= 61440 && keyItem.Sln <= 65535) kek = true;
    }
    keyItem.KeyTypeAuto = auto;
    keyItem.KeyTypeTek = tek;
    keyItem.KeyTypeKek = kek;
    
    
    if ((keyItem.KeysetId < 1) || (keyItem.KeysetId > 255)) {
        alert("Keyset ID out of range");
        return;
    }
    else if ((keyItem.Sln < 0) || (keyItem.Sln > 65535)) {
        alert("SLN/CKR out of range");
        return;
    }
    else if ((keyItem.KeyId < 0) || (keyItem.KeyId > 65535)) {
        alert("Key ID out of range");
        return;
    }
    /*
    if (keyItem.KeyTypeTek && (keyItem.Sln >= 61440)) {
        alert("Key type set to TEK, but SLN indicates KEK");
        return;
    }
    else if (keyItem.KeyTypeKek && (keyItem.Sln <= 61439)) {
        alert("Key type set to KEK, but SLN indicates TEK");
        return;
    }
    */
    return keyItem;
}

function SendKeysToRadio(keys) {
    console.log("SendKeysToRadio", keys);
    
    let keyItems = [];
    keys.forEach((k) => {
        let key = new KeyItem();
        let cmdKey = new CmdKeyItem(k.ActiveKeyset, k.KeysetId, k.Sln, k.KeyTypeKek, k.KeyId, k.AlgorithmId, k.Key);
        key.SLN = k.Sln;
        key.KeyId = k.KeyId;
        key.Key = k.Key;
        key.KEK = k.KeyTypeKek;
        //keyItems.push(key);
        keyItems.push(cmdKey);
        //console.log(key);
        //console.log(key.ToBytes());
    });
    //console.log(keyItems);

    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let results = mra.Keyload(keyItems);
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

$("#buttonGenerateRandomKey").on("click", function() {
    // Generate a random key
    let key = "";
    let keylen = $("#loadKeySingle_algorithm option:selected").data("length");
    let parity = $("#loadKeySingle_algorithm option:selected").data("parity");
    key = generateRandomKey(keylen, parity);
    $("#loadKeySingle_key").val(key);
    $("#loadKeySingle_key").attr("maxlength", keylen*2);
    $("#label_loadKeySingle_key").text("Key (hex): (" + keylen*2 + "/" + keylen*2 + " digits)");
    // Flash the key field to indicate that a new key has been generated
    $("#loadKeySingle_key").fadeTo(100, 0.25, function() { $(this).fadeTo(500, 1.0); });
});
$("#inputFile").on("change", function() {
    $("#passwordEkc").focus();
});
$("#passwordEkc").on("keyup", function(event) {
    //console.log(event);
    //event.key = "Enter", event.which = 13, event.keyCode = 13
    if (event.which == 13) {
        $("#buttonOpenEkc").trigger("click");
    }
});
$("#loadKeySingle_name").on("keyup", function(event) {
    // Limit key name to valid ASCII characters
    //https://en.wikipedia.org/wiki/List_of_Unicode_characters
    let str = $("#loadKeySingle_name").val().replace(/[\u{0000}-\u{001F}]/gu,"");
    str = str.replace(/[\u{007F}-\u{FFFF}]/gu,"");
    $("#loadKeySingle_name").val(str);
});
$(".hex-input").on("keyup", function() {
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
        /*
        if (textInput.val().length > maxKeylenBytes) {
            //textInput.val(textInput.val().slice(0, -1));
            textInput.val(textInput.val().slice(0, maxKeylenBytes));
        }
        */
        $("#label_" + eleId).text("Key (hex): (" + textInput.val().length + "/" + maxKeylenBytes + " digits)");
    }
    else {
        let curVal = $(this).val();
        $(this).val(curVal.replace(/[^a-fA-F0-9\n\r]+/g, '').toUpperCase());
    }
});
$(".dec-input").on("keyup", function() {
    let curVal = $(this).val();
    $(this).val(curVal.replace(/[^0-9\n\r]+/g, ''));
});
$(".hexdec-input").on("keyup", function() {
    // Ensure that only decimal or hexidecimal values are input
    let curVal = $(this).val();
    if (inputType == "dec") {
        $(this).val(curVal.replace(/[^0-9\n\r]+/g, ''));
    }
    else if (inputType == "hex") {
        $(this).val(curVal.replace(/[^a-fA-F0-9\n\r]+/g, '').toUpperCase());
    }
    if ($(this).data().hasOwnProperty("maxValue")) {
        let minValue = $(this).data("minValue");
        let maxValue = $(this).data("maxValue");
        let maxLength = maxValue.toString(inputBase).length;
        $(this).attr("maxlength", maxLength);//Doesn't work right when 5 digits are entered in Dec mode then switch to Hex - maxlength is still 5, which allows FFFFF to be entered
        let actualValue = parseInt($(this).val(), inputBase);
        if ((actualValue < minValue) || (actualValue > maxValue)) {
            $(this).parent().addClass("invalid");
            $(this).parent().removeClass("ui-body-inherit");
        }
        else {
            $(this).parent().removeClass("invalid");
            $(this).parent().addClass("ui-body-inherit");
        }
    }
});

$("#loadKeySingle_key").on("focusin", function(evt) {
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

$("input:file").on("change", function() {
    //var fileName = $(this).val();
    //console.log(fileName);
});
$("#loadKeySingle_algorithm").on("change", function() {
    // Clear the key entry input when a new algorithm is selected
    let maxKeylenBytes = 64;
    if ($("#loadKeySingle_algorithm").val() == "256") {
        $("#loadKeySingle_algorithmOtherDiv").show();
        $("#loadKeySingle_algorithmOther").val("");
    }
    else {
        $("#loadKeySingle_algorithmOtherDiv").hide();
        $("#loadKeySingle_algorithmOther").val($("#loadKeySingle_algorithm").val());
    }
    if ($("#loadKeySingle_algorithm option:selected").data("length") != "") {
        maxKeylenBytes = parseInt($("#loadKeySingle_algorithm option:selected").data("length")*2);
        $("#buttonGenerateRandomKey").attr("disabled", false);
        $("#label_loadKeySingle_key").text("Key (hex): (0/" + maxKeylenBytes + " digits)");
    }
    else {
        $("#buttonGenerateRandomKey").attr("disabled", true);
        $("#label_loadKeySingle_key").text("Key (hex):");
    }
    $("#loadKeySingle_key").val("");
    $("#loadKeySingle_key").attr("maxlength", maxKeylenBytes);
});
$("#loadKeySingle_toggleKeyVis").on("change", function() {
    //if ($("#loadKeySingle_key").attr("type") == "text") $("#loadKeySingle_key").attr("type", "password");
    //else if ($("#loadKeySingle_key").attr("type") == "password") $("#loadKeySingle_key").attr("type", "text");
    
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_toggleKeyVis-label']").attr("aria-valuenow") == "show") {
        $("#loadKeySingle_key").attr("type", "text");
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_toggleKeyVis-label']").attr("aria-valuenow") == "hide") {
        $("#loadKeySingle_key").attr("type", "password");
    }
});
$("#loadKeySingle_HexDec").on("change", function() {
    //console.log($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow"));
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "hex") {
        SwitchHexDec("hex");
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "dec") {
        SwitchHexDec("dec");
    }
});
$("#loadKeySingle_activeKeysetSlider").on("change", function() {
    //console.log($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow"));
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_activeKeysetSlider-label']").attr("aria-valuenow") == "no") {
        $("#loadKeySingle_keysetDiv").show();
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_activeKeysetSlider-label']").attr("aria-valuenow") == "yes") {
        $("#loadKeySingle_keysetDiv").hide();
    }
});

//$("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow");

$("#buttonConnectKfd").on("click", function() {
    //console.log("buttonConnectKfd clicked");
    ConnectToDevice();
});
$("#buttonGetDevices").on("click", function() {
    //console.log("buttonGetDevices clicked");
    
});

$("#buttonDisconnectKfd").on("click", function() {
    console.log("buttonDisconnectKfd clicked");
});

$("#buttonSendTest").on("click", async function() {
    console.log("buttonSendTest clicked");
    //let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();
    //let rspKmmBody1 = TxRxKmm(cmdKmmBody1);
    //console.log(rspKmmBody1);
    //console.log(cmdKmmBody1);
    //console.log(cmdKmmBody1.ToBytes());
    
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let testResults = mra.TestMessage();

/*
    let testResults;
    testResults = await ap.SendKeySignature();
    
    testResults = await ap.SendData(OPCODE_READY_REQ);
    testResults = await ap.SendData(
        [
            0xc2,0x00,0x11,0x00,0xff,0xff,0xff,
            0x0d,0x00,0x08,0x80,0xff,0xff,0xff,
            0xff,0xff,0xff,0x02,0x3b,0x80
        ]
    );
    testResults = await ap.SendData(OPCODE_TRANSFER_DONE);
    testResults = await ap.SendData(OPCODE_DISCONNECT);
*/
    //console.log(testResults);
});

async function DownloadEkc(keyContainer, password, filename) {
    $.mobile.loading("show", { text: "Processing...", textVisible: true});
    let outerContainerCompressed = await CreateEkc(keyContainer, password);
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
        //readUntilClosed();
        //await connectPolyfill();
        if (connected) ReadDeviceSettings();
    }
    else {
        // Use Polyfill API
        console.log("Web Serial API not supported, switching to Polyfill");
        $("#connectionMethod").text("Web USB Polyfill");
        connectionMethod = "poly";
        await connectPolyfill();
        if (connected) await ReadDeviceSettings();
    }
}

async function ReadDeviceSettings() {
    let device = {};
    
    device.type = "KFDtool P25 KFD";

    let ap = new AdapterProtocol();
    
    let apVersion = await ap.ReadAdapterProtocolVersion();//NOTHING
    device.adapterProtocolVersion = apVersion.join(".");
    
    let fwVersion = await ap.ReadFirmwareVersion();
    device.firmwareVersion = fwVersion.join(".");
    
    let uniqueId = await ap.ReadUniqueId();
    device.uniqueId = uniqueId.join("");
    
    let modelId = await ap.ReadModelId();
    ////device.modelId = modelId.join();
    device.modelId = modelId;
    
    let hwVersion = await ap.ReadHardwareRevision();
    device.hardwareVersion = hwVersion.join(".");

    let serial = await ap.ReadSerialNumber();
    let serialString = serial.map(hex => String.fromCharCode(hex));
    device.serial = serialString.join("");
    ////$("#deviceProperties").html(device.serial);
    
    //console.log("device", device);
    
    $("#deviceProperties").html(
        "Device type: " + device.type + "<br>" +
        "Model: " + "KFD" + device.modelId + "00" + "<br>" +
        "Revision: " + device.hardwareVersion + "<br>" +
        "Firmware: " + device.firmwareVersion + "<br>" +
        "Protocol: " + device.adapterProtocolVersion + "<br>" +
        "Serial: " + device.serial + "<br>" +
        "Unique ID: " + device.uniqueId
    );
    
}

function ReadFileAsync(file) {
    return new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
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
    //$("#addGroupKeyList").append('</div>');
    $("#keyContainerKeyList").listview("refresh");
    $("[data-role=controlgroup]").enhanceWithin().controlgroup("refresh");
    $(".menu_divs").hide();
    $("#manageKeys").show();
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
    //let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><span data-key-id=' + key.Id + '>' + key.Name + '</span><br><span>' + LookupAlgId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</span></label>';
    //groupCheckbox += '<input type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
    let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><span data-key-id=' + key.Id + '>' + key.Name + '</span><br><span class="keyCheckbox-small">' + LookupAlgId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</span></label>';
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

function SwitchHexDec(newVal) {
    inputType = newVal;
    if (newVal == "dec") {
        inputBase = 10;
        // Convert hexidecimal values to decimal
        $(".hexdec-input").each(function() {
            if ($(this).val() == "") return;
            let hexVal = $(this).val();
            let decVal = parseInt(hexVal, 16);
            $(this).val(decVal);
        });
    }
    else if (newVal = "hex") {
        inputBase = 16;
        // Convert decimal values to hexidecimal
        $(".hexdec-input").each(function() {
            if ($(this).val() == "") return;
            let decVal = parseInt($(this).val());
            let hexVal = decVal.toString(16).toUpperCase();
            $(this).val(hexVal);
        });
    }
}


