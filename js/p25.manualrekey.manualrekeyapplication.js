//ManualRekeyApplication

const { endianness } = require("os");

class ManualRekeyApplication {
    WithPreamble;
    Mfid;
    DeviceProtocol;
    ManualRekeyApplication(udpProtocol, motVariant) {

    }
    Begin() {
        this.DeviceProtocol.SendKeySignature();
        this.DeviceProtocol.InitSession();
    }
    TxRxKmm(commandKmmBody) {
        let commandKmmFrame = new KmmFrame(commandKmmBody);

        let toRadio = WithPreamble ? commandKmmFrame.ToBytesWithPreamble(Mfid) : commandKmmFrame.ToBytes();

        let fromRadio = DeviceProtocol.PerformKmmTransfer(toRadio);

        let responseKmmFrame = new KmmFrame(WithPreamble, fromRadio);

        return responseKmmFrame.KmmBody;
    }
    End() {
        this.DeviceProtocol.EndSession();
    }
    Keyload(keyItems) {
        let keyGroups = KeyPartitioner.PartitionKeys(keyItems);

        this.Begin();

        try {
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();

            let rspKmmBody1 = TxRxKmm(cmdKmmBody1);

            let activeKeysetId = 0;

            if (rspKmmBody1 == InventoryResponseListActiveKsetIds) {
                let kmm = (InventoryResponseListActiveKsetIds)(rspKmmBody1);

                for (var i=0; i<KmmBody.KsetIds.length; i++) {
                    console.log("* keyset id index " + i + " *");
                    console.log("keyset id:  " + KmmBody.KsetIds[i]);
                }

                // TODO support more than one crypto group
                if (KmmBody.KsetIds.length > 0) {
                    activeKeysetId = kmm.KsetIds[0];
                }
                else {
                    activeKeysetId = 1; // to match KVL3000+ R3.53.03 behavior
                }
            }
            else if (rspKmmBody1 == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);

                var statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                var statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }

            keyGroups.forEach(keyGroup => {
                let modifyKeyCommand = new ModifyKeyCommand();

                // TODO support more than one crypto group
                if (keyGroup[0].UseActiveKeyset && !keyGroup[0].IsKek) {
                    modifyKeyCommand.KeysetId = activeKeysetId;
                }
                else if (keyGroup[0].UseActiveKeyset && keyGroup[0].IsKek) {
                    modifyKeyCommand.KeysetId = 0xFF; // to match KFL3000+ R3.53.03 behavior
                }
                else {
                    modifyKeyCommand.KeysetId = keyGroup[0].KeysetId;
                }

                modifyKeyCommand.AlgorithmId = keyGroup[0].AlgorithmId;

                keyGroup.forEach(key => {
                    console.log(key.toString());

                    let keyItem = new KeyItem();
                    keyItem.SLN = key.Sln;
                    keyItem.KeyId = key.KeyId;
                    keyItem.Key = key.Key;
                    keyItem.KEK = key.IsKek;
                    keyItem.Erase = false;

                    modifyKeyCommand.keyItems.push(keyItem);
                });

                let rspKmmBody2 = TxRxKmm(modifyKeyCommand);

                if (rspKmmBody2 == RekeyAcknowledgment) {
                    let kmm = (RekeyAcknowledgment)(rspKmmBody2);

                    console.log("number of key status: " + kmm.Keys.length);

                    for (var i=0; i<kmm.Keys.length; i++) {
                        let status = kmm.Keys[i];

                        console.log("* key status index " + i + " *");
                        console.log("algorithm id: " + status.AlgorithmId);
                        console.log("key id: " + status.KeyId);
                        console.log("status: " + status.Status);

                        if (status.Status != 0) {
                            let statusDescr = OperationStatusExtensions.ToStatusString(status.Status);
                            let statusReason = OperationStatusExtensions.ToReasonString(status.Status);
                            throw "received unexpected key status" + "algorithm id: " + status.AlgorithmId + "key id: " + status.KeyId + "status: " + status.Status + "status description: " + statusDescr + "status reason: " + statusReason;
                        }
                    }
                }
                else if (rspKmmBody2 == NegativeAcknowledgment) {
                    let kmm = (NegativeAcknowledgment)(rspKmmBody2);

                    let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                    let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                    throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
                }
                else {
                    throw "received uxexpected kmm";
                }
            });
        }
        catch {
            this.End();
            throw "";
        }
        this.End();
    }
    EraseKeys(keyItems) {
        let keyGroups = KeyPartitioner.PartitionKeys(keyItems);

        this.Begin();

        try {
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();

            let rspKmmBody1 = TxRxKmm(cmdKmmBody1);

            let activeKeysetId = 0;

            if (rspKmmBody1 == InventoryResponseListActiveKsetIds) {
                let kmm = (InventoryResponseListActiveKsetIds)(rspKmmBody1);

                console.log("number of active keyset ids: " + kmm.KsetIds.length);

                for (var i=0; i<kmm.KsetIds.length; i++) {
                    console.log("* keyset id index " + i + " *");
                    console.log("keyset id: " + kmm.KsetIds[i]);
                }

                // TODO support more than one crypto group
                if (kmm.KsetIds.length > 0) {
                    activeKeysetId = kmm.KsetIds[0];
                }
                else {
                    activeKeysetId = 1; // to match KVL3000+ R3.53.03 behavior
                }
            }
            else if (rspKmmBody1 == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);

                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }

            keyGroups.forEach(keyGroup => {
                let modifyKeyCommand = new ModifyKeyCommand();

                // TODO support more than one crypto group
                if (keyGroup[0].UseActiveKeyset && !keyGroup[0].IsKek) {
                    modifyKeyCommand.KeysetId = activeKeysetId;
                }
                else if (keyGroup[0].UseActiveKeyset && keyGroup[0].IsKek) {
                    modifyKeyCommand.KeysetId = 0xFF; // to match KVL3000+ R3.53.03 behavior
                }
                else {
                    modifyKeyCommand.KeysetId = keyGroup[0].KeysetId;
                }

                modifyKeyCommand.AlgorithmId = 0x81; // to match KVL3000+ R3.53.03 behavior

                keyGroup.forEach(key => {
                    console.log(key.toString());

                    let keyItem = new KeyItem();
                    keyItem.SLN = key.Sln;
                    keyItem.KeyId = 65535; // to match KVL3000+ R3.53.03 behavior
                    keyItem.Key = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]; // to match KVL3000+ R3.53.03 behavior
                    keyItem.KEK = key.IsKek;
                    keyItem.Erase = true;

                    modifyKeyCommand.KeyItems.push(keyItem);
                });

                let rspKmmBody2 = TxRxKmm(modifyKeyCommand);

                if (rspKmmBody2 == RekeyAcknowledgment) {
                    let kmm = (RekeyAcknowledgment)(rspKmmBody2);

                    console.log("number of key status: " + kmm.Keys.length);

                    for (var i=0; i<kmm.Keys.length; i++) {
                        let status = kmm.Keys[i];

                        console.log("* key status index " + i + " *");
                        console.log("algorithm id: " + status.AlgorithmId);
                        console.log("key id: " + status.KeyId);
                        console.log("status: " + status.Status);

                        if (status.Status != 0) {
                            let statusDescr = OperationStatusExtensions.ToStatusString(status.Status);
                            let statusReason = OperationStatusExtensions.ToReasonString(status.Status);
                            throw "received unexpected key status" + "algorithm id: " + status.AlgorithmId + "key id: " + status.KeyId + "status: " + status.Status + "status description: " + statusDescr + "status reason: " + statusReason;
                        }
                    }
                }
                else if (rspKmmBody1 == NegativeAcknowledgment) {
                    let kmm = (NegativeAcknowledgment)(rspKmmBody1);
    
                    let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                    let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                    throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
                }
                else {
                    throw "received unexpected kmm";
                }
            });
        }
        catch {
            this.End();

            throw "";
        }

        this.End();
    }
    EraseAllKeys() {
        this.Begin();

        try {
            let commandKmmBody = new ZeroizeCommand();

            let responseKmmBody = TxRxKmm(commandKmmBody);

            if (responseKmmBody == ZeroizeResponse) {
                console.log("zeroized");
            }
            else if (responseKmmBody == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();
    }
    ViewKeyInfo() {
        let result = [];

        this.Begin();

        try {
            let more = true;
            let marker = 0;

            while(more) {
                let commandKmmBody = new InventoryCommandListActiveKsetIds();
                commandKmmBody.InventoryMarker = marker;
                commandKmmBody.MaxKeysRequested = 78;

                let responseKmmBody = TxRxKmm(commandKmmBody);

                if (responseKmmBody == InventoryResponseListActiveKeys) {
                    let kmm = (InventoryResponseListActiveKeys)(responseKmmBody);

                    marker = kmm.InventoryMarker;

                    console.log("inventory marker: " + marker);

                    if (marker == 0) {
                        more = false;
                    }

                    console.log("number of keys returned: " + kmm.Keys.length);

                    for (var i=0; i<kmm.Keys.Count; i++) {
                        let info = kmm.Keys[i];

                        console.log("* key status index " + i + " *");
                        console.log("keyset id: " + info.KeySetId);
                        console.log("sln: " + info.SLN);
                        console.log("algorithm id: " + info.AlgorithmId);
                        console.log("key id: " + info.KeyId);
                        
                        let res = new RspKeyInfo();

                        res.KeysetId = info.KeySetId;
                        res.Sln = info.SLN;
                        res.AlgorithmId = info.AlgorithmId;
                        res.KeyId = info.KeyId;

                        result.push(res);
                    }
                }
                else if (responseKmmBody == NegativeAcknowledgment) {
                    let kmm = (NegativeAcknowledgment)(rspKmmBody1);
        
                    let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                    let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                    throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
                }
                else {
                    throw "unexpected kmm";
                }
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();

        return result;
    }
    ViewKmfRsi() {
        let result = 0;

        this.Begin();

        try {
            let commandKmmBody = new InventoryCommandListKmfRsi();

            let responseKmmBody = TxRxKmm(commandKmmBody);

            if (responseKmmBody == InventoryResponseListKmfRsi) {
                console.log("MNP response");

                let kmm = (InventoryREsponseListKmfRsi)(responseKmmBody);

                result = kmm.KmfRsi;
            }
            else if (responseKmmBody == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();

        return result;
    }
    ViewMnp() {
        let result = 0;

        this.Begin();

        try {
            let commandKmmBody = new InventoryCommandListMnp();

            let responseKmmBody = TxRxKmm(commandBody);

            if (responseKmmBody == InventoryResponseListMnp) {
                console.log("MNP response");

                let kmm = (InventoryResponseListMnp)(responseKmmBody);

                result = kmm.MessageNumberPeriod;
            }
            else if (responseKmmBody == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
        }
        catch {
            this.End();

            throw "";

            return result;
        }

        this.End();
    }
    LoadConfig(kmfRsi, mnp) {
        let result = new RspRsiInfo();
        
        this.Begin();

        try {
            let cmdKmmBody = new LoadConfigCommand();
            cmdKmmBody.KmfRsi = kmfRsi;
            cmdKmmBody.MessageNumberPeriod = mnp;
            let rspKmmBody = TxRxKmm(cmdKmmBody);
            if (rspKmmBody == LoadConfigResponse) {
                let kmm = (LoadConfigResponse)(rspKmmBody);
                result.RSI = kmm.RSI;
                result.MN = kmm.MN;
                result.Status = kmm.Status;
            }
            else if (responseKmmBody == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();

        return result;
    }
    ChangeRsi(rsiOld, rsiNew, mnp) {
        let result = new RspRsiInfo();

        this.Begin();

        try {
            let cmdKmmBody = new ChangeRsiCommand();
            cmdKmmBody.RsiOld = rsiOld;
            cmdKmmBody.RsiNew = rsiNew;
            cmdKmmBody.MessageNumber = mnp;

            let rspKmmBody = TxRxKmm(cmdKmmBody);

            if (rpsKmmBody == ChangeRsiRepsonse) {
                let kmm = (ChangeRsiRepsonse)(rspKmmBody);
                result.RSI = rsiNew;
                result.MN = mnp;
                result.Status = kmm.Status;
            }
            else if (responseKmmBody == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();

        return result;
    }
    ViewRsiItems() {
        let result = [];

        this.Begin();

        try {
            let more = true;
            let marker = 0;

            while(more) {
                let commandKmmBody = new InventoryCommandListRsiItems();

                let responseKmmBody = TxRxKmm(commandKmmBody);

                if (responseKmmBody == InventoryResponseListRsiItems) {
                    let kmm = (InventoryResponseListRsiItems)(responseKmmBody);

                    console.log("inventory marker: " + marker);

                    if (marker == 0) {
                        more = false;
                    }

                    console.log("number of RSIs returned: " + kmm.RsiItems.length);

                    for (var i=0; i<kmm.RsiItems.length; i++) {
                        let item = kmmRsiItems[i];

                        console.log("* rsi index " + i);
                        console.log("rsi id: " + item.RSI);
                        console.log("mn: " + item.MessageNumber);

                        let res = new RspRsiInfo();

                        res.RSI = item.RSI;
                        res.MN = item.MessageNumber;

                        result.push(res);
                    }
                }
                else if (responseKmmBody == NegativeAcknowledgment) {
                    let kmm = (NegativeAcknowledgment)(rspKmmBody1);
        
                    let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                    let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                    throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
                }
                else {
                    throw "unexpected kmm";
                }
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();

        return result;
    }
    ViewKeysetTaggingInfo() {
        let result = [];

        this.Begin();

        try {
            let commandKmmBody = new InventoryCommandListKeysetTaggingInfo();

            let responseKmmBody = TxRxKmm(commandKmmBody);

            if (responseKmmBody == InventoryResponseListKeysetTaggingInfo) {
                console.log("KeysetTaggingInfo response");

                let kmm = (InventoryCommandListKeysetTaggingInfo)(responseKmmBody);

                for (var i=0; i<kmm.KeysetItems.length; i++) {
                    let item = kmm.KeysetItems[i];

                    let res = new RspKeysetInfo();

                    res.KeysetId = item.KeysetId;
                    res.KeysetName = item.KeysetName;
                    res.KeysetType = item.KeysetType;
                    res.ActivationDateTime = item.ActivationDateTime;
                    res.ReservedField = item.ReservedField;

                    result.push(res);
                }
            }
            else if (responseKmmBody == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();

        return result;
    }
    ActivateKeyset(keysetSuperseded, keysetActivated) {
        let result = new RspChangeoverInvo();

        this.Begin();

        try {
            let cmdKmmBody = new ChangeoverCommand();
            cmdKmmBody.KeysetIdSuperseded = keysetSuperseded;
            cmdKmmBody.KeysetIdActivated = keysetActivated;
            let rspKmmBody = TxRxKmm(cmdKmmBody);

            if (rspKmmBody == ChangeoverResponse) {
                let kmm = (ChangeoverResponse)(rspKmmBody);

                result.KeysetIdSuperseded = kmm.KeysetIdSuperseded;
                result.KeysetIdActivated = kmm.KeysetIdActivated;
            }
            else if (responseKmmBody == NegativeAcknowledgment) {
                let kmm = (NegativeAcknowledgment)(rspKmmBody1);
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();

        return result;
    }
    LoadAuthenticationKey() {
        throw "NotImplementedException";
    }
    DeleteAuthenticationKey() {
        throw "NotImplementedException";
    }
    ViewSuidInfo() {
        throw "NotImplementedException";
    }
    ViewActiveSuidInfo() {
        throw "NotImplementedException";
    }
}