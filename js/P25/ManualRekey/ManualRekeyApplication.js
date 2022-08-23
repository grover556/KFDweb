//ManualRekeyApplication

class ManualRekeyApplication {
    WithPreamble;
    Mfid;
    DeviceProtocol;
    constructor(protocol, motVariant) {
        if (protocol instanceof AdapterProtocol) {
            this.WithPreamble = false;
            this.Mfid = 0x00;
            this.DeviceProtocol = new ThreeWireProtocol();
        }
        
        /*
        else if (protocol instanceof UdpProtocol) {
            this.WithPreamble = true;
            this.Mfid = motVariant ? 0x90:0x00;
            console.error("DLI not implemented");
        }
        */
    }
    async Begin() {
        await this.DeviceProtocol.SendKeySignature();
        console.log("SendKeySignature DONE");
        await this.DeviceProtocol.InitSession();
        console.log("InitSession DONE");
    }
    async TxRxKmm(commandKmmBody) {
        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.log("MRA.TxRxKmm commandKmmFrame", commandKmmFrame);
        let toRadio = this.WithPreamble ? commandKmmFrame.ToBytesWithPreamble(this.Mfid) : commandKmmFrame.ToBytes();
        console.log("MRA.TxRxKmm toRadio", BCTS(toRadio).join("-"));
        let fromRadio = await this.DeviceProtocol.PerformKmmTransfer(toRadio);
        console.log("MRA.TxRxKmm fromRadio", BCTS(fromRadio).join("-"));
        let responseKmmFrame = new KmmFrame(this.WithPreamble, fromRadio);
        console.log("MRA.TxRxKmm responseKmmFrame", responseKmmFrame);
        return responseKmmFrame.KmmBody;
    }
    async End() {
        console.log("END");
        await this.DeviceProtocol.EndSession();
        //console.log("End() complete");
    }
    async TestMessage() {
        await this.Begin();
        
        try {
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();
            console.log(cmdKmmBody1);
            let rspKmmBody1 = await this.TxRxKmm(cmdKmmBody1);
            console.log("rspKmmBody1", rspKmmBody1);
            let activeKeysetId = 0;

            if (rspKmmBody1 instanceof InventoryResponseListActiveKsetIds) {
                //let kmm = (InventoryResponseListActiveKsetIds)(rspKmmBody1);
                let kmm = rspKmmBody1;
                console.log(kmm);
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
            else if (rspKmmBody1 instanceof NegativeAcknowledgment) {
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
            await this.End();
            throw "";
        }
        await this.End();
    }
    async Keyload(keyItems) {
        let partitioner = new KeyPartitioner();
        let keyGroups = partitioner.PartitionKeys(keyItems);
        //console.log(keyGroups);
        keyGroups = [keyItems];
        console.log(keyGroups);
        await this.Begin();

        try {
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();

            let rspKmmBody1 = await this.TxRxKmm(cmdKmmBody1);

            let activeKeysetId = 0;

            if (rspKmmBody1 instanceof InventoryResponseListActiveKsetIds) {
                //let kmm = (InventoryResponseListActiveKsetIds)(rspKmmBody1);
                let kmm = rspKmmBody1;

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
            else if (rspKmmBody1 instanceof NegativeAcknowledgment) {
                //let kmm = (NegativeAcknowledgment)(rspKmmBody1);
                let kmm = rspKmmBody1;

                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
            
            for (var i=0;i<keyGroups.length;i++) {
                console.log(keyGroups[i]);
                let modifyKeyCommand = new ModifyKeyCommand();
                
                // TODO support more than one crypto group
                if (keyGroups[i][0].UseActiveKeyset && !keyGroups[i][0].IsKek) {
                    modifyKeyCommand.KeysetId = activeKeysetId;
                }
                else if (keyGroups[i][0].UseActiveKeyset && keyGroups[i][0].IsKek) {
                    modifyKeyCommand.KeysetId = 0xFF; // to match KFL3000+ R3.53.03 behavior
                }
                else {
                    modifyKeyCommand.KeysetId = keyGroups[i][0].KeysetId;
                }

                modifyKeyCommand.AlgorithmId = keyGroups[i][0].AlgorithmId;
                console.log(modifyKeyCommand);
/*
                keyGroups.forEach((key) => {
                    let keyItem = new KeyItem();
                    keyItem.SLN = key.Sln;
                    keyItem.KeyId = key.KeyId;
                    keyItem.Key = key.Key;
                    keyItem.KEK = key.IsKek;
                    keyItem.Erase = false;
                    console.log(keyItem);
                    modifyKeyCommand.KeyItems.push(keyItem);
                });
*/
                for (var j=0; j<keyGroups[i].length; j++) {
                    let keyItem = new KeyItem();
                    keyItem.SLN = keyGroups[i][j].Sln;
                    keyItem.KeyId = keyGroups[i][j].KeyId;
                    keyItem.Key = keyGroups[i][j].Key;
                    keyItem.KEK = keyGroups[i][j].IsKek;
                    keyItem.Erase = false;
                    console.log(keyItem);
                    modifyKeyCommand.KeyItems.push(keyItem);
                }

                console.log(modifyKeyCommand);
                let rspKmmBody2 = await this.TxRxKmm(modifyKeyCommand);

                if (rspKmmBody2 instanceof RekeyAcknowledgment) {
                    //let kmm = (RekeyAcknowledgment)(rspKmmBody2);
                    let kmm = rspKmmBody2;

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
                else if (rspKmmBody2 instanceof NegativeAcknowledgment) {
                    //let kmm = (NegativeAcknowledgment)(rspKmmBody2);
                    let kmm = rspKmmBody2;

                    let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                    let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                    throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
                }
                else {
                    throw "received uxexpected kmm";
                }
            }
        }
        catch {
            this.End();
            throw "";
        }
        this.End();
    }
    async EraseKeys(keyItems) {
        let keyGroups = KeyPartitioner.PartitionKeys(keyItems);

        this.Begin();

        try {
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();

            let rspKmmBody1 = this.TxRxKmm(cmdKmmBody1);

            let activeKeysetId = 0;

            if (rspKmmBody1 instanceof InventoryResponseListActiveKsetIds) {
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

            for (var i=0; i< keyGroups.length; i++) {
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

                for (var j=0; j< keyGroups[i].length; j++) {
                    console.log(key.toString());

                    let keyItem = new KeyItem();
                    keyItem.SLN = keyGroups[i][j].Sln;
                    keyItem.KeyId = 65535; // to match KVL3000+ R3.53.03 behavior
                    keyItem.Key = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]; // to match KVL3000+ R3.53.03 behavior
                    keyItem.KEK = keyGroups[i][j].IsKek;
                    keyItem.Erase = true;

                    modifyKeyCommand.KeyItems.push(keyItem);
                }
                let rspKmmBody2 = this.TxRxKmm(modifyKeyCommand);

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
            }
        }
        catch {
            this.End();

            throw "";
        }

        this.End();
    }
    async EraseAllKeys() {
        this.Begin();

        try {
            let commandKmmBody = new ZeroizeCommand();

            let responseKmmBody = this.TxRxKmm(commandKmmBody);

            if (responseKmmBody instanceof ZeroizeResponse) {
                console.log("zeroized");
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async ViewKeyInfo() {
        let result = [];

        this.Begin();

        try {
            let more = true;
            let marker = 0;

            while(more) {
                let commandKmmBody = new InventoryCommandListActiveKsetIds();
                commandKmmBody.InventoryMarker = marker;
                commandKmmBody.MaxKeysRequested = 78;

                let responseKmmBody = this.TxRxKmm(commandKmmBody);

                if (responseKmmBody instanceof InventoryResponseListActiveKeys) {
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
                else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async ViewKmfRsi() {
        let result = [];

        this.Begin();

        try {
            let commandKmmBody = new InventoryCommandListKmfRsi();

            let responseKmmBody = this.TxRxKmm(commandKmmBody);

            if (responseKmmBody instanceof InventoryResponseListKmfRsi) {
                console.log("MNP response");

                let kmm = (InventoryREsponseListKmfRsi)(responseKmmBody);

                result = kmm.KmfRsi;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async ViewMnp() {
        let result = [];

        this.Begin();

        try {
            let commandKmmBody = new InventoryCommandListMnp();

            let responseKmmBody = this.TxRxKmm(commandBody);

            if (responseKmmBody instanceof InventoryResponseListMnp) {
                console.log("MNP response");

                let kmm = (InventoryResponseListMnp)(responseKmmBody);

                result = kmm.MessageNumberPeriod;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async LoadConfig(kmfRsi, mnp) {
        let result = new RspRsiInfo();
        
        this.Begin();

        try {
            let cmdKmmBody = new LoadConfigCommand();
            cmdKmmBody.KmfRsi = kmfRsi;
            cmdKmmBody.MessageNumberPeriod = mnp;
            let rspKmmBody = this.TxRxKmm(cmdKmmBody);
            if (rspKmmBody instanceof LoadConfigResponse) {
                let kmm = (LoadConfigResponse)(rspKmmBody);
                result.RSI = kmm.RSI;
                result.MN = kmm.MN;
                result.Status = kmm.Status;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async ChangeRsi(rsiOld, rsiNew, mnp) {
        let result = new RspRsiInfo();

        this.Begin();

        try {
            let cmdKmmBody = new ChangeRsiCommand();
            cmdKmmBody.RsiOld = rsiOld;
            cmdKmmBody.RsiNew = rsiNew;
            cmdKmmBody.MessageNumber = mnp;

            let rspKmmBody = this.TxRxKmm(cmdKmmBody);

            if (rpsKmmBody instanceof ChangeRsiRepsonse) {
                let kmm = (ChangeRsiRepsonse)(rspKmmBody);
                result.RSI = rsiNew;
                result.MN = mnp;
                result.Status = kmm.Status;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async ViewRsiItems() {
        let result = [];

        this.Begin();

        try {
            let more = true;
            let marker = 0;

            while(more) {
                let commandKmmBody = new InventoryCommandListRsiItems();

                let responseKmmBody = this.TxRxKmm(commandKmmBody);

                if (responseKmmBody instanceof InventoryResponseListRsiItems) {
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

                        res.RSI = parseInt(item.RSI);
                        res.MN = item.MessageNumber;

                        result.push(res);
                    }
                }
                else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async ViewKeysetTaggingInfo() {
        let result = [];

        this.Begin();

        try {
            let commandKmmBody = new InventoryCommandListKeysetTaggingInfo();

            let responseKmmBody = this.TxRxKmm(commandKmmBody);

            if (responseKmmBody instanceof InventoryResponseListKeysetTaggingInfo) {
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
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async ActivateKeyset(keysetSuperseded, keysetActivated) {
        let result = new RspChangeoverInvo();

        this.Begin();

        try {
            let cmdKmmBody = new ChangeoverCommand();
            cmdKmmBody.KeysetIdSuperseded = keysetSuperseded;
            cmdKmmBody.KeysetIdActivated = keysetActivated;
            let rspKmmBody = this.TxRxKmm(cmdKmmBody);

            if (rspKmmBody instanceof ChangeoverResponse) {
                let kmm = (ChangeoverResponse)(rspKmmBody);

                result.KeysetIdSuperseded = kmm.KeysetIdSuperseded;
                result.KeysetIdActivated = kmm.KeysetIdActivated;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
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
    async LoadAuthenticationKey() {
        throw "NotImplementedException";
    }
    async DeleteAuthenticationKey() {
        throw "NotImplementedException";
    }
    async ViewSuidInfo() {
        throw "NotImplementedException";
    }
    async ViewActiveSuidInfo() {
        throw "NotImplementedException";
    }
}