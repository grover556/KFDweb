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

let usbDevice = undefined;
let usbMode = "none";

let dliBridgeSettings = {
    hostname: "localhost",
    bridgePort: 8080,
    keyloadingPort: 49644,
    token: ""
};
let bridgeConnection = { readyState: 0 };
let bridgeConnected = false;

let canceltransferFlag = false;

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
        description = "This page is being hosted on a non-HTTPS server. Because of this, you are unable to communicate with a KFD or open or save key containers. Please ensure the page is hosted either on a HTTPS server or a localhost instance.";
    }
    $("#secureContextStatus").text(status);
    $("#secureContextDetails").text(description);
    $(".keyContainerFileName").text(_keyContainer.source);
    if (navigator.serial) {
        console.log("Web Serial API supported");
        connectionMethod = "webserial";
        $("#connectionMethod").text("Web Serial API");
        document.querySelector("#selectConnectionMethod option[value='webserial']").selected = true;
    }
    else if (navigator.usb) {
        console.log("Web Serial API not supported, using WebUSB API");
        connectionMethod = "webusb";
        $("#connectionMethod").text("WebUSB API");
        document.querySelector("#selectConnectionMethod option[value='webusb']").selected = true;
    }
    else {
        connectionMethod = "none";
        console.log("Browser does not support Web Serial API or WebUSB API");
        $("#connectionMethod").text("Browser does not support Web Serial API or WebUSB API");
        document.querySelector("#selectConnectionMethod option[value='none']").selected = true;
    }
    DisableKfdButtons();
    document.querySelector("#kfdOptions_dliBridgeToken").value = generateRandomKey(32, false);
    GenerateDliCli();
});

$(".nav-item").on("click", function() {
    var menuName = $(this).attr("id").replace("menu_", "");
    document.querySelectorAll(".menu_divs").forEach((i) => i.hidden = true);
    // Do better
    try { document.querySelector(`#${menuName}`).hidden = false; }
    catch (e) {}

    //document.querySelectorAll(".menuItem").forEach((i) => i.removeAttribute("active"));
    //$(this).attr("active", "");
    document.querySelectorAll(".nav-link.active").forEach((i) => i.classList.remove("active"));
    $(this)[0].children[0].classList.add("active");

    //loadKeyMultiple and regenerateKeys share same fieldsets
    if (menuName == "regenerateKeys") {
        //document.querySelector("#loadKeyMultiple").heading = "Regenerate Keys";
        document.querySelector("#loadKeyMultiple_heading").innerText = "Regenerate Keys";
        document.querySelectorAll(".lmk").forEach((i) => i.hidden = true);
        document.querySelectorAll(".rgk").forEach((i) => i.hidden = false);
        document.querySelector("#loadKeyMultiple").hidden = false;
        //document.querySelector("#regenerateKeys").hidden = true;
        // Clear previously selected keys/groups
        document.querySelectorAll("#addMultipleKeyList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
        document.querySelectorAll("#addMultipleGroupList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
    }
    else if (menuName == "loadKeyMultiple") {
        //document.querySelector("#loadKeyMultiple").heading = "Load Multiple Keys";
        document.querySelector("#loadKeyMultiple_heading").innerText = "Load Keys";
        document.querySelectorAll(".lmk").forEach((i) => i.hidden = false);
        document.querySelectorAll(".rgk").forEach((i) => i.hidden = true);
        // Clear previously selected keys/groups
        document.querySelectorAll("#addMultipleKeyList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
        document.querySelectorAll("#addMultipleGroupList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
    }
    else if (menuName = "loadKeySingle") {
        SetKeyInfoFieldsForNew();
        ClearKeyInfo();
    }
    // Deselect all keys and groups
    //FIX
    //$("#addMultipleKeyList input:checked").prop("checked", false).checkboxradio("refresh");
    //$("#addMultipleGroupList input:checked").prop("checked", false).checkboxradio("refresh");
    
    if (menuName == "manageKeys") {
        
    }
    else if (menuName == "manageGroups") {
        
    }
    else if (menuName == "loadKeyMultiple") {
        
    }

    document.getElementById("sidebarMenu").classList.toggle("show");
    //document.getElementById("sidebarMenu").classList.remove("show");
    document.getElementById("mainDiv").hidden = false;
});

document.getElementById("sidebar-toggle").addEventListener("click", e => {
    // Hide the main content when the sidebar is visible
    document.getElementById("sidebarMenu").classList.toggle("show");
    if (document.getElementById("sidebarMenu").classList.contains("show")) {
        document.getElementById("mainDiv").hidden = true;
    }
    else document.getElementById("mainDiv").hidden = false;
});

document.getElementById("darkModeSwitch").addEventListener("click", e => {
    // TODO
    return;
    if (e.target.checked) {
        document.documentElement.setAttribute("data-bs-theme", "dark");
        //document.getElementById("darkModeSwitch_sun").hidden = false;
        //document.getElementById("darkModeSwitch_moon").hidden = true;
    }
    else {
        document.documentElement.setAttribute("data-bs-theme", "light");
        //document.getElementById("darkModeSwitch_sun").hidden = true;
        //document.getElementById("darkModeSwitch_moon").hidden = false;
    }
});

// homeDiv
document.querySelector("#linkLicensingInformation").addEventListener("click", e => {
    $("#popupLicensingInformation").modal("show");
});

// connectKfd
document.querySelector("#buttonConnectKfd").addEventListener("click", e => {
    ConnectDevice();
});
document.querySelector("#buttonDisconnectKfd").addEventListener("click", e => {
    DisconnectDevice();
});
$("#buttonCheckConnection").on("click", function() {
    CheckMrConnection();
});
$("#buttonGetCapabilities").on("click", function() {
    GetRadioCapabilities();
});
document.querySelector("#selectConnectionMethod").addEventListener("change", e => {
    connectionMethod = $("#selectConnectionMethod").val();
    //$("#connectionMethod").text($("#selectConnectionMethod option[selected]")[0].innerText);
    let idx = document.querySelector("#selectConnectionMethod").selectedIndex;
    $("#connectionMethod").text(document.querySelector("#selectConnectionMethod").options[idx].text);
});

// addGroup
document.querySelector("#addGroupKeyList").addEventListener("click", e => {
    let item;
    if (e.target.localName != "a") item = e.target.parentElement;
    else item = e.target;
    item.classList.toggle("list-group-item-primary");
});
document.querySelector("#buttonCancelGroupChanges").addEventListener("click", e => {
    document.querySelector("#addGroup").hidden = true;
    document.querySelector("#manageGroups").hidden = false;
});
document.querySelector("#buttonSaveGroupChanges").addEventListener("click", e => {
    let containerKeyIds = [];
    let containerGroupId = parseInt($("#addGroup_id").val());
    let containerGroupName = $("#addGroup_name").val();
    let containerGroupNameOriginal = $("#originalGroup_name").val();
/*
    $("#addGroupKeyList input:checked").each(function() {
        containerKeyIds.push(parseInt($(this).attr("data-container-key-id")));
    });
*/
/*
    document.querySelector("#addGroupKeyList").selectedItems.forEach(function(i) {
        containerKeyIds.push(parseInt(i.dataset.containerKeyId));
    });
*/
    document.querySelectorAll("#addGroupKeyList a.list-group-item-primary").forEach(i => {
        containerKeyIds.push(parseInt(i.dataset.containerKeyId));
    });
    //console.log(containerGroupId, containerKeyIds);

    let existingGroupNames = _keyContainer.groups.filter(function(obj) { return obj.Name.toUpperCase() === containerGroupName.toUpperCase(); });
    if ((containerGroupName != containerGroupNameOriginal) && existingGroupNames.length) {
        alert("Error: group name already exists");
        return;
    }
    if (containerGroupName == "") {
        alert("Error: the group must have a name assigned");
        return;
    }
    if (containerKeyIds.length == 0) {
        //alert("Error: there must be at least one key in the group");
        //return;
    }
    
    if (containerGroupId == _keyContainer.nextGroupNumber) {
        /*
        _keyContainer.groups.push({
            Id: containerGroupId,
            Name: containerGroupName,
            Keys: containerKeyIds
        });
        _keyContainer.nextGroupNumber++;
        */
        AddGroupToContainer({
            //Id: containerGroupId,
            Name: containerGroupName,
            Keys: containerKeyIds
        });
    }
    else {
        for (let i=0;i<_keyContainer.groups.length;i++) {
            if (_keyContainer.groups[i].Id == containerGroupId) {
                _keyContainer.groups[i].Name = containerGroupName;
                _keyContainer.groups[i].Keys = containerKeyIds;
                break;
            }
        }
    }

    ModifyKeyContainerHeader();
    PopulateGroups();
    // Go back to group page
    document.querySelector("#addGroup").hidden = true;
    document.querySelector("#manageGroups").hidden = false;
});

// kfdOptions
document.querySelector("#kfdOptions_dliSwitch").addEventListener("change", e => {
    document.querySelector("#kfdOptions_dliDiv").hidden = !e.target.checked;
});
document.querySelector("#kfdOptions_dliBridgePort").addEventListener("change", e => {
    GenerateDliCli();
});
document.querySelector("#buttonCopyDliCli").addEventListener("click", e => {
    let cli = document.querySelector("#kfdOptions_dliBridgeCli").value;
    navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
            navigator.clipboard.writeText(cli).then(
                () => {
                    // Success
                },
                () => {
                    // Failure
                }
            );
        }
    });
});
document.querySelector("#buttonConnectDliBridge").addEventListener("click", e => {
    dliBridgeSettings.bridgePort = document.querySelector("#kfdOptions_dliBridgePort").value;
    dliBridgeSettings.keyloadingPort = document.querySelector("#kfdOptions_dliKeyloadingPort").value;
    dliBridgeSettings.token = document.querySelector("#kfdOptions_dliBridgeToken").value;
    connectSocket();
});
document.querySelector("#buttonDliCheckMrConnection").addEventListener("click", e => {
    CheckMrConnection();
});
document.querySelector("#kfdOptions_fipsModeSwitch").addEventListener("change", e => {
    document.querySelector("#kfdOptions_fipsDiv").hidden = !e.target.checked;
});
document.querySelector("#kfdOptions_macSwitch").addEventListener("change", e => {
    document.querySelector("#kfdOptions_macDiv").hidden = !e.target.checked;
});
document.querySelector("#buttonSyncMnp").addEventListener("click", e => {
    // TODO
});

// loadKeySingle
/*
document.querySelector("#loadKeySingle_HexDec").addEventListener("change", e => {
    if (e.target.checked) SwitchHexDec("hex");
    else SwitchHexDec("dec");
});
*/
document.querySelector("#loadKeySingle_Base_Hex").addEventListener("change", e => SwitchHexDec("hex"));
document.querySelector("#loadKeySingle_Base_Dec").addEventListener("change", e => SwitchHexDec("dec"));
$("#loadKeySingle_name").on("keyup", function(event) {
    // Limit key name to valid ASCII characters
    //https://en.wikipedia.org/wiki/List_of_Unicode_characters
    let str = $("#loadKeySingle_name").val().replace(/[\u{0000}-\u{001F}]/gu,"");
    str = str.replace(/[\u{007F}-\u{FFFF}]/gu,"");
    $("#loadKeySingle_name").val(str);
});
document.querySelector("#loadKeySingle_activeKeysetSwitch").addEventListener("change", e => {
    document.querySelector("#loadKeySingle_keysetDiv").hidden = e.target.checked;
    $("#loadKeySingle_keysetId").val("");
});
$("#loadKeySingle_slnCkr").on("keyup", function() {
    if ($("#loadKeySingle_slnCkr").val() == "") {
        $("#cryptoGroupLabel").text("0");
        $("#cryptoGroupLabel").data("decimal-value", "0");
        $("#keyTypeLabel").text("");
        return;
    }
    let sln = parseInt($("#loadKeySingle_slnCkr").val(), inputBase);
    $("#cryptoGroupLabel").data("decimal-value", sln.toString(10));
    let cg = sln >>> 12;
    //let keyNum = sln && 0x0FFF;
    
    if (cg < 0xF) {
        $("#cryptoGroupLabel").text(cg.toString(inputBase).toUpperCase());
        $("#keyTypeLabel").text("TEK");
    }
    else if (cg == 0xF) {
        $("#cryptoGroupLabel").text(cg.toString(inputBase).toUpperCase());
        if (sln % 2 == 0) {
            // UKEK are even
            $("#keyTypeLabel").text("UKEK");
        }
        else {
            // CKEK are odd
            $("#keyTypeLabel").text("CKEK");
        }
    }
    else {
        $("#cryptoGroupLabel").text("Invalid");
        $("#keyTypeLabel").text("Invalid");
    }
});
document.querySelector("#loadKeySingle_algorithm").addEventListener("change", e => {
    // Clear the key entry input when a new algorithm is selected
    let maxKeylenBytes = 64;
    if ($("#loadKeySingle_algorithm").val() == "256") {
        document.querySelector("#loadKeySingle_algorithmOtherDiv").hidden = false;
        $("#loadKeySingle_algorithmOther").val("");
        $("#loadKeySingle_algorithmOther").focus();
    }
    else {
        document.querySelector("#loadKeySingle_algorithmOtherDiv").hidden = true;
        $("#loadKeySingle_algorithmOther").val($("#loadKeySingle_algorithm").val());
    }
    if (document.querySelector("#loadKeySingle_algorithm option[selected]").dataset.keyLength != "") {
        maxKeylenBytes = parseInt(document.querySelector("#loadKeySingle_algorithm option[selected]").dataset.keyLength*2);
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
$("#loadKeySingle_key").on("focusin", function(evt) {
    // Show the key when the user clicks inside the key entry input
    // Disregard if the focus is caused by a tab from the field above
    if (evt.relatedTarget == null) {
        return;
    }
    if ((evt.relatedTarget.id == "loadKeySingle_algorithm") || (evt.relatedTarget.id == "loadKeySingle_algorithmOther")) {
        return;
    }
    if (!document.querySelector("#loadKeySingle_key").value.length) {
        return;
    }
    //$("#loadKeySingle_toggleKeyVis").val("show").slider("refresh");
    //$("#loadKeySingle_key").attr("type", "text");
    document.querySelector("#loadKeySingle_toggleKeyVis").checked = true;
    document.querySelector("#loadKeySingle_key").type = "text";
});
document.querySelector("#loadKeySingle_toggleKeyVis").addEventListener("change", e => {
    if (e.target.checked) $("#loadKeySingle_key").attr("type", "text");
    else $("#loadKeySingle_key").attr("type", "password");
});
document.querySelector("#loadKeySingle_key").addEventListener("keyup", e => {
    // if doesn't match pattern [a-fA-F\d]+ then addclass is-invalid, else remove
    let regex = new RegExp(/^[a-fA-F\d]+$/);
    if (regex.test(e.target.value)) document.querySelector("#loadKeySingle_key").classList.remove("is-invalid");
    else document.querySelector("#loadKeySingle_key").classList.add("is-invalid");
});
document.querySelector("#buttonGenerateRandomKey").addEventListener("click", e => {
    // Generate a random key
    let key = "";
    let keylen = document.querySelector("#loadKeySingle_algorithm [selected]").dataset.keyLength;
    let parity = document.querySelector("#loadKeySingle_algorithm [selected]").dataset.keyParity;
    key = generateRandomKey(keylen, parity);
    $("#loadKeySingle_key").val(key);
    $("#loadKeySingle_key").attr("max-length", keylen*2);
    $("#label_loadKeySingle_key").text("Key (hex): (" + keylen*2 + "/" + keylen*2 + " digits)");
    // Flash the key field to indicate that a new key has been generated
    $("#loadKeySingle_key").fadeTo(100, 0.25, function() { $(this).fadeTo(500, 1.0); });
    // TODO this does not work
    $("#loadKeySingle_key").trigger("keyup");
});
document.querySelector("#buttonLoadKeyToRadio").addEventListener("click", e => {
    let keyItem = CreateKeyFromFields("radio");
    
    if (keyItem === undefined) {
        return;
    }
    console.log(keyItem);
    let validation = KeyloadValidate(keyItem.KeysetId, keyItem.Sln, keyItem.KeyTypeKek, keyItem.KeyId, keyItem.AlgorithmId, keyItem.Key);
    if (validation.status == "Success") {
        SendKeysToRadio([keyItem], "multiple");
        ClearKeyInfo();
    }
    else if (validation.status == "Warning") {
        if (window.confirm("Warning: " + validation.message + " - do you wish to continue anyways?")) {
            SendKeysToRadio([keyItem], "multiple");
            ClearKeyInfo();
        }
    }
    else if (validation.status == "Error") {
        alert("Error: " + validation.message);
    }
});
document.querySelector("#buttonLoadKeyToContainer").addEventListener("click", e => {
    let containerKeyItem = CreateKeyFromFields("container");
    //console.log(containerKeyItem);
    if (containerKeyItem === undefined) {
        return;
    }
    
    // Check for identical Algorithm and Key ID combination
    /*
    let keys = _keyContainer.keys.filter(function(obj) { return obj.KeyId === containerKeyItem.KeyId; });
    for (var i=0; i<keys.length; i++) {
        if (keys[i].AlgorithmId == containerKeyItem.AlgorithmId) {
            alert("Error: Key ID " + containerKeyItem.KeyId + " with Algorithm " + LookupAlgorithmId(containerKeyItem.AlgorithmId) + " already exists");
            return;
        }
    }
    */

    let matchingKeys = _keyContainer.keys.filter(function(obj) { return obj.Name === containerKeyItem.Name; });
    if (matchingKeys.length) {
        alert("Key with same name already exists in container");
        return;
    }

    matchingKeys = _keyContainer.keys.filter(function(obj) { return ((obj.KeyId === containerKeyItem.KeyId) && (obj.AlgorithmId === containerKeyItem.AlgorithmId) && (obj.KeysetId === containerKeyItem.KeysetId) && (obj.ActiveKeyset === containerKeyItem.ActiveKeyset)); });
    if (matchingKeys.length) {
        let keysetLabel = containerKeyItem.KeysetId;
        if (containerKeyItem.ActiveKeyset) keysetLabel = "active";
        alert("Key with same Algorithm and Key ID already exists in keyset " + keysetLabel);
        return;
    }
    console.log(containerKeyItem);
    let validation = KeyloadValidate(containerKeyItem.KeysetId, containerKeyItem.Sln, containerKeyItem.KeyTypeKek, containerKeyItem.KeyId, containerKeyItem.AlgorithmId, containerKeyItem.Key);
    if (validation.status == "Success") {
        AddKeyToContainer(containerKeyItem);
        ClearKeyInfo();
    }
    else if (validation.status == "Warning") {
        if (window.confirm("Warning: " + validation.message + " - do you wish to continue anyways?")) {
            AddKeyToContainer(containerKeyItem);
            ClearKeyInfo();
        }
    }
    else if (validation.status == "Error") {
        alert("Error: " + validation.message);
    }
});
document.querySelector("#buttonCancelKeyChanges").addEventListener("click", e => {
    SetKeyInfoFieldsForNew();
    ClearKeyInfo();
    document.querySelector("#loadKeySingle").hidden = true;
    document.querySelector("#manageKeys").hidden = false;
});
document.querySelector("#buttonSaveKeyChanges").addEventListener("click", e => {
    let keyIdOld = parseInt($("#loadKeySingle_keyIdOld").val());
    let containerKeyItem = CreateKeyFromFields("container");
    if (containerKeyItem == undefined) return;
    containerKeyItem.Id = parseInt($("#loadKeySingle_containerKeyIdOld").val());
    let matchingKeys = _keyContainer.keys.filter(function(obj) { return ((obj.KeyId === containerKeyItem.KeyId) && (obj.AlgorithmId === containerKeyItem.AlgorithmId) && (obj.KeysetId === containerKeyItem.KeysetId) && (obj.ActiveKeyset === containerKeyItem.ActiveKeyset) && (keyIdOld !== containerKeyItem.KeyId)); });
    if (matchingKeys.length) {
        //console.log(matchingKeys);
        //if  (keyIdOld == containerKeyItem.KeyId) return;
        let keysetLabel = containerKeyItem.KeysetId;
        if (containerKeyItem.ActiveKeyset) keysetLabel = "active";
        alert("Key with same Algorithm and Key ID already exists in keyset " + keysetLabel);
        $("#loadKeySingle_keyId").focus();
        return;
    }
    console.log(containerKeyItem);
    let validation = KeyloadValidate(containerKeyItem.KeysetId, containerKeyItem.Sln, containerKeyItem.KeyTypeKek, containerKeyItem.KeyId, containerKeyItem.AlgorithmId, containerKeyItem.Key);
    if (validation.status == "Error") {
        alert("Error: " + validation.message);
        return;
    }
    else if (validation.status == "Warning") {
        if (!window.confirm("Warning: " + validation.message + " - do you wish to continue anyways?")) {
            return;
        }
    }

    EditKeyInContainer(containerKeyItem);
    SetKeyInfoFieldsForNew();
    ClearKeyInfo();
    document.querySelector("#loadKeySingle").hidden = true;
    document.querySelector("#manageKeys").hidden = false;
});

// loadKeyMultiple
document.querySelector("#buttonLoadMultipleKeys").addEventListener("click", e => {
    let containerKeyIds = [];
    let containerGroupIds = [];
    let key_set = new Set();

    document.querySelectorAll("#addMultipleKeyList .list-group-item-primary").forEach(i => {
        containerKeyIds.push(parseInt(i.dataset.containerKeyId));
        key_set.add(parseInt(i.dataset.containerKeyId));
    });
    document.querySelectorAll("#addMultipleGroupList .list-group-item-primary").forEach(i => {
        containerGroupIds.push(parseInt(i.dataset.containerGroupId));
    });

    containerGroupIds.forEach((cgid) => {
        let containerGroup = _keyContainer.groups.filter(function(obj) { return obj.Id === cgid; });
        containerGroup[0].Keys.forEach((ckid) => {
            key_set.add(ckid);
        });
    });
    
    console.log("keys", containerKeyIds);
    console.log("groups", containerGroupIds);
    console.log("set", key_set);

    let containerKeys = _keyContainer.keys.filter(function(obj) { return key_set.has(obj.Id); });
    console.log(containerKeys);

    SendKeysToRadio(containerKeys, "multiple");
    //SendKeysToRadio(containerKeys, "single");
    return;

    // Initialize loading widget
    ShowLoading("key");
    $("#keyloadStatus_itemNumber").text("0");
    $("#keyloadStatus_itemTotal").text(containerKeyIds.length);
    $("#keyloadResultList").empty();

    for (var i=0; i<containerKeyIds.length; i++) {
        let key = _keyContainer.keys.filter(function(obj) { return obj.Id === containerKeyIds[i]; });
        if (key.length == 1) {
            let keyName = key[0].Name;
            $("#keyloadStatus_itemName").text(keyName);
            //let keyResult = await SendKeyToRadio(key[0]);
            let keyResult;
            if (keyResult !== undefined) {
                let statusText = "Succeeded";
                let statusClass = "";
                if (keyResult.status != 0) {
                    statusText = OperationStatusExtensions.ToStatusString(keyResult.Status);
                    statusClass = " class='invalid'";
                }
                let temp = "<li><h4>" + keyName + "</h4>";
                temp += "<p" + statusClass + "'>" + statusText + "</p></li>";
                $("#keyloadResultList").append(temp);
            }
        }
    }
/*
    containerKeyIds.forEach((ckid) => {
        let key = _keyContainer.keys.filter(function(obj) { return obj.Id === ckid; });
        $("#keyloadStatus_itemName").text(key.Name);
        let keyResult = await SendKeyToRadio(key);
        if (keyResult !== undefined) {

        }
    });
*/
    //SendMultipleKeysToRadio(keys);
});
document.querySelector("#buttonRegenerateKeys").addEventListener("click", e => {
    let containerKeyIds = [];
    let containerGroupIds = [];
    let key_set = new Set();

    document.querySelectorAll("#addMultipleKeyList .list-group-item-primary").forEach(i => {
        containerKeyIds.push(parseInt(i.dataset.containerKeyId));
        key_set.add(parseInt(i.dataset.containerKeyId));
    });
    document.querySelectorAll("#addMultipleGroupList .list-group-item-primary").forEach(i => {
        containerGroupIds.push(parseInt(i.dataset.containerGroupId));
    });

    containerGroupIds.forEach((cgid) => {
        let containerGroup = _keyContainer.groups.filter(function(obj) { return obj.Id === cgid; });
        containerGroup[0].Keys.forEach((ckid) => {
            key_set.add(ckid);
        });
    });

    if (key_set.size == 0) return;
    else if (!window.confirm("Warning: this action will regenerate key material for all selected keys/groups. Select OK to continue, or cancel to abort.")) {
        return;
    }

    let containerKeys = _keyContainer.keys.filter(function(obj) { return key_set.has(obj.Id); });
    //let keyNames = [];

    $("#regenerateResultList").empty();
    
    containerKeys.forEach((k) => {
        const isMatch = (element) => element.Id == k.Id;
        let idx = _keyContainer.keys.findIndex(isMatch);
        if (idx < 0) return;

        //.push(k.Name);

        // Do better than this
        document.querySelector(`#loadKeySingle_algorithm option[value="${k.AlgorithmId}"]`).selected = true;
        //$("#loadKeySingle_algorithm").trigger("change");

        let key = "";
        // Do better than this
        let keylen = document.querySelector("#loadKeySingle_algorithm option[selected]").dataset.keyLength;
        let parity = document.querySelector("#loadKeySingle_algorithm option[selected]").dataset.keyParity;
        key = generateRandomKey(keylen, parity);

        let keyArray = [];
        for (var i = 0; i< key.length; i=i+2) {
            let pair = key[i] + key[i+1];
            keyArray.push(parseInt(pair , 16));
        }

        // Don't need this if I do better above
        SetKeyInfoFieldsForNew();
        ClearKeyInfo();

        _keyContainer.keys[idx].Key = keyArray;

        let temp = `<li class="list-group-item">${k.Name}</li>`;
        $("#regenerateResultList").append(temp);
    });
    
    ModifyKeyContainerHeader();
    document.querySelectorAll("#addMultipleKeyList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
    document.querySelectorAll("#addMultipleGroupList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
    $("#popupRegenerateResults").modal("show");
});
document.querySelector("#addMultipleKeyList_filter").addEventListener("keyup", e => {
    let filterValue = e.target.value.toUpperCase();
    document.querySelectorAll("#addMultipleKeyList a").forEach(a => {
        if (a.innerText.replace("\n\n", ", ").toUpperCase().includes(filterValue)) a.hidden = false;
        else a.hidden = true;
    });
});
document.querySelector("#addMultipleKeyList").addEventListener("click", e => {
    let item;
    if (e.target.localName != "a") item = e.target.parentElement;
    else item = e.target;
    item.classList.toggle("list-group-item-primary");
});
document.querySelector("#addMultipleGroupList_filter").addEventListener("keyup", e => {
    let filterValue = e.target.value.toUpperCase();
    document.querySelectorAll("#addMultipleGroupList a").forEach(a => {
        if (a.innerText.replace("\n\n", ", ").toUpperCase().includes(filterValue)) a.hidden = false;
        else a.hidden = true;
    });
});
document.querySelector("#addMultipleGroupList").addEventListener("click", e => {
    let item;
    if (e.target.localName != "a") item = e.target.parentElement;
    else item = e.target;
    item.classList.toggle("list-group-item-primary");
});

// viewKeyInfo
document.querySelector("#buttonViewKeyInformation").addEventListener("click", e => {
    ViewKeyInformation();
});
document.querySelector("#buttonEraseAllKeysFromRadio").addEventListener("click", e => {
    if (window.confirm("Warning: this will erase all keys from the radio. This action CANNOT be undone. Do you wish to continue?")) {
        EraseAllKeysFromRadio();
    }
});
$("#table_keyinfo tbody").on("click", "tr", e => {
    let item = e.target.closest("tr");
    document.querySelector("#popupMenuMrKeyOptions_list").dataset.keysetid = item.dataset.keysetid;
    document.querySelector("#popupMenuMrKeyOptions_list").dataset.keyid = item.dataset.keyid;
    document.querySelector("#popupMenuMrKeyOptions_list").dataset.sln = item.dataset.sln;
    $("#popupTableMrKeyAction").modal("show");
});
$("#table_keyinfo").on("click", "button.key-delete", function() {
    //let tr = $(this).parent().parent();
    //let keyset = tr.data("keysetid");
    //let sln = tr.data("sln");
    let tr = $(this).closest("tr")[0];
    let keyset = tr.dataset.keysetid;
    let sln = tr.dataset.sln;
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
$("#table_keyinfo").on("click", "button.key-change", function() {
    // TODO



});

// viewKeysetInfo
document.querySelector("#buttonViewKeysetInformation").addEventListener("click", e => {
    ViewKeysetInformation();
});
document.querySelector("#buttonSetClock").addEventListener("click", e => {
    // This requires message authentication
    let dtNow = new Date();
    // TODO: get UTC offset from local clock and apply before getting ISOString
    let datetime = dtNow.toISOString().slice(0, 16);
    document.getElementById("editRadio_Datetime").value = datetime;
    $("#popupSetClock").modal("show");
});
$("#table_keysets tbody").on("click", "tr", e => {
    let item = e.target.closest("tr");
    document.querySelector("#popupMenuMrKeysetOptions_list").dataset.keysetid = item.dataset.keysetid;
    document.querySelector("#popupMenuMrKeysetOptions_list").dataset.keysetname = item.dataset.keysetname;
    document.querySelector("#popupMenuMrKeysetOptions_list").dataset.keysetactivedatetime = item.dataset.keysetactivedatetime;
    $("#popupTableMrKeysetAction").modal("show");
});
$("#table_keysets tbody").on("click", "button.keyset-activate", function() {
    //let tr = $(this).parent().parent()[0];
    let tr = $(this).closest("tr")[0];
    let keysetId_activate = parseInt(tr.dataset.keysetid);
    let keysetId_deactivate = -1;
    let keyset_activate = keysetId_activate - 1;
    let cryptoGroup_activate = keyset_activate >>> 4;
    
    //console.log("Looking for active keyset in crypto group " + cryptoGroup_activate);
    // Search all other active keysets, looking for the same crypto group
    $("#table_keysets tr[data-active='true']").each(function() {
        let ksid = parseInt($(this)[0].dataset.keysetid) - 1;
        if ((ksid >>> 4) == cryptoGroup_activate) {
            keysetId_deactivate = ksid + 1;
            //console.log("deactivating keyset id " + keysetId_deactivate);
        }
    });

    console.log("deactivate " + keysetId_deactivate);

    // Old code, pre-crypto group
    //let tr2 = $("#table_keysets tr[data-active='true']")[0];
    //let keysetId_deactivate = parseInt(tr2.attributes.getNamedItem("data-keysetid").value);
    
    //console.log("Activate " + keysetId_activate + ", deactivate " + keysetId_deactivate);
    if (keysetId_deactivate == 255) {
        alert("Error: Cannot deactivate KEK keyset");
        return;
    }
    if (window.confirm("Warning: this will deactivate Keyset " + keysetId_deactivate + ", and activate Keyset " + keysetId_activate + " on the radio. Do you wish to continue?")) {
        Changeover(keysetId_deactivate, keysetId_activate);
    }
});

$("#table_keysets tbody").on("click", "button.keyset-edit", function() {
    //let tr = $(this).parent().parent()[0];
    let tr = $(this).closest("tr")[0];
    let keysetId = tr.dataset.keysetid;
    let keysetName = tr.dataset.keysetname;
    let keysetActiveDatetime = tr.dataset.keysetactivedatetime;
    document.querySelector("#editKeyset_keysetId").value = keysetId;
    document.querySelector("#editKeyset_name").value = keysetName;
    document.querySelector("#editKeyset_activeDatetime").value = keysetActiveDatetime;
    $("#popupEditKeysetTagging").modal("show");
});

// viewRsiItems
document.querySelector("#buttonViewRsiInformation").addEventListener("click", e => {
    ViewRsiInformation();
});
document.querySelector("#buttonAddRsi").addEventListener("click", e => {
    //ChangeRsiValues("GROUP", 0, 10000000, 0);// Add group RSI
    //ChangeRsiValues("INDIVIDUAL", 0, 9999998, 0);// Add individual RSI
    //ChangeRsiValues("KMF", 0, 9999990, 0);// Add group RSI
    //ChangeRsiValues("GROUP", 10000000, 0, 0); // Delete group RSI
    //ChangeRsiValues("INDIVIDUAL", 9999998, 0, 0);// Delete individual RSI
    //ChangeRsiValues("KMF", 9999990, 0, 0);// Delete KMF RSI

    //ChangeRsiValues("KMF", 9999990, 9999991, 65534);// TEST
/*
    $("#addEditRsi_typeOld").val("");
    $("#addEditRsi_action").val("add");
    $("#addEditRsi_rsiOld").val("0");
    $("#popupAddEditRsi").modal("show");
    $("#addEditRsi_rsi").focus();
*/
    $("#addEditRsi_typeOld").val("Group");
    $("#addEditRsi_action").val("add");
    $("#addEditRsi_rsiOld").val(0);
    $("#addEditRsi_rsi").val("");
    $("#addEditRsi_mnp").val("");
    $("#popupAddEditRsi").modal("show");
    $("#addEditRsi_rsi").focus();
});
$("#a.rsi-change").on("click", function() {
    console.log("rsi-change - 2");
});
$("#table_rsiItems tbody").on("click", "tr", e => {
    let item = e.target.closest("tr");
    document.querySelector("#popupMenuMrRsiOptions_list").dataset.rsiid = item.dataset.rsiid;
    document.querySelector("#popupMenuMrRsiOptions_list").dataset.rsitype = item.dataset.rsitype;
    document.querySelector("#popupMenuMrRsiOptions_list").dataset.messagenumber = item.dataset.messagenumber;
    $("#popupTableMrRsiAction").modal("show");
});
$("#table_rsiItems").on("click", "button.rsi-change", function() {
    //console.log("rsi-change");
    //console.log($(this).parent().parent()[0].dataset);
    // This should trigger mra.???
    //let tr = $(this).parent().parent();
    //let rsiOld = parseInt(tr.attr("data-rsiid"));
    //let mnpOld = parseInt(tr.attr("data-messagenumber"));
    let tr = $(this).closest("tr")[0];
    let rsiOld = parseInt(tr.dataset.rsiid);
    let mnpOld = parseInt(tr.dataset.messagenumber);
    let rsiType = "Group";
    if (rsiOld < 9999999) {
        rsiType = "Individual";
    }
    $("#addEditRsi_typeOld").val(rsiType);
    $("#addEditRsi_action").val("change");
    $("#addEditRsi_rsiOld").val(rsiOld);
    $("#addEditRsi_rsi").val(rsiOld.toString(inputBase).toUpperCase());
    $("#addEditRsi_mnp").val(mnpOld.toString(inputBase).toUpperCase());
    $("#popupAddEditRsi").modal("show");
    $("#addEditRsi_rsi").focus();
});
$("#table_rsiItems").on("click", "button.rsi-delete", function() {
    //let tr = $(this).parent().parent();
    //let rsiOld = parseInt(tr.attr("data-rsiid"));
    //let rsiOldType = tr.attr("data-rsitype");
    let tr = $(this).closest("tr")[0];
    let rsiOld = parseInt(tr.dataset.rsiid);
    let rsiOldType = tr.dataset.rsitype;
    if (rsiOldType == "Individual") {
        alert("Error: you cannot delete an individual RSI");
        return;
    }
    if (window.confirm("Warning: are you sure you want to delete " + rsiOldType + " RSI " + rsiOld + "?")) {
        ChangeRsiValues(rsiOldType, rsiOld, 0, 0);
    }
});

// viewKmfInfo
document.querySelector("#buttonViewKmfInformation").addEventListener("click", e => {
    ViewKmfInformation();
});
$("#table_kmfRsi tbody").on("click", "tr", e => {
    let item = e.target.closest("tr");
    document.querySelector("#popupMenuMrRsiOptions_list").dataset.rsiid = item.dataset.rsiid;
    document.querySelector("#popupMenuMrRsiOptions_list").dataset.messagenumber = item.dataset.messagenumber;
    $("#popupTableMrRsiAction").modal("show");
});
$("#table_kmfRsi").on("click", "button.kmf-rsi-change", function() {
    //console.log("kmf-rsi-change");
    //console.log($(this).parent().parent()[0].dataset);
    // This should trigger mra.LoadConfig(rsi, mn);
    //console.log(e.closest("tr"));
    //let tr = $(this).parent().parent();
    //let rsiOld = parseInt(tr.attr("data-rsiid"));
    //let mnpOld = parseInt(tr.attr("data-messagenumber"));
    //console.log(tr);
    let tr = $(this).closest("tr")[0];
    let rsiOld = parseInt(tr.dataset.rsiid);
    let mnpOld = parseInt(tr.dataset.messagenumber);
    //console.log("rsiOld: " + rsiOld + ", mnpOld: " + mnpOld);
    $("#addEditRsi_typeOld").val("KMF");
    $("#addEditRsi_action").val("change");
    $("#addEditRsi_rsiOld").val(rsiOld);
    $("#addEditRsi_rsi").val(rsiOld.toString(inputBase).toUpperCase());
    $("#addEditRsi_mnp").val(mnpOld.toString(inputBase).toUpperCase());
    $("#popupAddEditRsi").modal("show");
    $("#addEditRsi_rsi").focus();
});

// loadKeyContainer
document.querySelector("#downloadSampleEkc").addEventListener("click", e => {
    // DEPRECATED
    //e.preventDefault();
    //window.location.href = $(this).attr("href");
});
document.querySelector("#inputFile").addEventListener("change", e => {
    document.querySelector("#passwordEkc").focus();
});
$("#passwordEkc").on("keyup", function(event) {
    if (event.which == 13) document.querySelector("#buttonOpenEkc").click();
});
document.querySelector("#buttonOpenEkc").addEventListener("click", e => {
    if (fileInputElement.files.length == 0) {
        alert("Please select a valid Encrypted Key Container (*.ekc)");
        return;
    }
    if ($("#passwordEkc").val() == "") {
        alert("Please enter a password");
        return;
    }
    ImportEkc();
});

// manageKeys
document.querySelector("#buttonManageKey_addKey").addEventListener("click", e => {
    document.querySelector("#menu_loadKeySingle").click();
});
document.querySelector("#keyContainerKeyList_filter").addEventListener("keyup", e => {
    let filterValue = e.target.value.toUpperCase();
    document.querySelectorAll("#keyContainerKeyList a").forEach(a => {
        if (a.innerText.replace("\n\n", ", ").toUpperCase().includes(filterValue)) a.hidden = false;
        else a.hidden = true;
    });
});
document.querySelector("#keyContainerKeyList.list-group").addEventListener("click", e => {
    let item;
    if (e.target.localName != "a") item = e.target.parentElement;
    else item = e.target;
    let containerKeyId = item.dataset.containerKeyId;
    document.querySelector("#popupMenuKeyOptions_list").dataset.containerKeyId = containerKeyId;
    $("#popupMenuKeyOptions").modal("show");
});

// manageGroups
document.querySelector("#buttonManageGroup_addGroup").addEventListener("click", e => {
    document.querySelectorAll(".menu_divs").forEach((i) => i.hidden = true);
    let nextContainerGroupId = _keyContainer.nextGroupNumber;
    $("#addGroup_id").val(nextContainerGroupId);
    $("#addGroup_name").val("");
    $("#originalGroup_name").val("");
    document.querySelector("#addGroup").heading = "Add Group";
    document.querySelectorAll("#addGroupKeyList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
    document.querySelector("#addGroup").hidden = false;
});
document.querySelector("#keyContainerGroupList_filter").addEventListener("keyup", e => {
    let filterValue = e.target.value.toUpperCase();
    document.querySelectorAll("#keyContainerGroupList a").forEach(a => {
        if (a.innerText.replace("\n\n", ", ").toUpperCase().includes(filterValue)) a.hidden = false;
        else a.hidden = true;
    });
});
document.querySelector("#keyContainerGroupList").addEventListener("click", e => {
    let item;
    if (e.target.localName != "a") item = e.target.parentElement;
    else item = e.target;
    let containerGroupId = item.dataset.containerGroupId;
    document.querySelector("#popupMenuGroupOptions_list").dataset.containerGroupId = containerGroupId;
    $("#popupMenuGroupOptions").modal("show");
});

// exportKeyContainer
document.querySelector("#createEkc").addEventListener("click", e => {
    let fn = $("#exportKeyContainer_filename").val().trim();
    $("#exportKeyContainer_filename").val(fn);
    if ($("#exportKeyContainer_password").val() != $("#exportKeyContainer_passwordVerify").val()) {
        alert("Passwords do not match, please verify password");
        return;
    }
    if ($("#exportKeyContainer_password").val() == "") {
        alert("Please enter a password");
        return;
    }
    if ($("#exportKeyContainer_filename").val() == "") {
        alert("Please enter a valid file name");
        return;
    }
    if ($("#exportKeyContainer_password").val().length < 16) {
        if (!window.confirm("This password is weak (under 16 characters in length) - use anyways?")) {
            return;
        }
    }
    //if ($("#exportKeyContainer_filename").val().includes('[\\/:"*?<>|]+')) { }
    //ExportEkc(_keyContainer, $("#exportKeyContainer_passwordVerify").val(), $("#exportKeyContainer_filename").val());
    DownloadEkc(_keyContainer, $("#exportKeyContainer_passwordVerify").val(), $("#exportKeyContainer_filename").val());
    $("#exportKeyContainer_password").val("");
    $("#exportKeyContainer_passwordVerify").val("");
    $("#exportKeyContainer_filename").val("");
});

// resetKeyContainer
document.querySelector("#buttonResetEkc").addEventListener("click", e => {
    ResetKeyContainer();
    alert("All keys and groups have been cleared from memory");
});

// popupMenuKeyOptions
document.querySelector("#action_loadKeyToRadio").addEventListener("click", e => {
    let containerKeyId = parseInt(document.querySelector("#popupMenuKeyOptions_list").dataset.containerKeyId);
    let containerKey = _keyContainer.keys.filter(function(obj) { return obj.Id === containerKeyId; });
    if (containerKey.length != 1) {
        alert("There was an error retrieving the key from the container");
        return;
    }
    SendKeysToRadio(containerKey, "multiple");
    document.querySelector("#popupMenuKeyOptions_list").dataset.containerKeyId = "";
    $("#popupMenuKeyOptions").modal("hide");
});
document.querySelector("#action_editKeyInContainer").addEventListener("click", e => {
    let containerKeyId = parseInt(document.querySelector("#popupMenuKeyOptions_list").dataset.containerKeyId);
    let containerKey = _keyContainer.keys.filter(function(obj) { return obj.Id === containerKeyId; });
    PopulateKeyInfoFieldsForEdit(containerKey[0]);
    SetKeyInfoFieldsForEdit();
    document.querySelector("#popupMenuKeyOptions_list").dataset.containerKeyId = "";
    $("#popupMenuKeyOptions").modal("hide");
    document.querySelectorAll(".menu_divs").forEach((i) => i.hidden = true);
    document.querySelector("#loadKeySingle").hidden = false;
});
document.querySelector("#action_deleteKeyFromContainer").addEventListener("click", e => {
    let containerKeyId = parseInt(document.querySelector("#popupMenuKeyOptions_list").dataset.containerKeyId);
    // Find out if key is in any groups and warn user first
    let groupNames = groupsThatContainKey(containerKeyId);
    if (groupNames.length) {
        let groupNamesString = groupNames.join(", ");
        if (!window.confirm(`This key belongs to the following groups: ${groupNamesString}. Do you still wish to delete?`)) {
            return;
        }
    }
    DeleteKeyFromContainer(containerKeyId);
    document.querySelector("#popupMenuKeyOptions_list").dataset.containerKeyId = "";
    $("#popupMenuKeyOptions").modal("hide");
});

// popupMenuGroupOptions
document.querySelector("#action_loadGroupToRadio").addEventListener("click", e => {
    let containerGroupId = parseInt(document.querySelector("#popupMenuGroupOptions_list").dataset.containerGroupId);
    let groupKeys = _keyContainer.groups.filter(function(obj) { return obj.Id === containerGroupId; });
    if (groupKeys.length != 1) {
        alert("There was an error retrieving the group from the container");
        return;
    }
    let containerKeys = _keyContainer.keys.filter(function(obj) { return groupKeys[0].Keys.includes(obj.Id); });
    SendKeysToRadio(containerKeys, "multiple");
    //FIX LINE BELOW
    document.querySelector("#popupMenuGroupOptions_list").dataset.containerGroupId = "";
    $("#popupMenuGroupOptions").modal("hide");
});
document.querySelector("#action_editGroupContainer").addEventListener("click", e => {
    let containerGroupId = parseInt(document.querySelector("#popupMenuGroupOptions_list").dataset.containerGroupId);
    let containerGroup = _keyContainer.groups.filter(function(obj) { return obj.Id === containerGroupId; });
    if (containerGroup.length != 1) {
        alert("There was an error retrieving the group from the container");
        return;
    }
    // Set all checkboxes to off, then loop through keys and set to true
    let containerGroupName = containerGroup[0].Name;
    document.querySelector("#addGroup_heading").innerText = "Edit Group Keys";
    $("#addGroup_name").val(containerGroupName);
    $("#originalGroup_name").val(containerGroupName);
    $("#addGroup_id").val(containerGroupId);
    document.querySelectorAll("#addGroupKeyList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
    containerGroup[0].Keys.forEach((kid) => {
        document.querySelector(`#addGroupKeyList [data-container-key-id="${kid}"]`).classList.add("list-group-item-primary");
    });
    document.querySelector("#manageGroups").hidden = true;
    document.querySelector("#addGroup").hidden = false;
    document.querySelector("#popupMenuGroupOptions_list").dataset.containerGroupId = "";
    $("#popupMenuGroupOptions").modal("hide");
});
document.querySelector("#action_deleteContainerGroup").addEventListener("click", e => {
    let containerGroupId = parseInt(document.querySelector("#popupMenuGroupOptions_list").dataset.containerGroupId);
    DeleteGroupFromContainer(containerGroupId);
    document.querySelector("#popupMenuGroupOptions_list").dataset.containerGroupId = "";
    $("#popupMenuGroupOptions").modal("hide");
});

// popupAddEditRsi
/*
document.querySelector("#addEditRsi_HexDec").addEventListener("change", e => {
    if (e.target.checked) SwitchHexDec("hex");
    else SwitchHexDec("dec");
});
*/
document.querySelector("#addEditRsi_Base_Hex").addEventListener("change", e => SwitchHexDec("hex"));
document.querySelector("#addEditRsi_Base_Dec").addEventListener("change", e => SwitchHexDec("dec"));
$("#addEditRsi_rsi").on("keyup", function() {
    // Validate and show RSI type in <span>
    let rsiType = $("#addEditRsi_typeOld").val();
    let rsiVal = parseInt($("#addEditRsi_rsi").val(), inputBase);
    if (rsiType == "KMF") {
        if ((rsiVal < 1 || (rsiVal > 9999999))) {
            $("#addEditRsi_rsiType").text("Invalid KMF RSI");
            $("#addEditRsi_rsiType").addClass("invalid");
        }
        else {
            $("#addEditRsi_rsiType").text("KMF RSI");
            $("#addEditRsi_rsiType").removeClass("invalid");
        }
    }
    else if (rsiType == "Individual") {
        if ((rsiVal < 1) && (rsiVal > 9999998)) {
            $("#addEditRsi_rsiType").text("Invalid Individual RSI");
            $("#addEditRsi_rsiType").addClass("invalid");
        }
        else {
            $("#addEditRsi_rsiType").text("Individual RSI");
            $("#addEditRsi_rsiType").removeClass("invalid");
        }
    }
    else if (rsiType == "Group") {
        if ((rsiVal < 10000000) || (rsiVal > 16777215)) {
            $("#addEditRsi_rsiType").text("Invalid Group RSI");
            $("#addEditRsi_rsiType").addClass("invalid");
        }
        else {
            $("#addEditRsi_rsiType").text("Group RSI");
            $("#addEditRsi_rsiType").removeClass("invalid");
        }
    }
    else {
        $("#addEditRsi_rsiType").text("Invalid RSI");
        $("#addEditRsi_rsiType").addClass("invalid");
    }
});
document.querySelector("#addEditRsiCancel").addEventListener("click", e => {
    $("#popupAddEditRsi").modal("hide");
    ClearPopupAddEditRsi();
});
document.querySelector("#addEditRsiConfirm").addEventListener("click", e => {
    // Validate the data, then close, clear and proceed
    // refer to page 60 on TIA OTAR, Change-RSI-Command permutations
    let isValid = $("#addEditRsi_rsiType").hasClass("invalid");
    let rsiType = $("#addEditRsi_typeOld").val();
    //let rsiAction = $("#addEditRsi_action").val();//add,remove,change
    let rsiOld = parseInt($("#addEditRsi_rsiOld").val());
    let rsiNew = parseInt($("#addEditRsi_rsi").val(), inputBase);
    let mnp = parseInt($("#addEditRsi_mnp").val(), inputBase);

    if (rsiType == "KMF") {
        // Change KMF RSI
        if ((rsiNew < 1) || (rsiNew > 9999999)) {
            // Invalid KMF RSI
            alert("Valid range for KMF RSI is 1 to 9,999,999 (0x000001 to 0x98967F");
            return;
        }
        ChangeRsiValues(rsiType, rsiOld, rsiNew, mnp);
    }
    else if (rsiType == "Individual") {
        // Add/change/remove individual RSI
        if ((rsiNew < 1) || (rsiNew > 9999998)) {
            // Invalid RSI
            alert("Valid range for Individual RSI is 1 to 9,999,998 (0x000001 to 0x98967E");
            return;
        }
        ChangeRsiValues(rsiType, rsiOld, rsiNew, mnp);
    }
    else if (rsiType == "Group") {
        // Add/change/remove group RSI
        if ((rsiNew < 10000000) || (rsiNew > 16777215)) {
            // Invalid RSI
            alert("Valid range for Group RSI is 10,000,000 to 16,777,215 (0x989680 to 0xFFFFFF)");
            return;
        }
        ChangeRsiValues(rsiType, rsiOld, rsiNew, mnp);
    }
    $("#popupAddEditRsi").modal("hide");
    ClearPopupAddEditRsi();
});

// popupEditKeysetTagging
document.querySelector("#buttonEditKeysetTaggingCancel").addEventListener("click", e => {
    // TODO
    // Clear and close. Also make sure all other modals do the same on cancel button
    // Also implement onopen for modals to clear fields
    document.querySelector("#editKeyset_keysetId").value = "";
    document.querySelector("#editKeyset_name").value = "";
    document.querySelector("#editKeyset_activeDatetime").value = "";
    $("#popupEditKeysetTagging").modal("hide");
});
document.querySelector("#buttonEditKeysetTaggingConfirm").addEventListener("click", e => {
    // TODO implement keyset tagging change
    let keysetId = document.querySelector("#editKeyset_keysetId").value;
    let keysetType = keysetId < 241 ? 0 : 1;
    let keysetName = document.querySelector("#editKeyset_name").value;
    let keysetActiveDatetime = document.querySelector("#editKeyset_activeDatetime").value;

    let keyset = {
        id: keysetId,
        type: keysetType,
        name: keysetName,
        activeDatetime: keysetActiveDatetime
    };

    // Go to function for this
    alert("This feature is not implemented");
    ModifyKeysetAttributes([keyset]);

    $("#popupEditKeysetTagging").modal("hide");
    document.querySelector("#editKeyset_keysetId").value = "";
    document.querySelector("#editKeyset_name").value = "";
    document.querySelector("#editKeyset_activeDatetime").value = "";
});

// popupKeyloadResults
// No eventListeners

// popupRegenerateResults
// No eventListeners

// popupSetClock
document.querySelector("#editRadio_datetimeSwitch").addEventListener("change", e => {
    document.querySelector("#editRadio_datetimeDiv").hidden = e.target.checked;
});
document.querySelector("#buttonSetClockConfirm").addEventListener("click", e => {
    // Use computer time if checked, otherwise use date in editRadio_Datetime
    let datetime;
    if (document.getElementById("editRadio_datetimeSwitch").checked) {
        let dtemp = new Date();
        datetime = new Date(dtemp - dtemp.getTimezoneOffset() * 60 * 1000);
        datetime = datetime.toISOString();
    }
    else {
        datetime = document.getElementById("editRadio_Datetime").value;
    }
    SetRadioClock(datetime);
    $("#popupSetClock").modal("hide");
});

//popupTableMrKeyAction
document.querySelector("#action_editKeyInRadio").addEventListener("click", e => {
    let item = e.target.closest("div");
    //console.log(item.dataset);
    let keyset = item.dataset.keysetid;
    let keyid = item.dataset.keyid;
    let sln = item.dataset.sln;
    //TODO
    $("#popupTableMrKeyAction").modal("hide");
});
document.querySelector("#action_deleteKeyFromRadio").addEventListener("click", e => {
    let item = e.target.closest("div");
    //console.log(item.dataset);
    let keyset = item.dataset.keysetid;
    let keyid = item.dataset.keyid;
    let sln = item.dataset.sln;
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
        $("#popupTableMrKeyAction").modal("hide");
    }
});

//popupTableMrKeysetAction
document.querySelector("#action_activateKeyset").addEventListener("click", e => {
    let item = e.target.closest("div");
    //console.log(item.dataset);
    let keysetId_activate = item.dataset.keysetid;
    let keysetId_deactivate = -1;
    let keyset_activate = keysetId_activate - 1;
    let cryptoGroup_activate = keyset_activate >>> 4;
    $("#table_keysets tr[data-active='true']").each(function() {
        let ksid = parseInt($(this)[0].dataset.keysetid) - 1;
        if ((ksid >>> 4) == cryptoGroup_activate) {
            keysetId_deactivate = ksid + 1;
            //console.log("deactivating keyset id " + keysetId_deactivate);
        }
    });
    if (keysetId_deactivate == 255) {
        alert("Error: Cannot deactivate KEK keyset");
        return;
    }
    if (window.confirm("Warning: this will deactivate Keyset " + keysetId_deactivate + ", and activate Keyset " + keysetId_activate + " on the radio. Do you wish to continue?")) {
        Changeover(keysetId_deactivate, keysetId_activate);
        $("#popupTableMrKeysetAction").modal("hide");
    }
});
document.querySelector("#action_editKeysetTagging").addEventListener("click", e => {
    let item = e.target.closest("div");
    //console.log(item.dataset);
    let keysetId = item.dataset.keysetid;
    let keysetName = item.dataset.keysetname;
    let keysetActiveDatetime = item.dataset.keysetactivedatetime;
    document.querySelector("#editKeyset_keysetId").value = keysetId;
    document.querySelector("#editKeyset_name").value = keysetName;
    document.querySelector("#editKeyset_activeDatetime").value = keysetActiveDatetime;
    $("#popupTableMrKeysetAction").modal("hide");
    $("#popupEditKeysetTagging").modal("show");
});

//popupTableMrRsiAction
document.querySelector("#action_editRsi").addEventListener("click", e => {
    let item = e.target.closest("div");
    //console.log(item.dataset);
    let rsiOld = parseInt(item.dataset.rsiid);
    let mnpOld = parseInt(item.dataset.messagenumber);
    let rsiType = "Group";
    if (rsiOld < 9999999) {
        rsiType = "Individual";
    }
    $("#addEditRsi_typeOld").val(rsiType);
    $("#addEditRsi_action").val("change");
    $("#addEditRsi_rsiOld").val(rsiOld);
    $("#addEditRsi_rsi").val(rsiOld.toString(inputBase).toUpperCase());
    $("#addEditRsi_mnp").val(mnpOld.toString(inputBase).toUpperCase());
    $("#popupAddEditRsi").modal("show");
    $("#addEditRsi_rsi").focus();
    $("#popupTableMrRsiAction").modal("hide");
});
document.querySelector("#action_deleteRsi").addEventListener("click", e => {
    let item = e.target.closest("div");
    //console.log(item.dataset);
    let rsiOld = parseInt(item.dataset.rsiid);
    let rsiOldType = item.dataset.rsitype;
    if (rsiOldType == "Individual") {
        alert("Error: you cannot delete an individual RSI");
        return;
    }
    if (window.confirm("Warning: are you sure you want to delete " + rsiOldType + " RSI " + rsiOld + "?")) {
        ChangeRsiValues(rsiOldType, rsiOld, 0, 0);
        $("#popupTableMrRsiAction").modal("hide");
    }
});


// Multiple
$(".hex-input").on("keyup", function() {
    // Ensure that only hexidecimal values are input
    if ($(this).hasClass("key-input")) {
        let eleId = $(this).attr("id");
        let textInput = $("#" + eleId);
        
        let maxKeylenBytes = parseInt(document.querySelector("#loadKeySingle_algorithm [selected]").dataset.keyLength*2);
        if (maxKeylenBytes == 0) maxKeylenBytes = 512;
        //$("#label_" + eleId).text("Key (hex): (" + $(this).val().length + "/" + maxKeylenBytes + ") bytes");
        textInput.val(textInput.val().replace(/[^a-fA-F0-9\n\r]+/g, '').toUpperCase());
        /*
        if (textInput.val().length > maxKeylenBytes) {
            //textInput.val(textInput.val().slice(0, -1));
            textInput.val(textInput.val().slice(0, maxKeylenBytes));
        }
        */
        
        if (maxKeylenBytes == 512) return;
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
    //console.log("hexdec-input keyup");
    // Ensure that only decimal or hexidecimal values are input
    let curVal = $(this).val();
    //console.log($(this), curVal);
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
            // JQM
            $(this).parent().removeClass("ui-body-inherit");
        }
        else {
            $(this).parent().removeClass("invalid");
            // JQM
            $(this).parent().addClass("ui-body-inherit");
        }
    }
});

$("table thead tr th").on("click", function() {
    // FIX do better than this:
    //let tableId = $(this).parent().parent().parent()[0].id;
    //console.log($(this).parent().parent().parent()[0]);
    let tableId = $(this).closest("table")[0].id;
    let fieldName = $(this)[0].textContent.replace(" ", "").toLowerCase();
    if (fieldName != "action") {
        sortTable(tableId, fieldName);
    }
});

// FUTURE IMPLEMENTATION
/*


document.querySelector("#buttonGetCapabilities").addEventListener("click", e => {
    GetRadioCapabilities();
});
*/



// DEPRECATED listeners
/*
    document.querySelector("#buttonManageKeyActions").addEventListener("click", e => {
        //DEPRECATED
        $("#popupMenuKeyOptions").modal("show");
    });
    $("input:file").on("change", function() {
        //var fileName = $(this).val();
        //console.log(fileName);
    });
*/




function ModifyKeyContainerHeader() {
    if (_keyContainer.source == "Memory") return;
    document.querySelectorAll(".keyContainerFileName").forEach((i) => i.textContent = _keyContainer.source + " (modified)");
}

function CancelTransfers() {
    //$("#keyloadStatus input[type=number]");
    //$("#keyloadStatus input[id=slider-keyload-status]") returns 2 items
    //$("#slider-keyload-status").val("0").slider("refresh");
    //$("#slider-keyload-status").slider("option", "value", 0);
    //$("slider-keyload-status").prop("value", 0).slider("refresh");
    //$.mobile.loading("checkLoaderPosition");
    //$.mobile.loading("resetHtml");
    //https://stackoverflow.com/questions/12795307/jquery-ui-slider-change-value-of-slider-when-changed-in-input-field
    //https://stackoverflow.com/questions/71983489/programmatically-animating-a-jquery-slider
    //https://stackoverflow.com/questions/25649904/set-max-attribute-for-the-jquerymobile-slider-from-javascript
    canceltransferFlag = true;
    breakNow = true;
    HideLoading();
    EnableKfdButtons();
}

function CreateKeyFromContainer(containerKeyId) {
    // Create a key from a container key_id

}

function CreateKeyFromFields(target) {
    // Disabled for use of inputBase, and replaced below on assigning keyItem fields
    /*
    let base = 10;
    if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "hex") {
        base = 16;
    }
    */
    let containerKeyItem = {};
    let auto = false;
    let tek = false;
    let kek = false;
    
    containerKeyItem.ActiveKeyset = document.querySelector("#loadKeySingle_activeKeysetSwitch").checked;
    if (containerKeyItem.ActiveKeyset) $("#loadKeySingle_keysetId").val("1");
    if ((target == "container") && ($("#loadKeySingle_name").val() == "")) {
        alert("Key name cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_keysetId").val() == "") {
        alert("Keyset ID cannot be empty");
        return;
    }
    else if ($("#loadKeySingle_slnCkr").val() == "") {
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
    containerKeyItem.Name = $("#loadKeySingle_name").val().trim();

    // VALIDATION
/*
    let matchingKeys = _keyContainer.keys.filter(function(obj) { return obj.Name === containerKeyItem.Name; });
    if (matchingKeys.length) {
        alert("Key with same name already exists in container");
        return;
    }
*/
    
    //containerKeyItem.Id = _keyContainer.nextKeyNumber;
    containerKeyItem.KeysetId = parseInt($("#loadKeySingle_keysetId").val(), inputBase);
    //containerKeyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSwitch").val() == "yes" ? true : false;
    containerKeyItem.Sln = parseInt($("#loadKeySingle_slnCkr").val(), inputBase);
    containerKeyItem.KeyId = parseInt($("#loadKeySingle_keyId").val(), inputBase);
    containerKeyItem.AlgorithmId = parseInt($("#loadKeySingle_algorithmOther").val(), inputBase);
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
    containerKeyItem.Key = keyArray;
    if (auto) {
        if (containerKeyItem.Sln >=0 && containerKeyItem.Sln <= 61439) tek = true;
        else if (containerKeyItem.Sln >= 61440 && containerKeyItem.Sln <= 65535) kek = true;
    }
    containerKeyItem.KeyTypeAuto = auto;
    containerKeyItem.KeyTypeTek = tek;
    containerKeyItem.KeyTypeKek = kek;
    
    // VALIDATION
    if ((containerKeyItem.KeysetId < 1) || (containerKeyItem.KeysetId > 255)) {
        alert("Keyset ID out of range");
        return;
    }
    else if ((containerKeyItem.Sln < 0) || (containerKeyItem.Sln > 65535)) {
        alert("SLN/CKR out of range");
        return;
    }
    else if ((containerKeyItem.KeyId < 0) || (containerKeyItem.KeyId > 65535)) {
        alert("Key ID out of range");
        return;
    }
    /*
    if (containerKeyItem.KeyTypeTek && (containerKeyItem.Sln >= 61440)) {
        alert("Key type set to TEK, but SLN indicates KEK");
        return;
    }
    else if (containerKeyItem.KeyTypeKek && (containerKeyItem.Sln <= 61439)) {
        alert("Key type set to KEK, but SLN indicates TEK");
        return;
    }
    */

    return containerKeyItem;
}

/* NOT USED */
async function UpdateKeyloadStatus(keyResult) {
    let statusText = "Succeeded";
    let statusClass = "";
    if (keyResult.Status != 0) {
        statusText = OperationStatusExtensions.ToStatusString(keyResult.Status);
        statusClass = "keyError ";
    }
    // Get the key name by looking up the Key ID and Alg Id
    let keyName = keys.filter(function(obj) { return (obj.AlgorithmId === keyResult.AlgorithmId) && (obj.KeyId === keyResult.KeyId); });
    let temp = `<li class="list-group-item" class="${statusClass}" icon-start="${statusIcon}">${cmdKeyItems[i].Name}, ${statusText}</li>`;
    $("#keyloadResultList").append(temp);
}

async function SendKeysToRadio(keys, keyloadProtocol) {
    // keys is an array of containerKeys
    console.log("SendKeysToRadio", keys);

    let cmdKeyItems = [];
    keys.forEach((k) => {
        let cmdKey = new CmdKeyItem(k.ActiveKeyset, k.KeysetId, k.Sln, k.KeyTypeKek, k.KeyId, k.AlgorithmId, k.Key);
        cmdKey.Name = k.Name;
        cmdKeyItems.push(cmdKey);
    });

    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

    if (keyloadProtocol == "single") {
        console.log("loading single");
        // Load one key at a time and show results popup
        // Came from $("#buttonLoadMultipleKeys").on("click")

        // Initialize loading widget
        ShowLoading("key");
        DisableKfdButtons();
        UpdateProgress(0, "Loading keys...");
        $("#keyloadResultList").empty();

        console.log(cmdKeyItems);
        for (var i=0; i<cmdKeyItems.length; i++) {
            console.log(cmdKeyItems[i]);
            UpdateProgress(Math.floor(i / cmdKeyItems.length).toString(), `Loading ${cmdKeyItems[i].Name}...`);
            let keyResult = await mra.Keyload_single(cmdKeyItems[i]);
            console.log(keyResult);
            if (keyResult !== undefined) {
                let statusText = "Succeeded";
                let statusClass = "";
                let statusIcon = "check-circle";
                if (keyResult.Status != 0) {
                    statusText = OperationStatusExtensions.ToStatusString(keyResult.Status);
                    statusClass = "keyError";
                    statusIcon = "exclamation-mark-circle";
                }
                ///// FIX calcite
                //temp = `<calcite-list-item class="${statusClass}" label="${cmdKeyItems[i].Name}" description="${statusText}" icon-start="${statusIcon}"></calcite-list-item>`;
                // FIX TODO put icon-start as <i> tag
                let temp = `<li class="list-group-item" class="${statusClass}" icon-start="${statusIcon}">${cmdKeyItems[i].Name}, ${statusText}</li>`;
                $("#keyloadResultList").append(temp);
                if (canceltransferFlag) { i = mdKeyItems.length; }
            }
        }
        HideLoading();
        EnableKfdButtons();
    }
    else if (keyloadProtocol == "multiple") {
        // Load all keys at once, with no status
        console.log("loading multiple");
        let results;
        try {
            ShowLoading();
            UpdateProgress(-1, "Loading keys...");
            DisableKfdButtons();
            $("#keyloadResultList").empty();
            results = await mra.Keyload(cmdKeyItems);
            //results = await mra.Keyload_individual(cmdKeyItems);
        }
        catch (error) {
            console.error(error);
        }
        finally {
            UpdateProgress(999, "Completed...");
            HideLoading();
            EnableKfdButtons();
        }
        if (results !== undefined) {
            console.log(results);
            // Check each status to verify result[i].Status == 0
            results.forEach((keyResult) => {
                console.log(keyResult);
                let statusText = "Succeeded";
                let statusClass = "";
                let statusIcon = "check-circle";
                if (keyResult.Status != 0) {
                    statusText = OperationStatusExtensions.ToStatusString(keyResult.Status);
                    statusClass = "keyError";
                    statusIcon = "exclamation-mark-circle";
                }
                // Get the key name by looking up the Key ID and Alg Id
                let keyName = keys.filter(function(obj) { return (obj.AlgorithmId === keyResult.AlgorithmId) && (obj.KeyId === keyResult.KeyId); });
                ///// FIX calcite
                //temp = `<calcite-list-item class="${statusClass}" label="${keyName[0].Name}" description="${statusText}" icon-start="${statusIcon}"></calcite-list-item>`;
                let temp = `<li class="list-group-item" class="${statusClass}" icon-start="${statusIcon}">${keyName[0].Name}, ${statusText}</li>`;
                $("#keyloadResultList").append(temp);
            });
        }
    }
    //document.querySelector("#addMultipleKeyList").selectedItems.forEach(i => i.selected = false);
    //document.querySelector("#addMultipleGroupList").selectedItems.forEach(i => i.selected = false);
    document.querySelectorAll("#addMultipleKeyList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
    document.querySelectorAll("#addMultipleGroupList .list-group-item-primary").forEach(i => i.classList.remove("list-group-item-primary"));
    $("#popupKeyloadResults").modal("show");
}

async function SendKeyToRadio(key) {
    console.log("SendKeyToRadio", key);
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

    let results;
    try {
        ShowLoading();
        DisableKfdButtons();
        results = await mra.Keyload_single(key);
    }
    catch (error) {
        console.error(error);
    }
    finally {
        //HideLoading();
        //EnableKfdButtons();
    }
    if (results !== undefined) {
        console.log(results);
        return results;
    }
}

async function SendMultipleKeysToRadio() {

}

async function ViewKeyInformation() {
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

    $("#table_keyinfo tbody").empty();
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
        keys.sort((a, b) => a.AlgorithmId - b.AlgorithmId);
        keys.sort((a, b) => a.KeyId - b.KeyId);
        keys.forEach((keyItem) => {
            let algId = Object.keys(AlgorithmId).find(key => AlgorithmId[key] === keyItem.AlgorithmId);
            let keyType = LookupKeyTypeFromSLN(keyItem.Sln);
            //<a class="key-change" href="javascript:void(0)">Change</a>
            //<a class="key-delete" href="javascript:void(0)">Delete</a>
            let buttonChange = `
                <button hidden type="button" class="btn btn-outline-secondary key-change">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                </button>
            `;
            let buttonDelete = `
                <button type="button" class="btn btn-outline-secondary key-delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                </button>
            `;
            let row = `<tr data-keysetid="${keyItem.KeysetId}" data-sln="${keyItem.Sln}" data-keyid="${keyItem.KeyId}" data-algorithm="${algId}" data-keytype="${keyType}">
                    <td>${keyItem.KeysetId}</td>
                    <td>${keyType}</td>
                    <td>${keyItem.Sln}</td>
                    <td>${keyItem.KeyId}</td>
                    <td>${algId}</td>
                    <td hidden>
                        <div class="btn-group btn-group-sm" role="group">
                            ${buttonDelete}
                        </div>
                    </td>
                </tr>`;
            $("#table_keyinfo tbody").append(row);
        });
    }
}



function sortTable(table, field) {
    //console.log(`sorting ${table} by ${field}`);
    if (field == "sln") {
        $(`#${table} tbody tr`).sort(sln).appendTo(`#${table}`);
    }
    else if (field == "keysetid") {
        $(`#${table} tbody tr`).sort(keysetid).appendTo(`#${table}`);
    }
    else if (field == "keyid") {
        $(`#${table} tbody tr`).sort(keyid).appendTo(`#${table}`);
    }
    else if (field == "algorithm") {
        $(`#${table} tbody tr`).sort(algorithm).appendTo(`#${table}`);
    }
    else if (field == "keysetname") {
        $(`#${table} tbody tr`).sort(keysetname).appendTo(`#${table}`);
    }
    else if (field == "keysettype") {
        $(`#${table} tbody tr`).sort(keysettype).appendTo(`#${table}`);
    }
    else if (field == "activedatetime") {
        $(`#${table} tbody tr`).sort(activedatetime).appendTo(`#${table}`);
    }
    else if (field == "rsiid") {
        $(`#${table} tbody tr`).sort(rsiid).appendTo(`#${table}`);
    }
    else if (field == "messagenumber") {
        $(`#${table} tbody tr`).sort(messagenumber).appendTo(`#${table}`);
    }
    else if (field == "type") {
        $(`#${table} tbody tr`).sort(keytype).appendTo(`#${table}`);
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
    function keytype(a, b) { return ($(b).data("keytype")) < ($(a).data("keytype")) ? 1 : -1; }
}

async function ViewKeysetInformation() {
    $("#table_keysets tbody").empty();
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv, { AlgorithmId: 0x80, KeyID: 0x00, MI: 0x00 });

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
        results.sort((a, b) => a.KeysetId - b.KeysetId);
        results.forEach((keyset) => {
            let activeFlag = false;
            let activateTag = "";
            let editTag = "";
            let buttonActivate = "";
            let buttonEdit = "";
            let activationDateTime = "";
            let ksadt = "";

            if (keyset.KeysetId == activeKeysetId) {
                activeFlag = true;
            }

            if ((!activeFlag) && keyset.KeysetId != 255) {
                //activateTag = '<a class="keyset-activate" href="javascript:void(0)">Activate</a>';
                buttonActivate = `
                    <button type="button" class="btn btn-outline-secondary keyset-activate">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-in-up" viewBox="0 0 16 16">
                            <path fill-rule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1z"/>
                            <path fill-rule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708z"/>
                        </svg>
                    </button>
                `;
            }

            if (keyset.KeysetId != 255) {
                //editTag = `<a class="keyset-edit" href="javascript:void(0)">Edit</a>`;
                buttonEdit = `
                    <button type="button" class="btn btn-outline-secondary keyset-edit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                            <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                            <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                    </button>
                `;
            }

            if (keyset.ActivationDateTime !== undefined) {
                activationDateTime = keyset.ActivationDateTime.toISOString().slice(0, 16);
                ksadt = activationDateTime;
                activationDateTime = activationDateTime.replace("T", " ");
                activationDateTime = activationDateTime.replace("Z", "");
            }

            //${editTag}
            let row = `<tr class="${((activeFlag || keyset.KeysetId == 255) ? "table-success" : "table-warning")}" data-keysetid="${keyset.KeysetId}" data-keysetname="${keyset.KeysetName}" data-keysettype="${keyset.KeysetType}" data-keysetactivedatetime="${ksadt}" data-active="${(activeFlag || keyset.KeysetId == 255) }">
                    <td>${((activeFlag || keyset.KeysetId == 255) ? "Yes" : "No")}</td>
                    <td>${keyset.KeysetId}</td>
                    <td>${keyset.KeysetName}</td>
                    <td>${keyset.KeysetType}</td>
                    <td>${activationDateTime}</td>
                    <td hidden>
                        <div class="btn-group btn-group-sm" role="group">
                            ${buttonActivate}
                        </div>
                    </td>
                </tr>`;
            $("#table_keysets tbody").append(row);
        });
    }
}

async function ViewKmfInformation() {
    $("#table_kmfRsi tbody").empty();
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

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
        //<a class="kmf-rsi-change" href="javascript:void(0)">Change</a>
        let buttonChange = `
            <button type="button" class="btn btn-outline-secondary kmf-rsi-change">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
            </button>
        `;
        let row = `<tr data-rsiid="${rsi}" data-messagenumber="${mnp}">
                <td>KMF</td>
                <td>${rsi}</td>
                <td>${mnp}</td>
                <td hidden>
                    <div class="btn-group btn-group-sm" role="group">
                        ${buttonChange}
                    </div>
                </td>
            </tr>`;
        $("#table_kmfRsi tbody").append(row);
    }
}

async function ViewRsiInformation() {
    $("#table_rsiItems tbody").empty();
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

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
        rsiItems.sort((a, b) => a.RSI - b.RSI);
        rsiItems.forEach((rsi) => {
            let rsiType = "Unknown";
            let rsiTypeCode = "unk";
            if ((rsi.RSI > 0) && (rsi.RSI < 9999999)) {
                rsiType = "Individual";
            }
            else if ((rsi.RSI > 9999999) && (rsi.RSI < 16777216)) {
                rsiType = "Group";
            }
            //<a class="rsi-change" href="javascript:void(0)">Change</a>
            //<a class="rsi-delete" href="javascript:void(0)">Delete</a>
            let buttonChange = `
                <button type="button" class="btn btn-outline-secondary rsi-change">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                        <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                    </svg>
                </button>
            `;
            let buttonDelete = `
                <button type="button" class="btn btn-outline-secondary rsi-delete">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                        <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                    </svg>
                </button>
            `;
            let row = `<tr data-rsiid="${rsi.RSI}" data-messagenumber="${rsi.MN}" data-rsitype="${rsiType}">
                <td>${rsiType}</td>
                <td>${rsi.RSI}</td>
                <td>${rsi.MN}</td>
                <td hidden>
                    <div class="btn-group btn-group-sm" role="group">
                        ${buttonChange}
                        ${rsiType == "Group" ? buttonDelete : ""}
                    </div>
                </td>
            </tr>`;
            $("#table_rsiItems tbody").append(row);
        });
    }
}

async function EraseKeysFromRadio(keyItems) {
    console.log(keyItems);
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

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
            $(`#table_keyinfo tr[data-keysetid="${key.KeysetId}"][data-sln="${key.Sln}"]`).remove();
        });
    }
}

async function EraseAllKeysFromRadio() {
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

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
        //alert("Radio has been zeroized");
        $("#table_keyinfo").empty();
    }
}

async function CheckMrConnection() {
    let ap, mra, dp;//, twp;
    let mv = false;
    let mrConnected = false;
    if (connected) {
        ap = new AdapterProtocol();
        //twp = new ThreeWireProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        let bp = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
        dp = new DataLinkIndependentProtocol(bp, mv);
    }
    else {
        alert("No MR connection methods have been established yet - connect a MR using a KFD or DLI");
        return;
    }

    try {
        if (connected) {
            mra = new ManualRekeyApplication(ap, mv);
            connectedStatus = await mra.Begin();
            connectedStatus = await mra.End();
        }
        else if (bridgeConnection.readyState == 1) {
            connectedStatus = await dp.CheckTargetMrConnection();
        }
        //mrConnected = true;
        alert("MR connected");
        console.log(connectedStatus);
    }
    catch (error) {
        console.log(error);
    }




    return;
    //buttonCheckConnection
    //buttonDliCheckMrConnection
    if (bridgeConnection.readyState == 1) {
        
    }
    //let mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
    let bp = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    //let dp = new DataLinkIndependentProtocol(bp, mv);
    try {
        let connectedStatus = await dp.CheckTargetMrConnection();
        console.log(connectedStatus);
    }
    catch (error) {
        console.log(error);
    }

    return;
    if (!connected) return;
    let twp = new ThreeWireProtocol();
    //let mrConnected;
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

async function SetRadioClock(datetime) {
    //datetime formatted as: 2018-06-12T19:30
    alert("This feature is not implemented");
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.SetDateTime(datetime);
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

async function ModifyKeysetAttributes(keysets) {
    alert("This feature is not implemented");
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);
    
    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        result = await mra.ModifyKeysetAttributes(keysets);
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
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

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
        console.log(result);
        return;
        $("#table_supportedAlgorithms tbody").empty();
        $("#table_supportedMessages tbody").empty();
        $("#table_supportedServices tbody").empty();
        result.AlgorithmIds.forEach((algId) => {
            let row = "<tr><th>" + LookupAlgorithmId(algId) + "</th></tr>";
            //////// FIX
            $("#table_supportedAlgorithms tbody").append(row);
        });
        result.MessageIds.forEach((mId) => {
            let row = "<tr><th>" + LookupMessageId(mId) + "</th></tr>";
            ///////// FIX
            $("#table_supportedMessages tbody").append(row);
        });
        result.OptionalServices.forEach((osId) => {
            let row = "<tr><th>" + LookupOptionalServiceId(osId) + "</th></tr>";
            ///////// FIX
            $("#table_supportedServices tbody").append(row);
        });
        
        //$("#table_supportedAlgorithms").table("refresh");
        //$("#table_supportedMessages").table("refresh");
        //$("#table_supportedServices").table("refresh");
    }
}

async function Changeover(ksidSuperseded, ksidActivated) {
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

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
        
        //let activateTag = '<a class="keyset-activate" href="javascript:void(0)">Activate</a>';
        //let editTag = `<a class="keyset-edit" href="javascript:void(0)">Edit</a>`;

        let buttonActivate = `
            <button type="button" class="btn btn-outline-secondary keyset-activate">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-box-arrow-in-up" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M3.5 10a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 0 0 1h2A1.5 1.5 0 0 0 14 9.5v-8A1.5 1.5 0 0 0 12.5 0h-9A1.5 1.5 0 0 0 2 1.5v8A1.5 1.5 0 0 0 3.5 11h2a.5.5 0 0 0 0-1z"/>
                    <path fill-rule="evenodd" d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708z"/>
                </svg>
            </button>
        `;
        let buttonEdit = `
            <button type="button" class="btn btn-outline-secondary keyset-edit">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                    <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                </svg>
            </button>
        `;
        //Leave this empty until keyset tagging is implemented
        buttonEdit = "";

        $(`#table_keysets tr[data-keysetid="${ksidSuperseded}"]`)[0].dataset.active = false;
        $(`#table_keysets tr[data-keysetid="${ksidSuperseded}"]`)[0].classList.remove("table-success");
        $(`#table_keysets tr[data-keysetid="${ksidSuperseded}"]`)[0].classList.add("table-warning");
        $(`#table_keysets tr[data-keysetid="${ksidSuperseded}"]`)[0].children[0].innerText = "No";
        $(`#table_keysets tr[data-keysetid="${ksidSuperseded}"]`)[0].children[5].innerHTML = `<div class="btn-group btn-group-sm" role="group">${buttonEdit}${buttonActivate}</div`;//editTag + activateTag;
        $(`#table_keysets tr[data-keysetid="${ksidActivated}"]`)[0].dataset.active = true;
        $(`#table_keysets tr[data-keysetid="${ksidActivated}"]`)[0].classList.remove("table-warning");
        $(`#table_keysets tr[data-keysetid="${ksidActivated}"]`)[0].classList.add("table-success");
        $(`#table_keysets tr[data-keysetid="${ksidActivated}"]`)[0].children[0].innerText = "Yes";
        $(`#table_keysets tr[data-keysetid="${ksidActivated}"]`)[0].children[5].innerHTML = `<div class="btn-group btn-group-sm" role="group">${buttonEdit}</div>`;//editTag;
    }
}

async function ChangeRsiValues(rsiType, rsiOld, rsiNew, mnp) {
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);

    let result;
    try {
        ShowLoading();
        DisableKfdButtons();
        if (rsiType == "KMF") {
            result = await mra.LoadConfig(rsiNew, mnp);
        }
        else {
            result = await mra.ChangeRsi(rsiOld, rsiNew, mnp);
        }
    }
    catch (error) {
        console.error(error);
    }
    finally {
        HideLoading();
        EnableKfdButtons();
    }
    console.log(result);
    if (result instanceof RspRsiInfo) {
        if (result.Status == 0) {
            if (rsiType == "KMF") {
                // Change the RSI and MNP in the table
                $(`#table_kmfRsi tr[data-rsiid="${rsiOld}"]`)[0].children[1].innerText = rsiNew;
                $(`#table_kmfRsi tr[data-rsiid="${rsiOld}"]`)[0].children[2].innerText = mnp;
                $(`#table_kmfRsi tr[data-rsiid="${rsiOld}"]`)[0].dataset.messagenumber = mnp;
                $(`#table_kmfRsi tr[data-rsiid="${rsiOld}"]`)[0].dataset.rsiid = rsiNew;
            }
            else if ((rsiType == "Individual") || (rsiType == "Group")) {
                // Add/remove/change the table rows
                if (rsiNew == 0) {
                    // Delete the RSI
                    $(`#table_rsiItems tr[data-rsiid="${rsiOld}"]`)[0].remove();
                }
                else if (rsiOld == 0) {
                    // Add new RSI
                    //<a class="rsi-change" href="javascript:void(0)">Change</a>
                    //<a class="rsi-delete" href="javascript:void(0)">Delete</a>
                    let buttonChange = `
                        <button hidden type="button" class="btn btn-outline-secondary rsi-change">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                                <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                            </svg>
                        </button>
                    `;
                    let buttonDelete = `
                        <button type="button" class="btn btn-outline-secondary rsi-delete">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                                <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                            </svg>
                        </button>
                    `;
                    let rowInfo = `<tr data-rsiid="${result.RSI}" data-messagenumber="${mnp}" data-rsitype="${rsiType}">
                        <td>${rsiType}</td>
                        <td>${result.RSI}</td>
                        <td>${mnp}</td>
                        <td hidden>
                            <div class="btn-group btn-group-sm" role="group">
                                ${buttonChange}
                                ${rsiType == "Group" ? buttonDelete : ""}
                            </div>
                        </td>
                    </tr>`;
                    $("#table_rsiItems tbody").append(rowInfo);
                }
                else {
                    $(`#table_rsiItems tr[data-rsiid="${rsiOld}"]`)[0].children[1].innerText = rsiNew;
                    $(`#table_rsiItems tr[data-rsiid="${rsiOld}"]`)[0].children[2].innerText = mnp;
                    $(`#table_rsiItems tr[data-rsiid="${rsiOld}"]`)[0].dataset.messagenumber = mnp;
                    $(`#table_rsiItems tr[data-rsiid="${rsiOld}"]`)[0].dataset.rsiid = rsiNew;
                }
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
    //if (!connected) return;
    //let ap = new AdapterProtocol();
    //let mra = new ManualRekeyApplication(ap, false);

    let ap, mra;
    let mv = false;
    if (connected) {
        ap = new AdapterProtocol();
    }
    else if (bridgeConnection.readyState == 1) {
        mv = parseInt(document.querySelector("#kfdOptions_dliMotVariant").value);
        ap = new BridgeProtocol(document.querySelector("#kfdOptions_dliRadioHost").value);
    }
    else return;
    mra = new ManualRekeyApplication(ap, mv);
    
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

async function ModifyKeysetAttributes(keysetId, keysetActiveDatetime, keysetName) {
    
}

function ClearKeyInfo() {
    // Reset all key fields to default
    document.querySelector("#loadKeySingle_containerKeyIdOld").value = "";
    document.querySelector("#loadKeySingle_name").value = "";
    document.querySelector("#loadKeySingle_activeKeysetSwitch").checked = true;
    document.querySelector("#loadKeySingle_keysetId").value = "";
    document.querySelector("#loadKeySingle_keysetDiv").hidden = true;
    document.querySelector("#loadKeySingle_slnCkr").value = "";
    document.querySelector("#loadKeySingle_keyIdOld").value = "";
    document.querySelector("#loadKeySingle_keyId").value = "";
    document.querySelector("#loadKeySingle_algorithm option[value='132']").selected = true;
    document.querySelector("#loadKeySingle_algorithmOther").value = "132";
    document.querySelector("#loadKeySingle_key").value = "";
}
function SetKeyInfoFieldsForEdit() {
    // Disable all fields except name, key id and key
    //document.querySelector("#loadKeySingle_name").disabled = true;
    document.querySelector("#loadKeySingle_activeKeysetSwitch").disabled = true;
    document.querySelector("#loadKeySingle_keysetId").disabled = true;
    document.querySelector("#loadKeySingle_slnCkr").disabled = true;
    //document.querySelector("#loadKeySingle_keyId").disabled = true;
    document.querySelector("#loadKeySingle_algorithm").disabled = true;
    document.querySelector("#loadKeySingle_algorithmOther").disabled = true;
    //document.querySelector("#loadKeySingle_key").disabled = true;

    // Change title and button text
    $("#loadKeySingle h3").html("Edit Container Key");
    document.querySelector("#loadKeySingle_add").hidden = true;
    document.querySelector("#loadKeySingle_edit").hidden = false;
}
function SetKeyInfoFieldsForNew() {
    // Enable all fields
    $("#loadKeySingle_containerKeyIdOld").val();
    //$("#loadKeySingle_name").prop("disabled", false);
    document.querySelector("#loadKeySingle_activeKeysetSwitch").disabled = false;
    $("#loadKeySingle_keysetId").prop("disabled", false);
    $("#loadKeySingle_slnCkr").prop("disabled", false);
    $("#loadKeySingle_slnCkr").trigger("keyup");
    //$("#loadKeySingle_keyId").prop("disabled", false);
    $("#loadKeySingle_algorithm").prop("disabled", false);
    $("#loadKeySingle_algorithmOther").prop("disabled", false);
    //$("#loadKeySingle_key").prop("disabled", false);

    // Change title and button text
    $("#loadKeySingle h3").html("Create New Key");
    document.querySelector("#loadKeySingle_edit").hidden = true;
    document.querySelector("#loadKeySingle_add").hidden = false;
}
function PopulateKeyInfoFieldsForEdit(key) {
    // Set values
    console.log(key);
    $("#loadKeySingle_containerKeyIdOld").val(key.Id);
    $("#loadKeySingle_name").val(key.Name);
    if (key.ActiveKeyset) {
        document.querySelector("#loadKeySingle_activeKeysetSwitch").checked = true;
        $("#loadKeySingle_keysetId").val("");
        document.querySelector("#loadKeySingle_keysetDiv").hidden = true;
    }
    else {
        document.querySelector("#loadKeySingle_activeKeysetSwitch").checked = false;
        $("#loadKeySingle_keysetId").val(key.KeysetId.toString(inputBase));
        document.querySelector("#loadKeySingle_keysetDiv").hidden = false;
    }

    /*
    let sln, slnPrecision, kid, kidPrecision, ksid, ksidPrecision;
    slnPrecision = document.querySelector("#loadKeySingle_slnCkr").dataset.hexPrecision;
    kidPrecision = document.querySelector("#loadKeySingle_keyId").dataset.hexPrecision;
    ksidPrecision = 2;
    sln = key.Sln.toString(inputBase);
    kid = key.KeyId.toString(inputBase);
    ksid = key.KeysetId.toString(inputBase);
    if (inputBase == 16) {
        sln = "0x" + sln.padStart(slnPrecision, "0").toUpperCase();
        kid = "0x" + kid.padStart(kidPrecision, "0").toUpperCase();
        ksid = "0x" + ksid.padStart(ksidPrecision, "0").toUpperCase();
    }
    */


    document.querySelector("#loadKeySingle_slnCkr").value = key.Sln.toString(inputBase);
    $("#loadKeySingle_slnCkr").trigger("keyup");
    document.querySelector("#loadKeySingle_keyIdOld").value = key.KeyId;
    document.querySelector("#loadKeySingle_keyId").value = key.KeyId.toString(inputBase);
    document.querySelector("#loadKeySingle_algorithm option[value='" + key.AlgorithmId + "']").selected = true;
    document.querySelector("#loadKeySingle_algorithmOther").value = key.AlgorithmId;
    document.querySelector("#loadKeySingle_key").value = BCTS(key.Key).join("");
    $("#loadKeySingle_key").attr("type", "password");
    document.querySelector("#loadKeySingle_toggleKeyVis").checked = false;
    //$("#loadKeySingle_key").trigger("keyup");// DOES THIS WORK? or do I need $(".hex-input").trigger("keyup");
}

function UpdateProgress(percent, text) {
    if (percent < 0) {
        $("#progress").attr("type", "indeterminate");
        $("#progress").attr("value", "0");
    }
    else {
        $("#progress").attr("type", "determinate-value");
        $("#progress").attr("value", percent);
    }
    $("#progress").attr("text", text);
}

function ShowLoading(loadingType) {
    // TODO
    document.querySelector(".spinner-wrapper").hidden = false;
    return;
    //https://stackoverflow.com/questions/6597388/jquery-mobile-disable-all-button-when-loading-overlay-is-showed
    //$("body").addClass("ui-disabled");
    document.querySelector("#scrim").hidden = false;
    //document.querySelector("#progress").hidden = false;
    let loadingOptionsCustom = {
        // JQM
        html: '<div id="keyloadStatus"><div class="ui-corner-all custom-corners"><div class="ui-bar ui-bar-a"><h3>Loading ***LOADINGTYPE***s</h3></div><div class="ui-body ui-body-a"><p>Loading ***LOADINGTYPE***: <span id="keyloadStatus_itemName">key 1</span></p><label for="slider-keyload-status" class="ui-hidden-accessible">Status:</label><input type="range" name="slider-keyload-status" id="slider-keyload-status" data-highlight="true" disabled="disabled" min="0" max="100" value="33"><p class="details left">0%</p><p class="details right">Loading ***LOADINGTYPE*** <span id="keyloadStatus_itemNumber">1</span> of <span id="keyloadStatus_itemTotal">3</span></p><button id="buttonCancelLoading" onclick="CancelTransfers()" class="ui-btn ui-corner-all ui-shadow ui-btn-icon-left ui-icon-delete">Cancel</button></div></div></div>',
        textVisible: false
    };
    let loadingParams = {
        text: "Processing...",
        textVisible: true
    }
    if (loadingType !== undefined) {
        if (loadingType == "connect") {
            $("#scrim").attr("type", "indeterminate");
            $("#scrim").attr("text", "Connecting to KFD...");
            loadingParams.text = "Initializing connection...";
        }
        else if (loadingType == "keys") {
            $("#progress").attr("type", "determinate-value");
            $("#progress").attr("text", "Transferring keys...");
            //loadingOptionsCustom.html = loadingOptionsCustom.html.replaceAll("***LOADINGTYPE***", loadingType);
            //loadingParams = loadingOptionsCustom;
        }
        else {
            $("#progress").attr("type", "indeterminate");
            $("#progress").attr("text", "Transferring data...");
        }
    }
    //$("#process-dialog").modal("show");

    //document.querySelector("#loader").hidden = false;
    
    //document.querySelector("#loader").setAttribute("label", loadingParams.text);
    //document.querySelector("#loader").setAttribute("text", loadingParams.text);

    //$("#pageDiv").addClass("ui-disabled");
    //$.mobile.loading("show", { text: "Processing...", textVisible: true });
    //$.mobile.loading("show", loadingParams).enhanceWithin();
    //$(".disableOnLoading").addClass("ui-disabled");
}
function HideLoading() {
    // TODO
    document.querySelector(".spinner-wrapper").hidden = true;
    return;
    document.querySelector("#scrim").hidden = true;
    //document.querySelector("#progress").hidden = true;
    //$("#process-dialog").modal("hide");

    //document.querySelector("#loader").hidden = true;
    //$.mobile.loading("hide");
    //$("#pageDiv").removeClass("ui-disabled");
    //$(".disableOnLoading").removeClass("ui-disabled");
}

async function ImportEkc() {
    let success = await OpenEkc(fileInputElement.files[0], $("#passwordEkc").val());
    if (success) {
        ClearEkcFields();
        $(".keyContainerFileName").text(_keyContainer.source);
    }
    else {
        $("#passwordEkc").val("");
    }
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
    _keyContainer.source = filename + ".ekc";
    $(".keyContainerFileName").text(_keyContainer.source);
}

function ClearEkcFields() {
    $("#passwordEkc").val("");
    $("#inputFile").val("");
}

function ClearPopupAddEditRsi() {
    $("#addEditRsi_typeOld").val("");
    $("#addEditRsi_action").val("");
    $("#addEditRsi_rsiOld").val("");
    $("#addEditRsi_rsi").val("");
    $("#addEditRsi_mnp").val("");
    $("#addEditRsi_rsiType").text("");
    $("#addEditRsi_rsiType").removeClass("invalid");
}

async function ConnectDevice() {
    if (connected) {
        alert("KFD device already connected");
        return;
    }
    console.log(`connecting via ${connectionMethod}`);
    if (connectionMethod == "webserial") {
        const connection = await connectSerial();
        //if (connection === undefined) return;
        ShowLoading();
        // Uncomment for readUntilClosed, comment for readWithTimeout
        if (transferMethod == "RUC") {
            const reading = readUntilClosed();
        }
        
        if (connected) {
            ShowDeviceConnected();
            // Allow time for Arduino to initialize
            if ((serialModelId == "KFD-AVR") || (serialModelId == "KFDMicro")) {
                ShowLoading("connect");
                await new Promise(resolve => setTimeout(resolve, 4000));//6000
                HideLoading();
            }
            
            await ReadDeviceSettings().then(HideLoading());
        }
        else {
            HideLoading();
        }
        return;
    }
    else if (connectionMethod == "webusb") {

    }
/*
    let device;
    device = await navigator.usb.requestDevice({ filters: []} );
    await device.open();
    await device.selectConfiguration(1);
    await device.claimInterface(1);
    await device.selectAlternateInterface(1, 0);
    console.log(device);
    let frameData = [97, 17, 1, 99];
    let outData = new Uint8Array(frameData);
    await new Promise(resolve => setTimeout(resolve, 4000));
    console.log("sending", frameData);
    device.transferOut(4, outData)
    .then(result => console.log(result))
    .then(() => device.transferIn(3, 64))
    .then((data) => console.log(data));
    return;
*/

    ////// THIS BLOCK IS FOR TESTING CDC-ACM
    //https://medium.com/@gerybbg/webusb-by-example-b4358e6a133c
    //https://stackoverflow.com/questions/65945564/reading-gps-receiver-using-webusb
    //https://stackoverflow.com/questions/64929987/webusb-api-working-but-the-data-received-arent-decoded-properly
    usbDevice = await navigator.usb.requestDevice({ filters: []});
    console.log("selected device", usbDevice);
    //dev = await navigator.usb.requestDevice({ filters: []});
    await usbDevice.open();
    if (usbDevice.vendorId == filterKfdTool.usbVendorId) {
        serialModelId = "KFD100";
    }
    else if (usbDevice.vendorId == filterKfdAvr.usbVendorId) {
        serialModelId = "KFD-AVR";
    }
    else if (usbDevice.vendorId == filterKfdMicro.usbVendorId) {
        serialModelId = "KFDMicro";
    }
    else if (portInfo.vendorId == filterKfdPico.usbVendorId) {
        serialModelId = "KFDPico";
    }
    else {
        alert("Unsupported device type - KFDweb only supports KFDtool, KFD-AVR, and KFDMicro devices");
        return;
    }
    ShowLoading();
    //console.log(usbDevice.configuration.interfaces);
    usbDevice.configuration.interfaces.forEach(element => {
        element.alternates.forEach(elementalt => {
            if (elementalt.interfaceClass == 0xFF) usbMode = "FTDI";
        });
        if (usbMode == "none") {
            element.alternates.forEach(elementalt => {
                if (elementalt.interfaceClass == 0x0A) usbMode = "CDC-ACM";
            });
        }
    });
    if (usbMode == "none") {
        alert("Selected device does not support FTDI or CDC-ACM transfer protocols");
        await usbDevice.close();
        return;
    }
    console.log(usbMode);
    if (usbMode == "CDC-ACM") {
        
        const listen = async() => {
            try {
                const result = await usbDevice.transferIn(usbDevice.endpointIn, 64);//3//2//usbDevice.endpointIn
                let uintArr = new Uint8Array(result.data.buffer);
                //let regularArr = Array.from(uintArr);
                //console.log(regularArr);
                OnDataReceived(Array.from(uintArr));
                listen();
            }
            catch (error) {
                console.error(error);
                DisconnectDevice();
                connected = false;
            }
            /*
            //console.log("listening");
            //if (!usbDevice.opened) DisconnectDevice();
            const result = await usbDevice.transferIn(usbDevice.endpointIn, 64);//3//2//usbDevice.endpointIn
            let uintArr = new Uint8Array(result.data.buffer);
            //let regularArr = Array.from(uintArr);
            //console.log(regularArr);
            OnDataReceived(Array.from(uintArr));
            listen();
            //if (usbDevice.opened) listen();
            //else DisconnectDevice();
            */
        }
///*
        await usbDevice.configuration.interfaces.forEach(element => {
            element.alternates.forEach(elementalt => {
                if (elementalt.interfaceClass==0x0A) {
                    usbDevice.interfaceNumber = element.interfaceNumber;
                    elementalt.endpoints.forEach(elementendpoint => {
                        if (elementendpoint.direction == "out") {
                            usbDevice.endpointOut = elementendpoint.endpointNumber;
                        }
                        if (elementendpoint.direction=="in") {
                            usbDevice.endpointIn = elementendpoint.endpointNumber;
                        }
                    })
                }
            })
        })
//*/

        console.log("usbDevice", usbDevice);
        await usbDevice.selectConfiguration(usbDevice.interfaceNumber);//1//usbDevice.interfaceNumber
        
        try {
            await usbDevice.claimInterface(usbDevice.interfaceNumber);//1//usbDevice.interfaceNumber
            //console.log("usbDevice", usbDevice);
            connected = true;
            ShowDeviceConnected();
            if ((serialModelId != "KFD100")) await new Promise(resolve => setTimeout(resolve, 4000));
            let frameData = [97, 17, 1, 99];
            let outData = new Uint8Array(frameData);
            //usbDevice.transferOut(4, outData)
            //.then(result => console.log(result))
            //.then(() => usbDevice.transferIn(3, 64))
            //.then(() => listen());
            //.then(result => console.log(result));

            listen();
            await ReadDeviceSettings();
            //await usbDevice.transferOut(4, outData);
        }
        catch (error) {
            console.error(error);
            alert(error);
            return;
        }
        finally {
            HideLoading();
        }
        

        return;





        const sps = { deviceFilters: [] };
        port = new WebUSBCdcPort(usbDevice, sps);
        try {
            await port.connect((data) => {
                console.log(data);
                OnDataReceived(Array.from(data));
            }, (error) => {
                console.warn("Error receiving data: ", error);
            });
            //await port.connect((data) => OnDataReceived(Array.from(data)), (error) => console.warn("Error receiving data: ", error));
            //port.onReceive = OnDataReceived();
            //port.onReceiveError = function(error) { console.log(error); }
            connected = true;
            ShowDeviceConnected();
            if ((serialModelId != "KFD100")) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
            await ReadDeviceSettings();
        }
        catch(error) {
            console.warn("Error connecting to port: " + error.error)
            console.warn(error);
        }
        finally {
            HideLoading();
        }
    }
    else if (usbMode == "FTDI") {
        //https://github.com/webusb/arduino/blob/gh-pages/demos/serial.js
        const sps = {
            baudrate: serialPortSettings.baudRate,
            parity: serialPortSettings.parity,
            bits: serialPortSettings.dataBits,
            stop: serialPortSettings.stopBits,
            overridePortSettings: true,
            deviceFilters: []
        };
        //let device = new WebUSBSerialDevice(sps);
        //port = await device.requestNewPort();
        port = new WebUSBSerialPort(usbDevice, sps);
        //ShowLoading();
        try {
            //console.log("trying");
            await port.connect((data) => {
                OnDataReceived(Array.from(data));
            }, (error) => {
                port.disconnect();
                ShowDeviceDisconnected();
                connected = false;
                if (port.device.opened) console.error("Error receiving data: " + error);
            });
            connected = true;
            ShowDeviceConnected();
            //ShowLoading("connect");
            // Allow time for Arduino to initialize
            if ((serialModelId != "KFD100")) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
            await ReadDeviceSettings();
        }
        catch(error) {
            console.warn("Error connecting to port: " + error.error)
            console.warn(error);
        }
        finally {
            HideLoading();
        }
    }
    

    //connected = true;
    //ShowDeviceConnected();
    //await ReadDeviceSettings();
    //HideLoading();

    return;
    try {
        usbDevice.open()
        .then(() => usbDevice.selectConfiguration(1))
        .then(() => {
            if (usbDevice.configuration === null) {
                return usbDevice.selectConfiguration(1);
            }
        })
        .then(() => {
            var interfaces = usbDevice.configuration.interfaces;
            interfaces.forEach(element => {
                element.alternates.forEach(elementalt => {
                    if (elementalt.interfaceClass==0x0A) {
                        this.interfaceNumber = element.interfaceNumber;
                        elementalt.endpoints.forEach(elementendpoint => {
                            if (elementendpoint.direction == "out") {
                                this.endpointOut = elementendpoint.endpointNumber;
                            }
                            if (elementendpoint.direction == "in") {
                                this.endpointIn = elementendpoint.endpointNumber;
                            }
                        });
                    }
                });
            });
            console.log("in", this.endpointIn);
            console.log("out", this.endpointOut);
        })
        .then(() => usbDevice.claimInterface(this.interfaceNumber))
        .then(() => usbDevice.selectAlternateInterface(this.interfaceNumber, 0))
        .then(() => console.log(device));

        

        /*
        .then(() => new Promise(resolve => setTimeout(resolve, 4000)))
        .then(() => {
            let frameData = [97, 17, 1, 99];
            let outData = new Uint8Array(frameData);
            device.transferOut(this.endpointOut, outData)
            .then(res => console.log(res));
        })
        .then(() => {
            device.transferIn(this.endpointIn, 64).then(result => {
                console.log(result);
            });
        });
        */
        
        /*
        await new Promise(resolve => setTimeout(resolve, 4000));

        let frameData = [97, 17, 1, 99];
        let outData = new Uint8Array(frameData);
        device.transferOut(this.endpointOut, outData)
        .then((result) => console.log(result))
        //.then(() => new Promise(resolve => setTimeout(resolve, 4000)))
        .then(() => device.transferIn(this.endpointIn, 64))
        .then((result) => console.log(result));
        */

        await new Promise(resolve => setTimeout(resolve, 4000));

        setTimeout(Receive, 1);
/*
        const listen = async() => {
            console.log("listening");
            const result = await device.transferIn(this.endpointIn, 64);
            //OnDataReceived(Array.from(result));
            console.log(result);
            listen();
        }
        listen();
*/
        let frameData = [97, 17, 1, 99];
        //frameData = [0x61, 0x11, 0x01, 0x63];
        let outData = new Uint8Array(frameData);
        device.transferOut(this.endpointOut, outData)
        //.then(result => console.log(result))
        //.then(() => device.transferIn(this.endpointIn, 64))
        //.then(() => listen())
        .then(result => console.log(result));
        
        

/*
        try {
            await device.connect((data) => {
                OnDataReceived(Array.from(data));
            }, (error) => {
                console.warn("Error receiving data: " + error);
            });
        }
        catch(e) {

        }
*/

    }
    catch(error) {
        console.warn("Error connecting to port: " + error.error)
        console.warn(error);
    }
    ////// THIS BLOCK IS FOR TESTING CDC-ACM

    ////// THIS BLOCK IS JUST TESTING
    /*
    navigator.usb.requestDevice({
        filters: []
    })
    .then((selectedDevice) => {
        console.log(selectedDevice);
        device = selectedDevice;
        
        return device.open();
    })
    .then(() => device.selectConfiguration(1))
    .then(() => device.claimInterface(device.configuration.interfaces[0].interfaceNumber))
    .then(() => device.claimInterface(device.configuration.interfaces[1].interfaceNumber))
    .then(() => device.selectAlternateInterface(device.configuration.interfaces[0].interfaceNumber, 0))
    .then(() => device.selectAlternateInterface(device.configuration.interfaces[1].interfaceNumber, 0))
    .then(() => {
        console.log(device);
        y = device;
    });
    */
    ////// THIS BLOCK IS JUST TESTING



}

async function ConnectDevice_DEPRECATED() {
    if (connected) {
        alert("KFD device already connected");
        return;
    }
    //if (!confirm("Please ensure the radio is connected to the KFD and in keyfill mode before connecting to device. Select OK to continue, or cancel to abort.")) return;
    
    console.log(`connecting via ${connectionMethod}`);
    if (connectionMethod == "webserial") {
        
        // Use Web Serial API
        //console.log("Web Serial API supported");
        //$("#connectionMethod").text("Web Serial API");
        //connectionMethod = "ws";
        const connection = await connectSerial();
        //if (connection === undefined) return;
        ShowLoading();
        // Uncomment for readUntilClosed, comment for readWithTimeout
        if (transferMethod == "RUC") {
            const reading = readUntilClosed();
        }
        
        if (connected) {
            ShowDeviceConnected();
            // Allow time for Arduino to initialize
            if ((serialModelId != "KFD-AVR") || (serialModelId == "KFDMicro")) {
                ShowLoading("connect");
                await new Promise(resolve => setTimeout(resolve, 4000));//6000
                HideLoading();
            }
            
            await ReadDeviceSettings().then(HideLoading());
        }
        else {
            HideLoading();
        }
    }
    else if (connectionMethod == "webusb") {
        const sps = {
            baudrate: serialPortSettings.baudRate,
            parity: serialPortSettings.parity,
            bits: serialPortSettings.dataBits,
            stop: serialPortSettings.stopBits,
            overridePortSettings: true,
            deviceFilters: []
            //deviceFilters: [
            //    { vendorId: filterKfdTool.usbVendorId, productId: filterKfdTool.usbProductId},
            //    { vendorId: filterKfdAvr.usbVendorId },
            //    { vendorId: filterKfdMicro.usbVendorId }
            //]
        };


        ///////////// THIS IS WHAT IT SHOULD LOOK LIKE IN THE END
/*
        let device = new WebUSBCdcDevice(sps);
        port = await device.requestNewPort();
        ShowLoading();
        try {
            console.log("trying");
            await port.connect((data) => {
                OnDataReceived(Array.from(data));
            }, (error) => {
                console.warn("Error receiving data: " + error);
            });
            connected = true;
            ShowDeviceConnected();
            //ShowLoading("connect");
            // Allow time for Arduino to initialize
            serialModelId = "KFD-AVR";
            if ((serialModelId == "KFD-AVR") || (serialModelId == "KFDMicro")) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
            await ReadDeviceSettings();
        }
        catch(error) {
            console.warn("Error connecting to port: " + error.error)
            console.warn(error);
        }
        finally {
            HideLoading();
        }
*/

        ////// THIS BLOCK IS FOR TESTING CDC-ACM
        // till...
        ////// THIS BLOCK IS JUST TESTING
        
        ////// THIS BLOCK IS WORKING FOR MICRO/KFDTOOL
        let device = new WebUSBSerialDevice(sps);
        port = await device.requestNewPort();
        ShowLoading();
        if (port.device.vendorId == filterKfdTool.usbVendorId) {
            serialModelId = "KFD100";
        }
        else if (port.device.vendorId == filterKfdAvr.usbVendorId) {
            serialModelId = "KFD-AVR";
        }
        else if (port.device.vendorId == filterKfdMicro.usbVendorId) {
            serialModelId = "KFDMicro";
        }
        else {
            alert("Unsupported device type - KFDweb only supports KFDtool, KFD-AVR, and KFDMicro devices");
            return;
        }
        //console.log(serialModelId);

        //let frameData = CreateFrameKFDAVR([17,3]);
        //let outData = new Uint8Array(frameData);
        //console.log(frameData);
        //console.log(BCTS(data).join("-"));

        // read comment starting on line 76
        // https://github.com/webusb/arduino/blob/gh-pages/demos/serial.js

        try {
            //console.log("trying");
            await port.connect((data) => {
                OnDataReceived(Array.from(data));
            }, (error) => {
                console.warn("Error receiving data: " + error);
            });
            connected = true;
            ShowDeviceConnected();
            //ShowLoading("connect");
            // Allow time for Arduino to initialize
            if ((serialModelId == "KFD-AVR") || (serialModelId == "KFDMicro")) {
                await new Promise(resolve => setTimeout(resolve, 4000));
            }
            await ReadDeviceSettings();
        }
        catch(error) {
            console.warn("Error connecting to port: " + error.error)
            console.warn(error);
        }
        finally {
            HideLoading();
        }
    }
}

function ShowDeviceConnected() {
    $("#buttonConnectKfd").prop("disabled", true);
    //menu_configKfd indicator
    //document.querySelector("#menu_configKfd").classList.remove("connection-status-disconnected");
    //document.querySelector("#menu_configKfd").classList.add("connection-status-connected");
    //$("#buttonDisconnectKfd").prop("disabled", false);
    //$(".button-kfd").attr("disabled", false);
    EnableKfdButtons();
    $("#connectionStatus").text("Connected");
}

function ShowDeviceDisconnected() {
    $("#buttonConnectKfd").prop("disabled", false);
    //menu_configKfd indicator
    //document.querySelector("#menu_configKfd").classList.remove("connection-status-connected");
    //document.querySelector("#menu_configKfd").classList.add("connection-status-disconnected");
    //$("#buttonDisconnectKfd").prop("disabled", true);
    //$(".button-kfd").attr("disabled", true);
    DisableKfdButtons();
    $("#connectionStatus").text("Disconnected");
    $("#deviceProperties").html("");
}

function EnableKfdButtons() {
    document.querySelectorAll(".button-kfd").forEach((i) => i.disabled = false);
    document.querySelectorAll(".href-kfd").forEach((i) => i.disabled = false);
    
}
function DisableKfdButtons() {
    document.querySelectorAll(".button-kfd").forEach((i) => i.disabled = true);
    document.querySelectorAll(".href-kfd").forEach((i) => i.disabled = true);
}

async function ReadDeviceSettings() {
    let device = {};
    if (serialModelId == "KFD100") {

    }
    else if (serialModelId == "KFD-AVR") {
        
    }
    else if (serialModelId == "KFDMicro") {
        
    }
    else if (serialModelId == "KFDPico") {
        
    }
    let apVersion, fwVersion, uniqueId, modelId, hwVersion, serial;

    let ap = new AdapterProtocol();
    /*
    let apVersion = await ap.ReadAdapterProtocolVersion();
    device.adapterProtocolVersion = apVersion.join(".");
    
    let fwVersion = await ap.ReadFirmwareVersion();
    device.firmwareVersion = fwVersion.join(".");
    
    let uniqueId = await ap.ReadUniqueId();
    device.uniqueId = uniqueId.join("");

    let modelId = await ap.ReadModelId();
    let mId = "NOT SET";
    if (modelId == 0x01) mId = "KFD100";
    else if (modelId == 0x02) mId = "KFD-AVR";
    else mId = "UNKNOWN";
    device.modelId = mId;

    let hwVersion = await ap.ReadHardwareRevision();
    device.hardwareVersion = hwVersion.join(".");

    let serial = await ap.ReadSerialNumber();
    let serialString = serial.map(hex => String.fromCharCode(hex));
    device.serial = serialString.join("");
    */

    try {
        apVersion = await ap.ReadAdapterProtocolVersion();
        fwVersion = await ap.ReadFirmwareVersion();
        uniqueId = await ap.ReadUniqueId();
        modelId = await ap.ReadModelId();
        hwVersion = await ap.ReadHardwareRevision();
        serial = await ap.ReadSerialNumber();
    }
    catch (error) {
        console.error(error);
    }

    if (apVersion != undefined) device.adapterProtocolVersion = apVersion.join(".");
    if (fwVersion != undefined) device.firmwareVersion = fwVersion.join(".");
    if (uniqueId != undefined) device.uniqueId = BCTS(uniqueId).join("");
    if (modelId != undefined) {
        let mId = "NOT SET";
        if (modelId == 0x01) mId = "KFD100";
        else if (modelId == 0x02) mId = "KFD-AVR";
        else mId = serialModelId;
        device.modelId = mId;
    }
    if (hwVersion != undefined) {
        device.hardwareVersion = hwVersion.join(".");
    }
    if (serial != undefined) {
        let serialStringArray = serial.map(hex => String.fromCharCode(hex));
        device.serial = serialStringArray.join("");
    }

    //console.log("device", device);
    
    $("#deviceProperties").html(
        "Model: " + device.modelId + "<br>" +
        "Revision: " + device.hardwareVersion + "<br>" +
        "Firmware: " + device.firmwareVersion + "<br>" +
        "Protocol: " + device.adapterProtocolVersion + "<br>" +
        "Serial: " + device.serial + "<br>" +
        "Unique ID: " + device.uniqueId
    );

    if (device.adapterProtocolVersion == "1.0.0") {
        alert("Warning: your KFDtool must be running Protocol version 1.1.0 or greater, see KFDtool Firmware Notice below");
        $("#firmwareNotice").collapsible("expand");
    }
    else if (device.adapterProtocolVersion == "2.1.0") {
        FeatureAvailableSendBytes = true;
        FeatureAvailableSetTransferSpeed = true;
    }
    else if (device.adapterProtocolVersion == "2.2.0") {
        FeatureAvailableSendBytes = true;
        FeatureAvailableSetTransferSpeed = true;
        FeatureAvailableSendKeySignatureAndReadyReq = true;
    }

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
    console.log(key);
    let returnVal = {
        valid: true,
        reason: ""
    };
    let matchingKeys = _keyContainer.keys.filter(function(obj) { return obj.Name === key.Name; });
    if (matchingKeys.length) {
        returnVal.valid = false;
        returnVal.reason = "Key name must be unique";
    }
    matchingKeys = _keyContainer.keys.filter(function(obj) { return ((obj.KeyId === key.KeyId) && (obj.AlgorithmId === key.AlgorithmId) && (obj.KeysetId === key.KeysetId)); });
    if (matchingKeys.length) {
        console.log(matchingKeys);
        returnVal.valid = false;
        returnVal.reason = "Key with same Algorithm and Key ID already exists in keyset " + key.KeysetId;
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
    ClearKeyFilter();
    ClearGroupKeyFilter();
    $("#keyContainerKeyList").empty();
    $("#addGroupKeyList").empty();
    $("#addMultipleKeyList").empty();
    // Currently sharing addMultipleKeyList and addGroupKeyList
    //$("#regenerateKeyList").empty();
    //$("#regenerateGroupList").empty();
    _keyContainer.keys.forEach(key => {
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

        let sln, slnPrecision, kid, kidPrecision, ksid, ksidPrecision;
        slnPrecision = document.querySelector("#loadKeySingle_slnCkr").dataset.hexPrecision;
        kidPrecision = document.querySelector("#loadKeySingle_keyId").dataset.hexPrecision;
        ksidPrecision = 2;
        sln = key.Sln.toString(inputBase);
        kid = key.KeyId.toString(inputBase);
        ksid = key.KeysetId.toString(inputBase);
        if (inputBase == 16) {
            sln = "0x" + sln.padStart(slnPrecision, "0").toUpperCase();
            kid = "0x" + kid.padStart(kidPrecision, "0").toUpperCase();
            ksid = "0x" + ksid.padStart(ksidPrecision, "0").toUpperCase();
        }

        let algName = LookupAlgorithmId(key.AlgorithmId);
        keyListItem = `
            <a class="hexdec-li list-group-item list-group-item-action" data-container-key-id="${key.Id}" data-container-sln="${key.Sln}" data-container-kid="${key.KeyId}" href="javascript:void(0)">
                <p class="mb-0">${key.Name}</p>
                <small class="text-muted">${algName}, ${keyType}, SLN ${sln}, KID ${kid}, Keyset ${(key.ActiveKeyset ? "Active" : ksid)}</small>
            </a>`;
        $("#keyContainerKeyList").append(keyListItem);
        $("#addGroupKeyList").append(keyListItem);
        $("#addMultipleKeyList").append(keyListItem);

        // Make select options for kfdOptions_tek, kfdOptions_kek, kfdOptions_macKey
        let keyOption = `<option value="${key.Id}" data-parity="false">${key.Name}, ${algName}, SLN ${key.Sln}, KID ${key.KeyId}, Keyset ${(key.ActiveKeyset ? "Active" : key.KeysetId)}</option>`;
        if (keyType == "TEK") {
            $("#kfdOptions_tek").append(keyOption);
            $("#kfdOptions_macKey").append(keyOption);
        }
        else if (keyType == "KEK") {
            $("#kfdOptions_kek").append(keyOption);
        }
    });
    document.querySelector("#menu_manageKeys").click();
    document.querySelector("#sidebarMenu").classList.remove("show");
}

function PopulateGroups() {
    ClearGroupFilter()
    ClearGroupKeyFilter();
    $("#keyContainerGroupList").empty();
    $("#addMultipleGroupList").empty();
    _keyContainer.groups.forEach((group) => {
        let groupClass = "";
        if (group.Keys.length == 0) {
            groupClass = 'class="emptyGroup"';
        }
        //list-group-item-primary for selected
        let groupListItem = `
            <a class="list-group-item list-group-item-action ${group.Keys.length == 0 ? "emptyGroup":""}" data-container-group-id="${group.Id}" href="javascript:void(0)">
                <p class="mb-0">${group.Name}</p>
                <small class="text-muted">${group.Keys.length} keys</small>
            </a>`;
        $("#keyContainerGroupList").append(groupListItem);
        $("#addMultipleGroupList").append(groupListItem);
    });
}

function EditKeyInContainer(key) {
    for (let i=0;i<_keyContainer.keys.length;i++) {
        if (_keyContainer.keys[i].Id == key.Id) {
            _keyContainer.keys[i].Name = key.Name;
            _keyContainer.keys[i].KeyId = key.KeyId;
            _keyContainer.keys[i].Key = key.Key;
            break;
        }
    }
    ModifyKeyContainerHeader();
    PopulateKeys();
    PopulateGroups();
}

function AddKeyToContainer(key) {
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

    ModifyKeyContainerHeader();
    ClearKeyFilter();
    PopulateKeys();

/*
    let keyListItem = '<li data-container-key-id=' + key.Id + '><a href="#"><h2>' + key.Name + '</h2><p>' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + ', Keyset ' + (key.ActiveKeyset ? "Active" : key.KeysetId) + '</p></a></li>';
    $("#keyContainerKeyList").append(keyListItem);
    //let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><span data-container-key-id=' + key.Id + '>' + key.Name + '</span><br><span>' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + '</span></label>';
    //groupCheckbox += '<input type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
    let groupCheckbox = '<div data-checkbox-id=' + key.Id + '><label for="checkbox-' + key.Id + '"><span data-container-key-id=' + key.Id + '>' + key.Name + '</span><br><span class="keyCheckbox-small">' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + ', Keyset ' + (key.ActiveKeyset ? "Active" : key.KeysetId) + '</span></label>';
    groupCheckbox += '<input data-container-key-id=' + key.Id + ' type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
    $("#addGroupKeyList").append(groupCheckbox);
    $("#keyContainerKeyList").listview("refresh");
    $("[data-role=controlgroup]").enhanceWithin().controlgroup("refresh");
*/
}

function AddGroupToContainer(groupItem) {
    // Add key to _keyContainer as well as listviews and comboboxes
    groupItem.Id = _keyContainer.nextGroupNumber;
    _keyContainer.groups.push(groupItem);
    _keyContainer.nextGroupNumber++;

    ModifyKeyContainerHeader();
    PopulateGroups();
}

function ClearKeyFilter() {
    $("#filter-keys").val("");
}
function ClearGroupFilter() {
    $("#filter-groups").val("");
}
function ClearGroupKeyFilter() {
    $("#filter-container-groups").val("");
}

function DeleteKeyFromContainer(containerKeyId) {
    // Remove key from _keyContainer as well as listviews and comboboxes and key groups
    //console.log(containerKeyId);
    _keyContainer.keys = _keyContainer.keys.filter(function(obj) {
        return obj.Id !== containerKeyId;
    });
    //$("li[data-container-key-id='" + containerKeyId +"']").remove();
    //$("div[data-checkbox-id='" + containerKeyId +"']").remove();

    ModifyKeyContainerHeader();
    RemoveKeyFromAllGroups(containerKeyId);
    PopulateKeys();
    PopulateGroups();
}

function DeleteGroupFromContainer(containerGroupId) {
    // Remove group from _keyContainer as well as listviews
    _keyContainer.groups = _keyContainer.groups.filter(function(obj) {
        return obj.Id !== containerGroupId;
    });
    //$("li[data-container-group-id='" + containerGroupId +"']").remove();

    ModifyKeyContainerHeader();
    PopulateGroups();
}

function ResetKeyContainer() {
    // Clear all key items back to default
/*
    _keyContainer = {
        keys: [],
        nextKeyNumber: 1,
        groups: [],
        nextGroupNumber: 1,
        source: "Memory"
    };
*/
    _keyContainer.keys = [];
    _keyContainer.nextKeyNumber = 1;
    _keyContainer.groups = [];
    _keyContainer.nextGroupNumber = 1;
    _keyContainer.source = "Memory";
    $(".keyContainerFileName").text(_keyContainer.source);
    $("#keyContainerKeyList").empty();
    $("#addGroupKeyList").empty();
    $("#addMultipleKeyList").empty();
    $("#regenerateKeyList").empty();
    $("#regenerateGroupList").empty();
    $("#keyContainerGroupList").empty();
    $("#addMultipleGroupList").empty();
}

function AddKeyToGroup(containerKeyId, containerGroupId) {
    for (let i=0;i<_keyContainer.groups.length;i++) {
        if (_keyContainer.groups[i].Id == containerGroupId) {
            if (_keyContainer.groups[i].Keys.includes(containerKeyId)) {
                console.log("Key already exists in group");                
            }
            else {
                _keyContainer.groups[i].Keys.push(containerKeyId);
                console.log("Key added to group");
            }
            return;
        }
    }
    console.log("Group not found");
}

function RemoveKeyFromGroupDEPRECATED(key_id, group_id) {
    for (let i=0;i<_keyContainer.groups.length;i++) {
        if (_keyContainer.groups[i].Id == group_id) {
            _keyContainer.groups[i].Keys = _keyContainer.groups[i].Keys.filter(function(e) { return e !== key_id; });
            //console.log("Key removed from group");
            return;
        }
    }
    //console.log("Key not found in group");
}

function RemoveKeyFromAllGroups(containerKeyId) {
    let counter = 0;
    for (let i=0;i<_keyContainer.groups.length;i++) {
        if (_keyContainer.groups[i].Keys.includes(containerKeyId)) {
            counter++;
            _keyContainer.groups[i].Keys = _keyContainer.groups[i].Keys.filter(function(e) { return e !== containerKeyId; });
        }
    }
    //console.log("Key removed from " + counter + " groups");
}

function groupsThatContainKey(containerKeyId) {
    let groupNames = [];
    for (let i=0;i<_keyContainer.groups.length;i++) {
        if (_keyContainer.groups[i].Keys.includes(containerKeyId)) {
            groupNames.push(_keyContainer.groups[i].Name);
        }
    }
    return groupNames;
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
    if (inputType == newVal) return;
    inputType = newVal;
    if (newVal == "dec") {
        inputBase = 10;
        // Convert hexidecimal values to decimal
        document.querySelectorAll(".hexdec-input").forEach((i) => {
            let hexVal, decVal;
            if (i.value != "") {
                hexVal = i.value;
                decVal = parseInt(hexVal, 16);
            } else decVal = "";
            i.type = "number";
            i.maxLength = i.dataset.decPrecision;
            i.value = decVal.toString();
        });
        document.querySelectorAll(".hexdec-label").forEach((label) => {
            //let padlen = label.dataset.decpad;
            //let decVal = label.dataset.decimalValue;
            let padlen = label.dataset.decPrecision;
            //let hexVal = label.innerText;
            //let decVal = parseInt(hexVal, 16);
            let hexVal = label.innerText;
            label.innerText = parseInt(hexVal, 16).toString(10);//.padStart(padlen, "0");
        });
        document.querySelectorAll(".hexdec-li small").forEach((li) => {
            let sln, kid, ks;
            //let it = li.innerText;
            let pattern = /(.*), (.*), SLN (.*), KID (.*), Keyset (.*)/;
            let result = li.innerText.match(pattern);
            if (result) {
                sln = parseInt(result[3], 16);
                kid = parseInt(result[4], 16);
                //ks = result[3];
                result[5] == "Active" ? ks = "Active" : ks = parseInt(result[5], 16);
                //console.log(`${result[1]}, ${result[2]}, SLN ${sln}, KID ${kid}, Keyset ${ks}`);
                li.innerText = `${result[1]}, ${result[2]}, SLN ${sln}, KID ${kid}, Keyset ${ks}`;
            }
        });
        document.querySelectorAll(".hexdec-button-dec").forEach(i => i.checked = true);
        document.querySelectorAll(".hexdec-button-hex").forEach(i => i.checked = false);
    }
    else if (newVal = "hex") {
        inputBase = 16;
        // Convert decimal values to hexidecimal
        document.querySelectorAll(".hexdec-input").forEach((i) => {
            //if (i.value == "") return;
            let hexVal, decVal;
            if (i.value != "") {
                decVal = parseInt(i.value);
                hexVal = decVal.toString(16).toUpperCase();
            }
            else hexVal = "";
            i.type = "text";
            i.maxLength = i.dataset.hexPrecision;
            i.value = hexVal;
        });
        document.querySelectorAll(".hexdec-label").forEach((label) => {
            //console.log(label.innerText);
            //let padlen = label.dataset.hexpad;
            //let decVal = label.dataset.decimalValue;
            let padlen = label.dataset.hexPrecision;
            //let decVal = parseInt(label.innerText);
            let decVal = label.innerText;
            //let hexVal = decVal.toString(16).padStart(padlen, "0").toUpperCase();
            //label.innerText = hexVal;
            label.innerText = parseInt(decVal, 10).toString(16).padStart(padlen, "0").toUpperCase();
        });
        document.querySelectorAll(".hexdec-li small").forEach((li) => {
            let sln, kid, ks;
            //let it = li.innerText;
            let pattern = /(.*), (.*), SLN (.*), KID (.*), Keyset (.*)/;
            let result = li.innerText.match(pattern);
            if (result) {
                //sln = parseInt(result[3], 16);
                sln = parseInt(result[3]).toString(16).padStart(4, "0").toUpperCase();
                //kid = parseInt(result[4], 16);
                kid = parseInt(result[4]).toString(16).padStart(4, "0").toUpperCase();
                //ks = result[3];
                result[5] == "Active" ? ks = "Active" : ks = "0x" + parseInt(result[5]).toString(16).padStart(2, "0").toUpperCase();
                //console.log(`${result[1]}, ${result[2]}, SLN ${sln}, KID ${kid}, Keyset ${ks}`);
                li.innerText = `${result[1]}, ${result[2]}, SLN 0x${sln}, KID 0x${kid}, Keyset ${ks}`;
            }
        });
        document.querySelectorAll(".hexdec-button-dec").forEach(i => i.checked = false);
        document.querySelectorAll(".hexdec-button-hex").forEach(i => i.checked = true);
    }
}

function GenerateDliCli() {
    dliBridgeSettings.bridgePort = document.querySelector("#kfdOptions_dliBridgePort").value;
    dliBridgeSettings.keyloadingPort = document.querySelector("#kfdOptions_dliKeyloadingPort").value
    dliBridgeSettings.token = document.querySelector("#kfdOptions_dliBridgeToken").value;
    document.querySelector("#kfdOptions_dliBridgeCli").value = `node KFDweb_DLIbridge.js --bridgePort=${dliBridgeSettings.bridgePort} --keyloadingPort=${dliBridgeSettings.keyloadingPort} --token=${dliBridgeSettings.token}`;
}

function connectSocket() {
    //const url = ("https:" == document.location.protocol ? "wss://" : "ws:") + document.location.host + "/dliBridge/?token=" + dliBridgeSettings.token;
    //const url = `http://${document.location.host}:${dliBridgeSettings.bridgePort}/dliBridge/?token=${dliBridgeSettings.token}`;
    const url = `http://localhost:${dliBridgeSettings.bridgePort}/DLIbridge/?token=${dliBridgeSettings.token}`;

    if (bridgeConnection != null) {
        if (bridgeConnection.readyState == 1) return;
    }
    bridgeConnection = new WebSocket(url);
    bridgeConnection.binaryType = "arraybuffer";
    //console.log(bridgeConnection);

    bridgeConnection.onopen = function() {
        bridgeConnected = true;
        ShowDeviceConnected();
        var d = new Date();
        console.log("WebSocket connected at " + d.toLocaleString());
    }
    bridgeConnection.onerror = function(error) {
        console.error(error);
    }
    bridgeConnection.onmessage = function(msg) {
        //console.log(msg.data);
        if (msg.data == "welcome") {
            console.log("Connected to DLI bridge")
            return;
        }
        let ta = new Uint8Array(msg.data);
        let arr = Array.from(ta);
        dliFrameBuffer.push(arr);
        //console.log("bridgeConnection.onmessage", BCTS(ta).join("-"));
    }
    bridgeConnection.onclose = function(event) {
        bridgeConnected = false;
        ShowDeviceDisconnected();
        let d = new Date();
        if (event.wasClean) console.log("WebSocket closed at " + d.toLocaleString() + " for reason: " + event.reason);
        else console.error("WebSocket died at " + d.toLocaleString(), event);
    }
}
