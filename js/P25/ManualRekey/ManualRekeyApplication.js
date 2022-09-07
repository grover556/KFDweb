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
        await this.DeviceProtocol.InitSession();
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
        await this.DeviceProtocol.EndSession();
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
    async ListActiveKsetIds() {
        await this.Begin();
        let activeKeysetId = 0;
        try {
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();
            let rspKmmBody1 = await this.TxRxKmm(cmdKmmBody1);
            //let activeKeysetId = 0;

            if (rspKmmBody1 instanceof InventoryResponseListActiveKsetIds) {
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
        }
        catch {
            await this.End();
            throw "";
        }
        await this.End();
        return activeKeysetId;
    }
    async Keyload(keyItems) {
        let keyGroups = KeyPartitioner.PartitionKeys(keyItems);
        //console.log(keyGroups);
        //keyGroups = [keyItems];
        console.log(keyItems);
        console.log(keyGroups);
        let keyStatuses = [];
        await this.Begin();
        
        try {
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();
            let rspKmmBody1 = await this.TxRxKmm(cmdKmmBody1);
            let activeKeysetId = 0;
            if (rspKmmBody1 instanceof InventoryResponseListActiveKsetIds) {
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
                        keyStatuses.push(status);

                        console.log("* key status index " + i + " *");
                        console.log("algorithm id: " + status.AlgorithmId);
                        console.log("key id: " + status.KeyId);
                        console.log("status: " + status.Status);

                        if (status.Status != 0) {
                            let statusDescr = OperationStatusExtensions.ToStatusString(status.Status);
                            let statusReason = OperationStatusExtensions.ToReasonString(status.Status);
                            console.error("received unexpected key status " + "algorithm id: " + status.AlgorithmId + " key id: " + status.KeyId + " status: " + status.Status + " status description: " + statusDescr + " status reason: " + statusReason);
                            //throw "received unexpected key status" + "algorithm id: " + status.AlgorithmId + "key id: " + status.KeyId + "status: " + status.Status + "status description: " + statusDescr + "status reason: " + statusReason;
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
            await this.End();
            throw "";
        }
        await this.End();
        return keyStatuses;
    }
    async Keyload_single(key) {
        console.log(key);
        let keyStatus;
        await this.Begin();
        
        try {
            if (key.UseActiveKeyset) {
                // Get active keyset if needed
                let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();
                let rspKmmBody1 = await this.TxRxKmm(cmdKmmBody1);
                if (rspKmmBody1 instanceof InventoryResponseListActiveKsetIds) {
                    let kmm = rspKmmBody1;
    
                    for (var i=0; i<kmm.KsetIds.length; i++) {
                        console.log("* keyset id index " + i + " *");
                        console.log("keyset id: " + kmm.KsetIds[i]);
                    }
    
                    // TODO support more than one crypto group
                    if (kmm.KsetIds.length > 0) {
                        key.KeysetId = kmm.KsetIds[0];
                    }
                    else {
                        key.KeysetId = 1; // to match KVL3000+ R3.53.03 behavior
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
            }
            
            let modifyKeyCommand = new ModifyKeyCommand();
            // TODO support more than one crypto group
            if (key.UseActiveKeyset && !key.IsKek) {
                modifyKeyCommand.KeysetId = key.KeysetId;
            }
            else if (key.UseActiveKeyset && key.IsKek) {
                modifyKeyCommand.KeysetId = 0xFF; // to match KFL3000+ R3.53.03 behavior
            }
            else {
                modifyKeyCommand.KeysetId = key.KeysetId;
            }
            modifyKeyCommand.AlgorithmId = key.AlgorithmId;
            console.log(modifyKeyCommand);

            let keyItem = new KeyItem();
            keyItem.SLN = key.Sln;
            keyItem.KeyId = key.KeyId;
            keyItem.Key = key.Key;
            keyItem.KEK = key.IsKek;
            keyItem.Erase = false;
            modifyKeyCommand.KeyItems.push(keyItem);

            console.log(modifyKeyCommand);
            let rspKmmBody2 = await this.TxRxKmm(modifyKeyCommand);
            
            if (rspKmmBody2 instanceof RekeyAcknowledgment) {
                let kmm = rspKmmBody2;

                console.log("number of key status: " + kmm.Keys.length);
                
                for (var i=0; i<kmm.Keys.length; i++) {
                    let status = kmm.Keys[i];
                    keyStatus = status;
                    console.log(status);
                    //keyStatus.push(status);

                    console.log("* key status index " + i + " *");
                    console.log("algorithm id: " + status.AlgorithmId);
                    console.log("key id: " + status.KeyId);
                    console.log("status: " + status.Status);

/*
                    if (status.Status != 0) {
                        let statusDescr = OperationStatusExtensions.ToStatusString(status.Status);
                        let statusReason = OperationStatusExtensions.ToReasonString(status.Status);
                        console.error("received unexpected key status " + "algorithm id: " + status.AlgorithmId + " key id: " + status.KeyId + " status: " + status.Status + " status description: " + statusDescr + " status reason: " + statusReason);
                        //throw "received unexpected key status" + "algorithm id: " + status.AlgorithmId + "key id: " + status.KeyId + "status: " + status.Status + "status description: " + statusDescr + "status reason: " + statusReason;
                    }
*/
                }
                console.log(keyStatus);
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
        catch {
            await this.End();
            throw "";
        }
        await this.End();
        return keyStatus;
    }
    async EraseKeys(keyItems) {
        //let keyGroups = KeyPartitioner.PartitionKeys(keyItems);
        let keyGroups = [keyItems];// for single key erase, for now
        //console.log(keyGroups);
        let result;
        await this.Begin();

        try {
            // Since the user is selecting a key from the table, no need to get Active Keyset ID
            /*
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();

            let rspKmmBody1 = await this.TxRxKmm(cmdKmmBody1);

            let activeKeysetId = 0;

            if (rspKmmBody1 instanceof InventoryResponseListActiveKsetIds) {
                let kmm = rspKmmBody1;

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
                let kmm = rspKmmBody1;

                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
            */
            for (var i=0; i< keyGroups.length; i++) {
                let modifyKeyCommand = new ModifyKeyCommand();

                // Again, no need for logic since Keyset ID is selected
                /*
                // TODO support more than one crypto group
                if (keyGroups[i][0].UseActiveKeyset && !keyGroups[i][0].IsKek) {
                    modifyKeyCommand.KeysetId = activeKeysetId;
                }
                else if (keyGroups[i][0].UseActiveKeyset && keyGroups[i][0].IsKek) {
                    modifyKeyCommand.KeysetId = 0xFF; // to match KVL3000+ R3.53.03 behavior
                }
                else {
                    modifyKeyCommand.KeysetId = keyGroups[i][0].KeysetId;
                }
                */
                modifyKeyCommand.KeysetId = keyGroups[i][0].KeysetId;
                modifyKeyCommand.AlgorithmId = 0x81; // to match KVL3000+ R3.53.03 behavior

                for (var j=0; j< keyGroups[i].length; j++) {
                    let keyItem = new KeyItem();
                    keyItem.SLN = keyGroups[i][j].Sln;
                    keyItem.KeyId = 65535; // to match KVL3000+ R3.53.03 behavior
                    keyItem.Key = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]; // to match KVL3000+ R3.53.03 behavior
                    keyItem.KEK = keyGroups[i][j].IsKek;
                    keyItem.Erase = true;
                    
                    modifyKeyCommand.KeyItems.push(keyItem);
                }
                let rspKmmBody2 = await this.TxRxKmm(modifyKeyCommand);

                if (rspKmmBody2 instanceof RekeyAcknowledgment) {
                    let kmm = rspKmmBody2;
                    result = rspKmmBody2;
                    //console.log("number of key status: " + kmm.Keys.length);

                    /*
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
                    */
                }
                else if (rspKmmBody2 instanceof NegativeAcknowledgment) {
                    let kmm = rspKmmBody2;
    
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
            await this.End();
            throw "";
        }
        await this.End();
        return result;
    }
    async EraseAllKeys() {
        let result = "";
        await this.Begin();

        try {
            let commandKmmBody = new ZeroizeCommand();

            let responseKmmBody = await this.TxRxKmm(commandKmmBody);

            if (responseKmmBody instanceof ZeroizeResponse) {
                result = "zeroized";
                console.log("zeroized");
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;
    
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
        return result;
    }
    async ViewKeyInfo() {
        let result = [];

        await this.Begin();

        try {
            let more = true;
            let marker = 0;

            while(more) {
                let commandKmmBody = new InventoryCommandListActiveKeys();

                commandKmmBody.InventoryMarker = marker;
                commandKmmBody.MaxKeysRequested = 78;

                let responseKmmBody = await this.TxRxKmm(commandKmmBody);

                if (responseKmmBody instanceof InventoryResponseListActiveKeys) {
                    let kmm = responseKmmBody;
                    console.log(responseKmmBody);
                    marker = kmm.InventoryMarker;

                    console.log("inventory marker: " + marker);

                    if (marker == 0) {
                        more = false;
                    }

                    console.log("number of keys returned: " + kmm.Keys.length);

                    for (var i=0; i<kmm.Keys.length; i++) {
                        let info = kmm.Keys[i];
/*
                        console.log("* key status index " + i + " *");
                        console.log("keyset id: " + info.KeySetId);
                        console.log("sln: " + info.SLN);
                        console.log("algorithm id: " + info.AlgorithmId);
                        console.log("key id: " + info.KeyId);
*/
                        let res = new RspKeyInfo();
                        res.KeysetId = info.KeySetId;
                        res.Sln = info.SLN;
                        res.AlgorithmId = info.AlgorithmId;
                        res.KeyId = info.KeyId;

                        result.push(res);
                    }
                    console.log(result);
                }
                else if (responseKmmBody instanceof NegativeAcknowledgment) {
                    let kmm = responseKmmBody;
        
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
            await this.End();
            throw "";
        }
        await this.End();
        return result;
    }
    async ViewKmfRsi() {
        // DONE
        let result = [];

        await this.Begin();

        try {
            let commandKmmBody = new InventoryCommandListKmfRsi();

            let responseKmmBody = await this.TxRxKmm(commandKmmBody);
            console.log(responseKmmBody);
            if (responseKmmBody instanceof InventoryResponseListKmfRsi) {
                let kmm = responseKmmBody;

                result = kmm.KmfRsi;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                console.warn("received negative acknowledgment status: " + statusDescr + ", " + statusReason);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                console.error("unexpected kmm");
                throw "unexpected kmm";
            }
        }
        catch {
            await this.End();
            throw "";
        }
        await this.End();
        return result;
    }
    async ViewMnp() {
        let result = [];

        await this.Begin();

        try {
            let commandKmmBody = new InventoryCommandListMnp();

            let responseKmmBody = await this.TxRxKmm(commandKmmBody);

            if (responseKmmBody instanceof InventoryResponseListMnp) {
                let kmm = responseKmmBody;

                result = kmm.MessageNumberPeriod;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;
    
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                console.warn("received negative acknowledgment status: " + statusDescr + ", " + statusReason);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                console.error("unexpected kmm");
                throw "unexpected kmm";
            }
        }
        catch {
            await this.End();
            throw "";
        }
        await this.End();
        return result;
    }
    async LoadConfig(kmfRsi, mnp) {
        let result = new RspRsiInfo();
        
        await this.Begin();

        try {
            let cmdKmmBody = new LoadConfigCommand();
            cmdKmmBody.KmfRsi = kmfRsi;
            cmdKmmBody.MessageNumberPeriod = mnp;
            let responseKmmBody = await this.TxRxKmm(cmdKmmBody);
            if (responseKmmBody instanceof LoadConfigResponse) {
                result.RSI = kmfRsi;
                result.MN = mnp;
                result.Status = responseKmmBody.Status;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;
    
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
        return result;
    }
    async ChangeRsi(rsiOld, rsiNew, mnp) {
        let result = new RspRsiInfo();
console.log("rsiOld:" + rsiOld + " rsiNew:" + rsiNew + " mnp:" + mnp);
        await this.Begin();

        try {
            let cmdKmmBody = new ChangeRsiCommand();
            cmdKmmBody.RsiOld = rsiOld;
            cmdKmmBody.RsiNew = rsiNew;
            cmdKmmBody.MessageNumber = mnp;
console.log(cmdKmmBody);
            let responseKmmBody = await this.TxRxKmm(cmdKmmBody);
console.log(responseKmmBody);
            if (responseKmmBody instanceof ChangeRsiRepsonse) {
                result.RSI = rsiNew;
                result.MN = mnp;
                result.Status = responseKmmBody.Status;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;
    
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
        return result;
    }
    async ViewRsiItems() {
        let result = [];

        await this.Begin();

        try {
            let more = true;
            let marker = 0;

            while(more) {
                let commandKmmBody = new InventoryCommandListRsiItems();

                let responseKmmBody = await this.TxRxKmm(commandKmmBody);

                if (responseKmmBody instanceof InventoryResponseListRsiItems) {
                    let kmm = responseKmmBody;

                    console.log("inventory marker: " + marker);

                    if (marker == 0) {
                        more = false;
                    }

                    console.log("number of RSIs returned: " + kmm.RsiItems.length);

                    for (var i=0; i<kmm.RsiItems.length; i++) {
                        let item = kmm.RsiItems[i];
                        console.log("RsiItem", item);

                        console.log("* rsi index " + i);
                        console.log("rsi id: " + item.RSI);
                        console.log("mn: " + item.MessageNumber);

                        let res = new RspRsiInfo();

                        res.RSI = item.RSI;
                        res.MN = item.MessageNumber;

                        result.push(res);
                    }
                }
                else if (responseKmmBody instanceof NegativeAcknowledgment) {
                    let kmm = responseKmmBody;
        
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
            await this.End();
            throw "";
        }
        await this.End();
        return result;
    }
    async ViewKeysetTaggingInfo() {
        let result = [];
        await this.Begin();
        try {
            let commandKmmBody = new InventoryCommandListKeysetTaggingInfo();
            let responseKmmBody = await this.TxRxKmm(commandKmmBody);

            if (responseKmmBody instanceof InventoryResponseListKeysetTaggingInfo) {
                let kmm = responseKmmBody;
                console.log(kmm);
                for (var i=0; i<kmm.KeysetItems.length; i++) {
                    let item = kmm.KeysetItems[i];

                    let res = new RspKeysetInfo();

                    res.KeysetId = item.KeysetId;
                    res.KeysetName = item.KeysetName;
                    res.KeysetType = item.KeysetType;
                    res.ActivationDateTime = item.ActivationDateTime;
                    res.ReservedField = item.ReservedField;
console.log(res);
                    result.push(res);
                }
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;

                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                console.warn("received negative acknowledgment status: " + statusDescr + ", " + statusReason);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                console.error("unexpected kmm");
                throw "unexpected kmm";
            }
        }
        catch {
            await this.End();
            throw "";
        }
        await this.End();
        return result;
    }
    async ActivateKeyset(keysetSuperseded, keysetActivated) {
        let result = new RspChangeoverInfo();

        await this.Begin();

        try {
            let cmdKmmBody = new ChangeoverCommand();
            cmdKmmBody.KeysetIdSuperseded = keysetSuperseded;
            cmdKmmBody.KeysetIdActivated = keysetActivated;
            let responseKmmBody = await this.TxRxKmm(cmdKmmBody);
            console.log(responseKmmBody);
            if (responseKmmBody instanceof ChangeoverResponse) {
                let kmm = responseKmmBody;

                result.KeysetIdSuperseded = kmm.KeysetIdSuperseded;
                result.KeysetIdActivated = kmm.KeysetIdActivated;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;

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
        return result;
    }
    async SetDateTime() {
        await this.Begin();

        try {
            let cmdKmmBody = new SetDateTimeCommand();
            cmdKmmBody.DateTime = new Date();
            
            let responseKmmBody = await this.TxRxKmm(cmdKmmBody);
            console.log(responseKmmBody);
            // There shouldn't be any response
            if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;

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
    async GetCapabilities() {
        let result;

        await this.Begin();

        try {
            let cmdKmmBody = new CapabilitiesCommand();
            
            let responseKmmBody = await this.TxRxKmm(cmdKmmBody);
            
            if (responseKmmBody instanceof CapabilitiesResponse) {
                let kmm = responseKmmBody;
                result = kmm;
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;

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
        return result;
    }
    async DeleteKeys(keyInfos) {
        let result;

        await this.Begin();

        try {
            let cmdKmmBody = new DeleteKeyCommand();

            keyInfos.forEach((info) => {
                let stemp = new KeyStatus();
                stemp.AlgorithmId = info.algorithmId;
                stemp.KeyId = info.keyId;
                cmdKmmBody.KeyItems.push(stemp);
            });

            let responseKmmBody = await this.TxRxKmm(cmdKmmBody);
            
            if (responseKmmBody instanceof DeleteKeyResponse) {
                let kmm = responseKmmBody;
                result = kmm;
                console.log(kmm);
            }
            else if (responseKmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody;

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