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
    DisableKfdButtons();
});

$("#linkLicensingInformation").on("click", function() {
    $("#popupLicensingInformation").popup("open");
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
$("#table_keyinfo tbody").on("click", "a.key-delete", function() {
    let tr = $(this).parent().parent();
    let keyset = tr.data("keysetid");
    let sln = tr.data("sln");
    //console.log("Delete key: KSID=" + keyset + ", SLN=" + sln);
    if (window.confirm("Warning: this will erase the key (Keyset ID: " + keyset + ", SLN/CKR: " + sln + ") from the radio. Do you wish to continue?")) {
        let keyItems = [];
        let item = new CmdKeyItem();
        item.KeysetId = keyset;
        item.Sln = sln;
        if (sln >=0 && sln <= 61439) item.IsKek = false;
        else if (sln >= 61440 && sln <= 65535) item.IsKek = true;
        keyItems.push(item);
        EraseKeysFromRadio(keyItems);
    }
});
$("#table_keysets tbody").on("click", "a.keyset-activate", function() {
    let tr = $(this).parent().parent();
    let keyset_activate = tr.data("keysetid");
    let tr2 = $("table#table_keysets tr[data-active='true']")[0];
    let keyset_deactivate = parseInt(tr2.attributes.getNamedItem("data-keysetid").value);
    //console.log("Activate " + keyset_activate + ", deactivate " + keyset_deactivate);
    if (keyset_deactivate == 255) {
        alert("Error: Cannot deactivate KEK keyset");
        return;
    }
    if (window.confirm("Warning: this will deactivate Keyset " + keyset_deactivate + ", and activate Keyset " + keyset_activate + " on the radio. Do you wish to continue?")) {
        Changeover(keyset_deactivate, keyset_activate);
    }
});
$("#table_rsiItems tbody").on("click", "a.rsi-change", function() {
    //console.log($(this).parent().parent()[0].dataset);
    // This should trigger mra.???
    let tr = $(this).parent().parent();
    let rsi = parseInt(tr.data("rsiid"));
    console.log(rsi);
});
$("#table_kmfRsi tbody").on("click", "a.kmf-rsi-change", function() {
    //console.log($(this).parent().parent()[0].dataset);
    // This should trigger mra.LoadConfig(rsi, mn);
    let tr = $(this).parent().parent();
    let rsi = parseInt(tr.data("rsiid"));
    console.log(rsi);
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
$("#buttonCheckConnection").on("click", async function() {
    CheckMrConnection();
});
$("#buttonViewKeyInformation").on("click", function() {
    ViewKeyInformation();
});
$("#buttonViewKeysetInformation").on("click", function() {
    ViewKeysetInformation();
});
$("#buttonViewRsiInformation").on("click", function() {
    ViewRsiInformation();
});
$("#buttonViewKmfInformation").on("click", function() {
    ViewKmfInformation();
});
$("#buttonEraseAllKeysFromRadio").on("click", function() {
    if (window.confirm("Warning: this will erase all keys from the radio. This action CANNOT be undone. Do you wish to continue?")) {
        EraseAllKeysFromRadio();
    }
});
$("#buttonSetClock").on("click", function() {
    SetRadioClock();
});
$("#buttonGetCapabilities").on("click", function() {
    GetRadioCapabilities();
});
$("#buttonAddRsi").on("click", function() {
    //ChangeRsiValues("GROUP", 0, 10000000, 0);// Add group RSI
    //ChangeRsiValues("INDIVIDUAL", 0, 9999998, 0);// Add individual RSI
    //ChangeRsiValues("KMF", 0, 9999990, 0);// Add group RSI
    //ChangeRsiValues("GROUP", 10000000, 0, 0); // Delete group RSI
    //ChangeRsiValues("INDIVIDUAL", 9999998, 0, 0);// Delete individual RSI
    //ChangeRsiValues("KMF", 9999990, 0, 0);// Delete KMF RSI

    //ChangeRsiValues("KMF", 9999990, 9999991, 65534);// TEST
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

async function SendKeysToRadio(keys) {
    if (!connected) return;
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
    let results;
    try {
        ShowLoading();
        DisableKfdButtons();
        results = await mra.Keyload(keyItems);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (results !== undefined) {
        console.log(results);
    }
}

async function ViewKeyInformation() {
    if (!connected) return;
    $("#table_keyinfo tbody").empty();
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let keys;
    try {
        ShowLoading();
        DisableKfdButtons();
        keys = await mra.ViewKeyInfo();
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (keys !== undefined) {
        //$("#table_keyinfo tbody").empty();
        keys.forEach((keyItem) => {
            let algId = Object.keys(AlgorithmId).find(key => AlgorithmId[key] === keyItem.AlgorithmId);
            let row = '<tr data-keysetid="' + keyItem.KeysetId + '" data-sln="' + keyItem.Sln + '" data-keyid="' + keyItem.KeyId + '" data-algorithm="' + algId + '"><th>' + keyItem.KeysetId + "</th><th>" + keyItem.Sln + "</th><th>" + keyItem.KeyId + "</th><th>" + algId + "</th><th><a class='key-delete' href='#'>Delete</a></th></tr>";
            $("#table_keyinfo").append(row);
            $("#table_keyinfo").table("refresh");
        });
    }
}

$("table thead tr th").on("click", function() {
    let tableId = $(this).parent().parent().parent()[0].id;
    let fieldName = $(this)[0].textContent.replace(" ", "").toLowerCase();
    if (fieldName != "action") {
        sortTable(tableId, fieldName);
    }
});

function sortTable(table, field) {
    //$("#table_keyinfo tbody tr").sort(sort_sln).appendTo("#table_keyinfo tbody");
    console.log("sorting " + table + " by " + field);
    if (field == "sln") {
        $("#" + table + " tbody tr").sort(sln).appendTo("#" + table + " tbody");
    }
    else if (field == "keysetid") {
        $("#" + table + " tbody tr").sort(keysetid).appendTo("#" + table + " tbody");
    }
    else if (field == "keyid") {
        $("#" + table + " tbody tr").sort(keyid).appendTo("#" + table + " tbody");
    }
    else if (field == "algorithm") {
        $("#" + table + " tbody tr").sort(algorithm).appendTo("#" + table + " tbody");
    }
    else if (field == "keysetname") {
        $("#" + table + " tbody tr").sort(keysetname).appendTo("#" + table + " tbody");
    }
    else if (field == "keysettype") {
        $("#" + table + " tbody tr").sort(keysettype).appendTo("#" + table + " tbody");
    }
    else if (field == "activedatetime") {
        $("#" + table + " tbody tr").sort(activedatetime).appendTo("#" + table + " tbody");
    }
    else if (field == "rsiid") {
        $("#" + table + " tbody tr").sort(rsiid).appendTo("#" + table + " tbody");
    }
    else if (field == "messagenumber") {
        $("#" + table + " tbody tr").sort(messagenumber).appendTo("#" + table + " tbody");
    }

    // < is ascending, > is descending
    function sln(a, b) { return ($(b).data("sln")) < ($(a).data("sln")) ? 1 : -1; }
    function keysetid(a, b) { return ($(b).data("keysetid")) < ($(a).data("keysetid")) ? 1 : -1; }
    function keyid(a, b) { return ($(b).data("keyid")) < ($(a).data("keyid")) ? 1 : -1; }
    function algorithm(a, b) { return ($(b).data("algorithm")) < ($(a).data("algorithm")) ? 1 : -1; }
    function keysetname(a, b) { return ($(b).data("keysetname")) < ($(a).data("keysetname")) ? 1 : -1; }
    function keysettype(a, b) { return ($(b).data("keysettype")) < ($(a).data("keysettype")) ? 1 : -1; }
    function activedatetime(a, b) { return ($(b).data("keysetactivedatetime")) < ($(a).data("keysetactivedatetime")) ? 1 : -1; }
    function rsiid(a, b) { return ($(b).data("rsiid")) < ($(a).data("rsiid")) ? 1 : -1; }
    function messagenumber(a, b) { return ($(b).data("messagenumber")) < ($(a).data("messagenumber")) ? 1 : -1; }

    $("#tableIncidents").table("refresh");
}

async function ViewKeysetInformation() {
    if (!connected) return;
    $("#table_keysets tbody").empty();
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let activeKeysetId;
    let results;
    try {
        ShowLoading();
        DisableKfdButtons();
        activeKeysetId = await mra.ListActiveKsetIds();
        results = await mra.ViewKeysetTaggingInfo();
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if ((activeKeysetId !== undefined) && (results !== undefined)) {
        //$("#table_keysets tbody").empty();
        results.forEach((keyset) => {
            let activeFlag = false;
            let activateFlag = "";
            let activationDateTime = "";
            let ksadt = "";

            if (keyset.KeysetId == activeKeysetId) {
                activeFlag = true;
            }

            if ((!activeFlag) && keyset.KeysetId != 255) {
                activateFlag = '<a class="keyset-activate" href="#">Activate</a>';
            }

            if (keyset.ActivationDateTime !== undefined) {
                activationDateTime = keyset.ActivationDateTime.toISOString();
                ksadt = activationDateTime;
                activationDateTime = activationDateTime.replace("T", " ");
                activationDateTime = activationDateTime.replace("Z", "");
            }
            
            //<tr data-keysetid="1" data-active="true"><th>Yes</th><th>1</th><th>SET 01</th><th>TEK</th><th>2022-08-01 07:00</th><th></th></tr>
            let row = '<tr data-keysetid="' + keyset.KeysetId + '" data-keysetname="' + keyset.KeysetName + '" data-keysettype="' + keyset.KeysetType + '" data-keysetactivedatetime="' + ksadt + '" data-active="' + (activeFlag || keyset.KeysetId == 255) + '"><th class="th-active-flag">' + ((activeFlag || keyset.KeysetId == 255) ? "Yes" : "No") + '</th><th>' + keyset.KeysetId + '</th><th>' + keyset.KeysetName + '</th><th>' + keyset.KeysetType + '</th><th>' + activationDateTime + '</th><th class="th-action-flag">' + activateFlag + '</th></tr>';
            $("#table_keysets").append(row);
            $("#table_keysets").table("refresh");
        });
    }
}

async function ViewKmfInformation() {
    if (!connected) return;
    $("#table_kmfRsi tbody").empty();
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let rsi, mnp;
    try {
        ShowLoading();
        DisableKfdButtons();
        rsi = await mra.ViewKmfRsi();
        mnp = await mra.ViewMnp();
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if ((rsi !== undefined) && (mnp !== undefined)) {
        let row = '<tr data-rsiid="' + rsi + '" data-messagenumber="' + mnp + '"><th>KMF</th><th>' + rsi + "</th><th>" + mnp + "</th><th><a class='kmf-rsi-change' href='#'>Change</a></th></tr>";
        $("#table_kmfRsi").append(row);
        $("#table_kmfRsi").table("refresh");
    }
}

async function ViewRsiInformation() {
    if (!connected) return;
    $("#table_rsiItems tbody").empty();
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let rsiItems;
    try {
        ShowLoading();
        DisableKfdButtons();
        rsiItems = await mra.ViewRsiItems();
        
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (rsiItems !== undefined) {
        console.log(rsiItems);//rsiItems[0].MN, .RSI, .Status
        //$("#valueKmfRsi").text(rsi);
        //$("#table_rsiItems tbody").empty();
        rsiItems.forEach((rsi) => {
            let rsiType = "Unknown";
            if ((rsi.RSI > 0) && (rsi.RSI < 9999999)) rsiType = "Individual";
            else if ((rsi.RSI > 9999999) && (rsi.RSI < 16777216)) rsiType = "Group"
            //<tr data-keysetid="1" data-active="true"><th>Yes</th><th>1</th><th>SET 01</th><th>TEK</th><th>2022-08-01 07:00</th><th></th></tr>
            let row = '<tr data-rsiid="' + rsi.RSI + '" data-messagenumber="' + rsi.MN + '"><th>' + rsiType + '</th><th>' + rsi.RSI + "</th><th>" + rsi.MN + "</th><th><a class='rsi-change' href='#'>Change</a></th></tr>";
            $("#table_rsiItems").append(row);
            $("#table_rsiItems").table("refresh");
        });
    }
}

async function EraseKeysFromRadio(keyItems) {
    console.log(keyItems);
    if (!connected) return;
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.EraseKeys(keyItems);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (result !== undefined) {
        console.log(result);
        result.Keys.forEach((key) => {
            if (key.Status != 0) {
                console.log(OperationStatusExtensions.ToReasonString(key.Status));
            }
        });
        // Remove keys from list
        keyItems.forEach((key) => {
            $("#table_keyinfo tr[data-keysetid='" + key.KeysetId + "'][data-sln='" + key.Sln + "']").remove();
        });
    }
}

async function EraseAllKeysFromRadio() {
    if (!connected) return;
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.EraseAllKeys();
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (result !== undefined) {
        alert("Radio has been zeroized");
        $("#table_keysets tbody").empty();
    }
}

async function CheckMrConnection() {
    if (!connected) return;
    let twp = new ThreeWireProtocol();
    let mrConnected;
    try {
        ShowLoading();
        DisableKfdButtons();
        await twp.CheckTargetMrConnection();
        mrConnected = true;
    }
    catch (error) {
        //console.error(error);
        mrConnected = false;
        alert("There was a problem connecting to the MR");
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (mrConnected) {
        
    }
}

async function SetRadioClock() {
    if (!connected) return;
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.SetDateTime();
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (result !== undefined) {
        
    }
}

async function GetRadioCapabilities() {
    if (!connected) return;
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.GetCapabilities();
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (result !== undefined) {
        $("#table_supportedAlgorithms tbody").empty();
        $("#table_supportedMessages tbody").empty();
        $("#table_supportedServices tbody").empty();
        result.AlgorithmIds.forEach((algId) => {
            let row = "<tr><th>" + LookupAlgorithmId(algId) + "</th></tr>";
            $("#table_supportedAlgorithms").append(row);
        });
        result.MessageIds.forEach((mId) => {
            let row = "<tr><th>" + LookupMessageId(mId) + "</th></tr>";
            $("#table_supportedMessages").append(row);
        });
        result.OptionalServices.forEach((osId) => {
            let row = "<tr><th>" + LookupOptionalServiceId(osId) + "</th></tr>";
            $("#table_supportedServices").append(row);
        });
        
        $("#table_supportedAlgorithms").table("refresh");
        $("#table_supportedMessages").table("refresh");
        $("#table_supportedServices").table("refresh");
    }
}

async function Changeover(ksidSuperseded, ksidActivated) {
    if (!connected) return;
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.ActivateKeyset(ksidSuperseded, ksidActivated);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (result !== undefined) {
        //console.log(result);
        //result.KeysetIdActivated;
        //result.KeysetIdSuperseded;
        //$("li[data-key-id='" + key_id +"']").remove();
        //let activateFlag = '<a class="keyset-activate" href="#">Activate</a>';
        //$("#table_keysets tbody tr[data-keysetid='" + result.KeysetIdActivated + "'] th.th-action-flag").innerText = "";
        //$("#table_keysets tbody tr[data-keysetid=''] th");

        $("#table_keysets tbody tr[data-keysetid=" + result.KeysetIdSuperseded + "] th.th-action-flag").append($("#table_keysets tbody tr[data-keysetid=" + result.KeysetIdActivated + "] th.th-action-flag a")[0]);
    }
}

async function ChangeRsiValues(rsiType, rsiOld, rsiNew, mnp) {
    if (!connected) return;
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.ChangeRsi(rsiOld, rsiNew, mnp);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (result !== undefined) {
        if (result.Status == 0) {
            console.log("success");
            if (rsiType == "KMF") {
                ViewKmfInformation();
            }
            else {
                ViewRsiInformation();
            }
        }
        else if (result.Status == 1) {
            alert("Error: command not performed");
        }
        else if (result.Status == 2) {
            alert("Error: attempted to add/change/delete an RSI that is not in the SU");
        }
        else if (result.Status == 5) {
            alert("Error: attempted to add more RSIs than the maximum allowed");
        }
    }
}

async function DeleteKeysFromRadio(keyInfos) {
    //keyInfos = [{"algorithmId": 170, "keyId": 999}, {...}];
    if (!connected) return;
    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.DeleteKeys(keyInfos);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    if (result !== undefined) {
        console.log(result.KeyStatus);
    }
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
    ConnectDevice();
});
$("#buttonGetDevices").on("click", function() {
    //console.log("buttonGetDevices clicked");
    
});

$("#buttonDisconnectKfd").on("click", function() {
    //console.log("buttonDisconnectKfd clicked");
    DisconnectDevice();
});

function ShowLoading() {
    $.mobile.loading("show", { text: "Processing...", textVisible: true});
}
function HideLoading() {
    $.mobile.loading("hide");
}

async function DownloadEkc(keyContainer, password, filename) {
    ShowLoading();
    let outerContainerCompressed = await CreateEkc(keyContainer, password);
    HideLoading();
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

async function ConnectDevice() {
    if (connected) {
        alert("KFD device already connected");
        return;
    }
    
    if (navigator.serial) {
        // Use Web Serial API
        console.log("Web Serial API supported");
        $("#connectionMethod").text("Web Serial API");
        connectionMethod = "ws";
        const connection = await connectSerial();
        const reading = readUntilClosed();
        //await connectPolyfill();
        if (connected) {
            ShowDeviceConnected();
            await ReadDeviceSettings();
        }
    }
    else {
        // Use Polyfill API
        console.log("Web Serial API not supported, switching to Polyfill");
        $("#connectionMethod").text("Web USB Polyfill");
        connectionMethod = "poly";
        const connection = await connectPolyfill();
        //const reading = readUntilClosed();
        if (connected) {
            ShowDeviceConnected();
            await ReadDeviceSettings();
        }
    }
}

function ShowDeviceConnected() {
    $("#iconConnectionStatus").css("background-color", "#aaffaa");
    $("#buttonConnectKfd").prop("disabled", true);
    $("#buttonDisconnectKfd").prop("disabled", false);
    $(".button-kfd").attr("disabled", false);
    $("#connectionStatus").text("Connected");
}

function ShowDeviceDisconnected() {
    $("#iconConnectionStatus").css("background-color", "#ffaaaa");
    $("#buttonConnectKfd").prop("disabled", false);
    $("#buttonDisconnectKfd").prop("disabled", true);
    $(".button-kfd").attr("disabled", true);
    $("#connectionStatus").text("Disconnected");
    $("#deviceProperties").html("");
}

function EnableKfdButtons() {
    $(".button-kfd").attr("disabled", false);
}
function DisableKfdButtons() {
    $(".button-kfd").attr("disabled", true);
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
        let keyListItem = '<li data-key-id=' + key.Id + '><a href="#"><h2>' + key.Name + '</h2><p>' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</p></a></li>';
        $("#keyContainerKeyList").append(keyListItem);
        
        // Add to group checkbox
        //<label for="checkbox-1a"><p>key 1</p><p>AES-256, TEK, 3, 0002</p></label>
        //<input type="checkbox" name="checkbox-1a" id="checkbox-1a">
        
        //let groupItem = '<div class="ui-checkbox"><label for="checkbox-' + key.Id + '" class="ui-btn ui-corner-all ui-btn-inherit ui-btn-icon-left ui-checkbox-off"><p data-key-id=' + key.Id + '>' + key.Name + '</p><p>' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</p></label>';
        //groupItem += '<input type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
        //$("#checkboxControls").append(groupItem);
        
        let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><span data-key-id=' + key.Id + '>' + key.Name + '</span><br><span class="keyCheckbox-small">' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</span></label>';
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
    let keyListItem = '<li data-key-id=' + key.Id + '><a href="#"><h2>' + key.Name + '</h2><p>' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</p></a></li>';
    $("#keyContainerKeyList").append(keyListItem);
    //let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><span data-key-id=' + key.Id + '>' + key.Name + '</span><br><span>' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</span></label>';
    //groupCheckbox += '<input type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
    let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><span data-key-id=' + key.Id + '>' + key.Name + '</span><br><span class="keyCheckbox-small">' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</span></label>';
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

function DeleteKeyFromContainer(key_id) {
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


