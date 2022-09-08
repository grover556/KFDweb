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
        description = "This page is being hosted on a non-HTTPS server. Because of this, you are unable to communicate with the KFDtool or open or save key containers. Please ensure the page is hosted either on a HTTPS server or a localhost instance.";
    }
    $("#secureContextStatus").text(status);
    $("#secureContextDetails").text(description);
    $(".keyContainerFileName").text(_keyContainer.source);
    if (navigator.serial) {
        $("#connectionMethod").text("Web Serial API");
    }
    else {
        $("#connectionMethod").text("Web USB Polyfill");
    }
    DisableKfdButtons();
});
$("#downloadSampleEkc").on("click", function(e) {
    e.preventDefault();
    window.location.href = $(this).attr("href");
});
$("#buttonTestPopupStatus").on("click", function() {
    //$("#popupKeyloadStatus").popup("open");
    ShowLoading("key");
});
$("#buttonTestPopupResults").on("click", function() {
    $("#popupKeyloadResults").popup("open");
});
$("#buttonTestKeysetTagging").on("click", function() {
    $("#popupEditKeysetTagging").popup("open");
});


$("buttonCancelLoading").on("click", function() {
    //console.log($(this));
    //HideLoading();
});

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

$("#linkLicensingInformation").on("click", function() {
    $("#popupLicensingInformation").popup("open");
});
$("#buttonImportFile").on("click", function() {
    $("#popupImportEkc").popup("open");
});
$("#addEditRsiCancel").on("click", function() {
    $("#popupAddEditRsi").popup("close");
    ClearPopupAddEditRsi();
});
$("#addEditRsiConfirm").on("click", function() {
    // Validate the data, then close, clear and proceed
    // refer to page 60 on TIA OTAR, Change-RSI-Command permutations
    let isValid = $("#addEditRsi_rsiType").hasClass("invalid");
    let rsiType = $("#addEditRsi_typeOld").val();
    //let rsiAction = $("#addEditRsi_action").val();//add,remove,change
    let rsiOld = parseInt($("#addEditRsi_rsiOld").val());
    let rsiNew = parseInt($("#addEditRsi_rsi").val(), inputBase);
    let mnp = parseInt($("#addEditRsi_mnp").val(), inputBase);
/*
    if ((rsiNew == 9999999) || (rsiNew > 16777215)) {
        alert("Please fix invalid fields before submitting");
        return;
    }
*/
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
    $("#popupAddEditRsi").popup("close");
    ClearPopupAddEditRsi();
});
$("#buttonEditKeysetTaggingConfirm").on("click", function() {
    let keysetName = $("#editKeyset_name").val();
    let keysetActivationDatetime = $("#editKeyset_activeDatetime").val();




});
$("#buttonCancelEkc").on("click", function() {
    $("#popupImportEkc").popup("close");
    ClearEkcFields();
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
    ClearEkcFields();
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
    let keysetId_activate = parseInt(tr.data("keysetid"));
    let keyset_activate = keysetId_activate - 1;
    let cryptoGroup_activate  = keyset_activate >>> 4;
    
    //console.log("Looking for active keyset in crypto group " + cryptoGroup_activate);
    // Search all other active keysets, looking for the same crypto group
    $("#table_keysets tr[data-active='true']").each(function() {
        let ksid = parseInt($(this).attr("data-keysetid")) - 1;
        if ((ksid >>> 4) == cryptoGroup_activate) {
            keysetId_deactivate = ksid + 1;
            //console.log("deactivating keyset id " + keysetId_deactivate);
        }
    });

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
$("#table_rsiItems tbody").on("click", "a.rsi-change", function() {
    //console.log($(this).parent().parent()[0].dataset);
    // This should trigger mra.???
    let tr = $(this).parent().parent();
    let rsiOld = parseInt(tr.attr("data-rsiid"));
    let mnpOld = parseInt(tr.attr("data-messagenumber"));
    let rsiType = "Group";
    if (rsiOld < 9999999) {
        rsiType = "Individual";
    }
    $("#addEditRsi_typeOld").val(rsiType);
    $("#addEditRsi_action").val("change");
    $("#addEditRsi_rsiOld").val(rsiOld);
    $("#addEditRsi_rsi").val(rsiOld.toString(inputBase).toUpperCase());
    $("#addEditRsi_mnp").val(mnpOld.toString(inputBase).toUpperCase());
    $("#popupAddEditRsi").popup("open");
    $("#addEditRsi_rsi").focus();
});
$("#table_rsiItems tbody").on("click", "a.rsi-delete", function() {
    let tr = $(this).parent().parent();
    let rsiOld = parseInt(tr.attr("data-rsiid"));
    let rsiOldType = tr.attr("data-rsitype");
    if (rsiOldType == "Individual") {
        alert("Error: you cannot delete an individual RSI");
        return;
    }
    if (window.confirm("Warning: are you sure you want to delete " + rsiOldType + " RSI " + rsiOld + "?")) {
        ChangeRsiValues(rsiOldType, rsiOld, 0, 0);
    }
});
$("#table_kmfRsi tbody").on("click", "a.kmf-rsi-change", function() {
    //console.log($(this).parent().parent()[0].dataset);
    // This should trigger mra.LoadConfig(rsi, mn);
    let tr = $(this).parent().parent();
    let rsiOld = parseInt(tr.attr("data-rsiid"));
    let mnpOld = parseInt(tr.attr("data-messagenumber"));
console.log("rsiOld: " + rsiOld + ", mnpOld: " + mnpOld);
    $("#addEditRsi_typeOld").val("KMF");
    $("#addEditRsi_action").val("change");
    $("#addEditRsi_rsiOld").val(rsiOld);
    $("#addEditRsi_rsi").val(rsiOld.toString(inputBase).toUpperCase());
    $("#addEditRsi_mnp").val(mnpOld.toString(inputBase).toUpperCase());
    $("#popupAddEditRsi").popup("open");
    $("#addEditRsi_rsi").focus();
});
$(".menuItem").on("click", function() {
    var menuName = $(this).attr("id").replace("menu_", "");
    //console.log(menuName);
    $(".menu_divs").hide();
    $("#" + menuName).show();
    $("#panelMenu").panel("close");
    
    if (menuName == "manageKeys") {
        
    }
    else if (menuName == "manageGroups") {
        
    }
    else if (menuName == "loadKeyMultiple") {
        
    }
});
$("#buttonManageGroup_addGroup").on("click", function() {
    $(".menu_divs").hide();
    let nextContainerGroupId = _keyContainer.nextGroupNumber;
    $("#addGroup_id").val(nextContainerGroupId);
    $("#addGroup_name").val("");
    $("#originalGroup_name").val("");
    $("#groupAction").text("Add");
    $("#addGroupKeyList input:checkbox").prop("checked", false).checkboxradio("refresh");
    $("#addGroup").show();
});
$("#buttonManageKeyActions").on("click", function() {
    //DEPRECATED
    $("#popupMenuKeyOptions").popup("open");
});
$("#buttonLoadKeyToContainer").on("click", function() {
    let containerKeyItem = CreateKeyFromFields("container");
    
    if (containerKeyItem === undefined) {
        return;
    }
    
    // Check for identical Algorithm and Key ID combination
    let keys = _keyContainer.keys.filter(function(obj) { return obj.KeyId === containerKeyItem.KeyId; });
    for (var i=0; i<keys.length; i++) {
        if (keys[i].AlgorithmId == containerKeyItem.AlgorithmId) {
            alert("Error: Key ID " + containerKeyItem.KeyId + " with Algorithm " + LookupAlgorithmId(keyItem.AlgorithmId) + " already exists");
            return;
        }
    }

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
$("#buttonLoadKeyToRadio").on("click", function() {
    let keyItem = CreateKeyFromFields("radio");
    
    if (keyItem === undefined) {
        return;
    }

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
/*
    $("#addEditRsi_typeOld").val("");
    $("#addEditRsi_action").val("add");
    $("#addEditRsi_rsiOld").val("0");
    $("#popupAddEditRsi").popup("open");
    $("#addEditRsi_rsi").focus();
*/
    $("#addEditRsi_typeOld").val("Group");
    $("#addEditRsi_action").val("add");
    $("#addEditRsi_rsiOld").val(0);
    $("#addEditRsi_rsi").val("");
    $("#addEditRsi_mnp").val("");
    $("#popupAddEditRsi").popup("open");
    $("#addEditRsi_rsi").focus();
});
$("#buttonSaveGroupChanges").on("click", function() {
    let containerKeyIds = [];
    let containerGroupId = parseInt($("#addGroup_id").val());
    let containerGroupName = $("#addGroup_name").val();
    let containerGroupNameOriginal = $("#originalGroup_name").val();
    $("#addGroupKeyList input:checked").each(function() {
        containerKeyIds.push(parseInt($(this).attr("data-container-key-id")));
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
    PopulateGroups();
    // Go back to group page
    $("#addGroup").hide();
    $("#manageGroups").show();
});
$("#buttonCancelGroupChanges").on("click", function() {
    $("#addGroup").hide();
    $("#manageGroups").show();
});
$("#action_loadKeyToRadio").on("click", function() {
    let containerKeyId = parseInt($("#popupMenuKeyOptions_list ul").attr("data-container-key-id"));
    let containerKey = _keyContainer.keys.filter(function(obj) { return obj.Id === containerKeyId; });
    if (containerKey.length != 1) {
        alert("There was an error retrieving the key from the container");
        return;
    }
    SendKeysToRadio(containerKey, "multiple");
    $("#popupMenuKeyOptions_list ul").attr("data-container-key-id", "");
    $("#popupMenuKeyOptions").popup("close");
});
$("#action_loadGroupToRadio").on("click", function() {
    let containerGroupId = parseInt($("#popupMenuGroupOptions_list ul").attr("data-container-group-id"));
    let groupKeys = _keyContainer.groups.filter(function(obj) { return obj.Id === containerGroupId; });
    if (groupKeys.length != 1) {
        alert("There was an error retrieving the group from the container");
        return;
    }
    let containerKeys = _keyContainer.keys.filter(function(obj) { return groupKeys[0].Keys.includes(obj.Id); });
    SendKeysToRadio(containerKeys, "multiple");
    $("#popupMenuGroupOptions_list ul").attr("data-container-group-id", "");
    $("#popupMenuGroupOptions").popup("close");
});
$("#buttonLoadMultipleKeys").on("click", function() {
    let containerKeyIds = [];
    let containerGroupIds = [];
    let key_set = new Set();

    $("#addMultipleKeyList input:checked").each(function() {
        //console.log("key", $(this));
        containerKeyIds.push(parseInt($(this).attr("data-container-key-id")));
        key_set.add(parseInt($(this).attr("data-container-key-id")));
    });
    $("#addMultipleGroupList input:checked").each(function() {
        //console.log("group", $(this));
        containerGroupIds.push(parseInt($(this).attr("data-container-group-id")));
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
$("#action_deleteKeyFromContainer").on("click", function() {
    let containerKeyId = parseInt($("#popupMenuKeyOptions_list ul").attr("data-container-key-id"));
    //console.log("action_deleteKeyFromContainer", containerKeyId);
    DeleteKeyFromContainer(containerKeyId);
    $("#popupMenuKeyOptions_list ul").attr("data-container-key-id", "");
    $("#popupMenuKeyOptions").popup("close");
});
$("#action_editGroupContainer").on("click", function() {
    let containerGroupId = parseInt($("#popupMenuGroupOptions_list ul").attr("data-container-group-id"));
    let containerGroup = _keyContainer.groups.filter(function(obj) { return obj.Id === containerGroupId; });
    if (containerGroup.length != 1) {
        alert("There was an error retrieving the group from the container");
        return;
    }
    // Set all checkboxes to off, then loop through keys and set to true
    let containerGroupName = containerGroup[0].Name;
    $("#groupAction").text("Edit");
    $("#addGroup_name").val(containerGroupName);
    $("#originalGroup_name").val(containerGroupName);
    $("#addGroup_id").val(containerGroupId);
    $("#addGroupKeyList input:checkbox").prop("checked", false).checkboxradio("refresh");
    containerGroup[0].Keys.forEach((kid) => {
        $("#addGroupKeyList #checkbox-" + kid).prop("checked", true).checkboxradio("refresh");
    });
    $("#manageGroups").hide();
    $("#addGroup").show();
    $("#popupMenuGroupOptions_list ul").attr("data-container-group-id", "");
    $("#popupMenuGroupOptions").popup("close");
});
$("#action_deleteContainerGroup").on("click", function() {
    let containerGroupId = parseInt($("#popupMenuGroupOptions_list ul").attr("data-container-group-id"));
    DeleteGroupFromContainer(containerGroupId);
    $("#popupMenuGroupOptions_list ul").attr("data-container-group-id", "");
    $("#popupMenuGroupOptions").popup("close");
});

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
    if ($("input[name='radioKeyType']:checked").val() == "auto") auto = true;
    else if ($("input[name='radioKeyType']:checked").val() == "tek") tek = true;
    else if ($("input[name='radioKeyType']:checked").val() == "kek") kek = true;
    
    containerKeyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSlider").val() == "yes" ? true : false;
    if (containerKeyItem.ActiveKeyset) $("#loadKeySingle_keysetId").val("1");
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
    containerKeyItem.Name = $("#loadKeySingle_name").val();
    let matchingKeys = _keyContainer.keys.filter(function(obj) { return obj.Name === containerKeyItem.Name; });
    if (matchingKeys.length) {
        alert("Key name must be unique");
        return;
    }
    
    containerKeyItem.Id = _keyContainer.nextKeyNumber;
    containerKeyItem.KeysetId = parseInt($("#loadKeySingle_keysetId").val(), inputBase);
    //containerKeyItem.ActiveKeyset = $("#loadKeySingle_activeKeysetSlider").val() == "yes" ? true : false;
    containerKeyItem.Sln = parseInt($("#loadKeySingle_SlnCkr").val(), inputBase);
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

async function UpdateKeyloadStatus(keyResult) {
    let statusText = "Succeeded";
    let statusClass = "";
    if (keyResult.Status != 0) {
        statusText = OperationStatusExtensions.ToStatusString(keyResult.Status);
        statusClass = "keyError ";
    }
    // Get the key name by looking up the Key ID and Alg Id
    let keyName = keys.filter(function(obj) { return (obj.AlgorithmId === keyResult.AlgorithmId) && (obj.KeyId === keyResult.KeyId); });
    let temp = "<li><a class='" + statusClass + "ui-btn ui-btn-icon-left ui-icon-" + (keyResult.Status == 0 ? "check":"delete") + "'>" + keyName[0].Name + "</a></li>";
    $("#keyloadResultList").append(temp);
}

async function SendKeysToRadio(keys, keyloadProtocol) {
    // keys is an array of containerKeys
    console.log("SendKeysToRadio", keys);
    if (!connected) return;

    let cmdKeyItems = [];
    keys.forEach((k) => {
        let cmdKey = new CmdKeyItem(k.ActiveKeyset, k.KeysetId, k.Sln, k.KeyTypeKek, k.KeyId, k.AlgorithmId, k.Key);
        cmdKey.Name = k.Name;
        cmdKeyItems.push(cmdKey);
        /*
        let key = new KeyItem();
        key.SLN = k.Sln;
        key.KeyId = k.KeyId;
        key.Key = k.Key;
        key.KEK = k.KeyTypeKek;
        //cmdKeyItems.push(key);
        //console.log(key);
        //console.log(key.ToBytes());
        */
    });

    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);

    if (keyloadProtocol == "single") {
        // Load one key at a time and show results popup
        // Came from $("#buttonLoadMultipleKeys").on("click")

        // Initialize loading widget
        ShowLoading("key");
        DisableKfdButtons();
        $("#keyloadStatus .ui-slider-bg.ui-btn-active").css("width", "0%");
        $("#keyloadStatus_itemNumber").text("1");
        $("#keyloadStatus_itemTotal").text(cmdKeyItems.length);
        $("#keyloadResultList").empty();
/*
        try {
            results = await mra.Keyload_individual(cmdKeyItems);
        }
        catch (error) {

        }
*/

        for (var i=0; i<cmdKeyItems.length; i++) {
            let widthValue = Math.floor(i / cmdKeyItems.length).toString() + "%";
            $("#keyloadStatus .ui-slider-bg.ui-btn-active").css("width", widthValue);
            $("#keyloadStatus_itemName").text(cmdKeyItems[i].Name);
            let keyResult = await mra.Keyload_single(cmdKeyItems[i]);
            console.log(keyResult);
            if (keyResult !== undefined) {
                let statusText = "Succeeded";
                let statusClass = "";
                if (keyResult.Status != 0) {
                    statusText = OperationStatusExtensions.ToStatusString(keyResult.Status);
                    statusClass = " class='invalid'";
                }
                let temp = "<li><h4>" + cmdKeyItems[i].Name + "</h4>";
                temp += "<p" + statusClass + ">" + statusText + "</p></li>";
                console.log(temp);
                $("#keyloadResultList").append(temp);
                if (canceltransferFlag) { i = mdKeyItems.length; }
            }
        }


        HideLoading();
        EnableKfdButtons();
    }
    else if (keyloadProtocol == "multiple") {
        // Load all keys at once, with no status
        let results;
        try {
            ShowLoading();
            DisableKfdButtons();
            $("#keyloadResultList").empty();
            results = await mra.Keyload(cmdKeyItems);
            //results = await mra.Keyload_individual(cmdKeyItems);
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
            // Check each status to verify result[i].Status == 0
            results.forEach((keyResult) => {
                console.log(keyResult);
                let statusText = "Succeeded";
                let statusClass = "";
                if (keyResult.Status != 0) {
                    statusText = OperationStatusExtensions.ToStatusString(keyResult.Status);
                    //statusClass = " class='invalid'";
                    statusClass = "keyError ";
                }
                // Get the key name by looking up the Key ID and Alg Id
                let keyName = keys.filter(function(obj) { return (obj.AlgorithmId === keyResult.AlgorithmId) && (obj.KeyId === keyResult.KeyId); });
                let temp = "<li><h4>" + keyName[0].Name + "</h4>";
                temp += "<p" + statusClass + ">" + statusText + "</p></li>";
                //console.log(temp);
                //$("#keyloadResultList").append("<li><a href='#' class='ui-btn ui-btn-icon-left ui-icon-check'>PD 15</a></li>");
                temp = "<li><a class='" + statusClass + "ui-btn ui-btn-icon-left ui-icon-" + (keyResult.Status == 0 ? "check":"delete") + "'>" + keyName[0].Name + "</a></li>";
                $("#keyloadResultList").append(temp);
            });
        }
    }
    $("#addMultipleKeyList input:checked").prop("checked", false).checkboxradio("refresh");
    $("#addMultipleGroupList input:checked").prop("checked", false).checkboxradio("refresh");
    $("#keyloadResultList").listview("refresh");
    $("#popupKeyloadResults").popup("open");
}

async function SendKeyToRadio(key) {
    console.log("SendKeyToRadio", key);
    if (!connected) return;

    let ap = new AdapterProtocol();
    let mra = new ManualRekeyApplication(ap, false);
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
            let rsiTypeCode = "unk";
            if ((rsi.RSI > 0) && (rsi.RSI < 9999999)) {
                rsiType = "Individual";
            }
            else if ((rsi.RSI > 9999999) && (rsi.RSI < 16777216)) {
                rsiType = "Group";
            }
            //<tr data-keysetid="1" data-active="true"><th>Yes</th><th>1</th><th>SET 01</th><th>TEK</th><th>2022-08-01 07:00</th><th></th></tr>
            let row = '<tr data-rsiid="' + rsi.RSI + '" data-messagenumber="' + rsi.MN + '" data-rsitype="' + rsiType + '"><th>' + rsiType + '</th><th>' + rsi.RSI + "</th><th>" + rsi.MN + "</th><th><a class='rsi-change' href='#'>Change</a><a class='rsi-delete' href='#'>Delete</a></th></tr>";
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
        //alert("Radio has been zeroized");
        $("#table_keyinfo tbody").empty();
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
        //$("li[data-container-key-id='" + key_id +"']").remove();
        //let activateFlag = '<a class="keyset-activate" href="#">Activate</a>';
        //$("#table_keysets tbody tr[data-keysetid='" + result.KeysetIdActivated + "'] th.th-action-flag").innerText = "";
        //$("#table_keysets tbody tr[data-keysetid=''] th");

        $("#table_keysets tbody tr[data-keysetid=" + result.KeysetIdSuperseded + "] th.th-action-flag").append($("#table_keysets tbody tr[data-keysetid=" + result.KeysetIdActivated + "] th.th-action-flag a")[0]);
        $("#table_keysets tbody tr[data-keysetid='" + ksidSuperseded + "']").attr("data-active", false);
        $("#table_keysets tbody tr[data-keysetid='" + ksidSuperseded + "'] th").first().text("No");
        $("#table_keysets tbody tr[data-keysetid='" + ksidActivated + "']").attr("data-active", true);
        $("#table_keysets tbody tr[data-keysetid='" + ksidActivated + "'] th").first().text("Yes");
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
                //tr.attr("data-messagenumber")
                $("#table_kmfRsi tbody tr[data-rsiid='" + rsiOld + "'] th").first().next().text(rsiNew);
                $("#table_kmfRsi tbody tr[data-rsiid='" + rsiOld + "'] th").first().next().next().text(mnp);
                $("#table_kmfRsi tbody tr[data-rsiid='" + rsiOld + "']").attr("data-messagenumber", mnp);
                $("#table_kmfRsi tbody tr[data-rsiid='" + rsiOld + "']").attr("data-rsiid", rsiNew);
            }
            else if ((rsiType == "Individual") || (rsiType == "Group")) {
                // Add/remove/change the table rows
                if (rsiNew == 0) {
                    // Delete the RSI
                    $("#table_rsiItems tbody tr[data-rsiid='" + rsiOld + "']").remove();
                }
                else if (rsiOld == 0) {
                    // Add new RSI
                    let rowInfo = '<tr data-rsiid="' + result.RSI + '" data-messagenumber="' + mnp + '" data-rsitype="' + rsiType + '"><th>' + rsiType + '</th><th>' + result.RSI + "</th><th>" + mnp + "</th><th><a class='rsi-change' href='#'>Change</a><a class='rsi-delete' href='#'>Delete</a></th></tr>";
                    $("#table_rsiItems").append(rowInfo);
                    $("#table_rsiItems").table("refresh");
                }
                else {
                    // Change the RSI and MNP
                    $("#table_rsiItems tbody tr[data-rsiid='" + rsiOld + "'] th").first().next().text(rsiNew);
                    $("#table_rsiItems tbody tr[data-rsiid='" + rsiOld + "'] th").first().next().next().text(mnp);
                    $("#table_rsiItems tbody tr[data-rsiid='" + rsiOld + "']").attr("data-messagenumber", mnp);
                    $("#table_rsiItems tbody tr[data-rsiid='" + rsiOld + "']").attr("data-rsiid", rsiNew);
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
    $("#loadKeySingle_keysetDiv").hide();
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
    //console.log($(this).data("container-key-id"));
    //console.log($("#popupMenuKeyOptions_list ul").data("container-key-id"));
    let containerKeyId = $(this).attr("data-container-key-id");
    $("#popupMenuKeyOptions_list ul").attr("data-container-key-id", containerKeyId);
    $("#popupMenuKeyOptions").popup("open");
});
$("#keyContainerGroupList").on("click", "li", function() {
    //console.log($(this).data("container-group-id"));
    //console.log($("#popupMenuGroupOptions_list ul").data("container-group-id"));
    let containerGroupId = $(this).attr("data-container-group-id");
    //console.log(containerGroupId);
    $("#popupMenuGroupOptions_list ul").attr("data-container-group-id", containerGroupId);
    $("#popupMenuGroupOptions").popup("open");
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
        console.log(eleId);
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
    //console.log("hexdec-input keyup");
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
$("#loadKeySingle_SlnCkr").on("keyup", function() {
    //console.log("loadKeySingle_SlnCkr keyup");
    if ($("#loadKeySingle_SlnCkr").val() == "") {
        $("#cryptoGroupLabel").text("");
        $("#keyTypeLabel").text("");
    }
    let sln = parseInt($("#loadKeySingle_SlnCkr").val(), inputBase);
    let cg = sln >>> 12;
    //let keyNum = sln && 0x0FFF;

    if (cg < 0xF) {
        $("#cryptoGroupLabel").text(cg);
        $("#keyTypeLabel").text("TEK");
    }
    else if (cg == 0xF) {
        $("#cryptoGroupLabel").text(cg);
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
        $("#addEditRsi_HexDec").val("hex").slider("refresh");
    }
    else if ($("#loadKeySingle [aria-labelledby='loadKeySingle_HexDec-label']").attr("aria-valuenow") == "dec") {
        SwitchHexDec("dec");
        $("#addEditRsi_HexDec").val("dec").slider("refresh");
    }
});
$("#addEditRsi_HexDec").on("change", function() {
    ////addEditRsi_HexDec
    if ($("#popupAddEditRsi [aria-labelledby='addEditRsi_HexDec-label']").attr("aria-valuenow") == "hex") {
        SwitchHexDec("hex");
        $("#loadKeySingle_HexDec").val("hex").slider("refresh");
    }
    else if ($("#popupAddEditRsi [aria-labelledby='addEditRsi_HexDec-label']").attr("aria-valuenow") == "dec") {
        SwitchHexDec("dec");
        $("#loadKeySingle_HexDec").val("dec").slider("refresh");
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
    $("#loadKeySingle_keysetId").val("")
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

function ShowLoading(loadingType) {
    //https://stackoverflow.com/questions/6597388/jquery-mobile-disable-all-button-when-loading-overlay-is-showed
    //$("body").addClass("ui-disabled");
    let loadingOptionsCustom = {
        html: '<div id="keyloadStatus"><div class="ui-corner-all custom-corners"><div class="ui-bar ui-bar-a"><h3>Loading ***LOADINGTYPE***s</h3></div><div class="ui-body ui-body-a"><p>Loading ***LOADINGTYPE***: <span id="keyloadStatus_itemName">key 1</span></p><label for="slider-keyload-status" class="ui-hidden-accessible">Status:</label><input type="range" name="slider-keyload-status" id="slider-keyload-status" data-highlight="true" disabled="disabled" min="0" max="100" value="33"><p class="details left">0%</p><p class="details right">Loading ***LOADINGTYPE*** <span id="keyloadStatus_itemNumber">1</span> of <span id="keyloadStatus_itemTotal">3</span></p><button id="buttonCancelLoading" onclick="CancelTransfers()" class="ui-btn ui-corner-all ui-shadow ui-btn-icon-left ui-icon-delete">Cancel</button></div></div></div>',
        textVisible: false
    };
    let loadingParams = {
        text: "Processing...",
        textVisible: true
    }
    if (loadingType !== undefined) {
        if (loadingType == "connect") {
            loadingParams.text = "Initializing connection...";
        }
        else {
            loadingOptionsCustom.html = loadingOptionsCustom.html.replaceAll("***LOADINGTYPE***", loadingType);
            loadingParams = loadingOptionsCustom;
        }
    }

    $("#pageDiv").addClass("ui-disabled");
    //$.mobile.loading("show", { text: "Processing...", textVisible: true });
    $.mobile.loading("show", loadingParams).enhanceWithin();
    //$(".disableOnLoading").addClass("ui-disabled");
}
function HideLoading() {
    $.mobile.loading("hide");
    $("#pageDiv").removeClass("ui-disabled");
    //$(".disableOnLoading").removeClass("ui-disabled");
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
    
    if (navigator.serial) {
        // Use Web Serial API
        console.log("Web Serial API supported");
        $("#connectionMethod").text("Web Serial API");
        connectionMethod = "ws";
        const connection = await connectSerial();

        // Uncomment for readUntilClosed, comment for readWithTimeout
        if (transferMethod == "RUC") {
            const reading = readUntilClosed();
        }
        
        if (connected) {
            ShowDeviceConnected();
            if (serialModelId == "KFD-AVR") {
                ShowLoading("connect");
                await new Promise(resolve => setTimeout(resolve, 6000));
                HideLoading();
            }
            
            await ReadDeviceSettings();
        }
    }
    else {
        // Use Polyfill API
        console.log("Web Serial API not supported, switching to Polyfill");
        $("#connectionMethod").text("Web USB Polyfill");
        connectionMethod = "poly";
        const connection = await connectPolyfill();

        if (transferMethod == "RUC") {
            //const reading = readUntilClosed();
        }

        if (connected) {
            ShowDeviceConnected();
            await ReadDeviceSettings();
        }
    }
}

function ShowDeviceConnected() {
    $("#iconConnectionStatus").css("background-color", "#aaffaa");
    $("#buttonConnectKfd").prop("disabled", true);
    //$("#buttonDisconnectKfd").prop("disabled", false);
    //$(".button-kfd").attr("disabled", false);
    EnableKfdButtons();
    $("#connectionStatus").text("Connected");
}

function ShowDeviceDisconnected() {
    $("#iconConnectionStatus").css("background-color", "#ffaaaa");
    $("#buttonConnectKfd").prop("disabled", false);
    //$("#buttonDisconnectKfd").prop("disabled", true);
    //$(".button-kfd").attr("disabled", true);
    DisableKfdButtons();
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
    if (serialModelId == "KFD100") {

    }
    else if (serialModelId == "KFD-AVR") {
        
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
    ClearKeyFilter();
    ClearGroupKeyFilter();
    $("#keyContainerKeyList").empty();
    $("#addGroupKeyList").empty();
    $("#addMultipleKeyList").empty();
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
        let keyListItem = '<li data-container-key-id="' + key.Id + '"><a href="#"><h2>' + key.Name + '</h2><p>' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + ', Keyset ' + (key.ActiveKeyset ? "Active" : key.KeysetId) + '</p></a></li>';
        $("#keyContainerKeyList").append(keyListItem);
        
        let groupCheckbox = '<div data-checkbox-id="' + key.Id + '"><label for="checkbox-' + key.Id + '"><span data-container-key-id="' + key.Id + '">' + key.Name + '</span><br><span class="keyCheckbox-small">' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + ', Keyset ' + (key.ActiveKeyset ? "Active" : key.KeysetId) + '</span></label>';
        groupCheckbox += '<input data-container-key-id="' + key.Id + '" type="checkbox" name="checkbox-' + key.Id + '" id="checkbox-' + key.Id + '"></div>';
        //console.log(groupCheckbox);
        $("#addGroupKeyList").append(groupCheckbox);

        let keyCheckbox = '<div data-checkbox-id="' + key.Id + '"><label for="checkbox-multiple-key-' + key.Id + '"><span data-container-key-id="' + key.Id + '">' + key.Name + '</span><br><span class="keyCheckbox-small">' + LookupAlgorithmId(key.AlgorithmId) + ', ' + keyType + ', SLN ' + key.Sln + ', KID ' + key.KeyId + ', Keyset ' + (key.ActiveKeyset ? "Active" : key.KeysetId) + '</span></label>';
        keyCheckbox += '<input data-container-key-id="' + key.Id + '" type="checkbox" name="checkbox-multiple-key-' + key.Id + '" id="checkbox-multiple-key-' + key.Id + '"></div>';
        $("#addMultipleKeyList").append(keyCheckbox);
    });
    //$("#addGroupKeyList").append('</div>');
    $("#keyContainerKeyList").listview("refresh");
    $("[data-role=controlgroup]").enhanceWithin().controlgroup("refresh");
    $(".menu_divs").hide();
    $("#manageKeys").show();
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
        let groupListItem = '<li data-container-group-id="' + group.Id + '"><a href="#"><h2 ' + groupClass + '>' + group.Name + '</h2><p>' + group.Keys.length + ' keys</p></a></li>';
        $("#keyContainerGroupList").append(groupListItem);

        let groupCheckbox = '<div data-checkbox-id="' + group.Id + '"><label for="checkbox-multiple-group-' + group.Id + '"><span data-container-group-id="' + group.Id + '">' + group.Name + '</span><br><span class="keyCheckbox-small">' + group.Keys.length + ' keys</span></label>';
        groupCheckbox += '<input data-container-group-id="' + group.Id + '" type="checkbox" name="checkbox-multiple-group-' + group.Id + '" id="checkbox-multiple-group-' + group.Id + '"></div>';
        $("#addMultipleGroupList").append(groupCheckbox);
    });
    $("#keyContainerGroupList").listview("refresh");
    $("[data-role=controlgroup]").enhanceWithin().controlgroup("refresh");
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

    PopulateGroups();
}

function ClearKeyFilter() {
    $("#manageKeys .ui-input-search input").val("");
    $("#manageKeys .ui-input-search a").addClass("ui-input-clear-hidden");
}
function ClearGroupFilter() {
    $("#manageGroups .ui-input-search input").val("");
    $("#manageGroups .ui-input-search a").addClass("ui-input-clear-hidden");
}
function ClearGroupKeyFilter() {
    $("#addGroup .ui-input-search input").val("");
    $("#addGroup .ui-input-search a").addClass("ui-input-clear-hidden");
}

function DeleteKeyFromContainer(containerKeyId) {
    // Remove key from _keyContainer as well as listviews and comboboxes and key groups
    //console.log(containerKeyId);
    _keyContainer.keys = _keyContainer.keys.filter(function(obj) {
        return obj.Id !== containerKeyId;
    });
    //$("li[data-container-key-id='" + containerKeyId +"']").remove();
    //$("div[data-checkbox-id='" + containerKeyId +"']").remove();
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
    PopulateGroups();
}

function ResetKeyContainer() {
    // Clear all key items back to default
    _keyContainer = {
        keys: [],
        nextKeyNumber: 1,
        groups: [],
        nextGroupNumber: 1,
        source: "Memory"
    };
    $(".keyContainerFileName").text(_keyContainer.source);
    $("#keyContainerKeyList").empty();
    $("#addGroupKeyList").empty();
    $("#addMultipleKeyList").empty();
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


