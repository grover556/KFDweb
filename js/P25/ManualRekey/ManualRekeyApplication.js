//ManualRekeyApplication

class ManualRekeyApplication {
    WithPreamble;
    Mfid;
    DeviceProtocol;
    Key = {
        AlgorithmId: 0x80,
        Id: 0x0000,
        MI: 0x000000000000000000
    };
    constructor(protocol, motVariant, key) {
        if (key !== undefined) {
            this.Key = key;
        }
        if (protocol instanceof AdapterProtocol) {
            this.WithPreamble = false;
            this.Mfid = 0x00;
            this.DeviceProtocol = new ThreeWireProtocol();
        }
        else if (protocol instanceof BridgeProtocol) {
            this.WithPreamble = true;
            this.Mfid = motVariant ? 0x90:0x00;
            this.DeviceProtocol = new DataLinkIndependentProtocol(protocol, motVariant, this.Key);
        }
        console.log(this);
    }
    async Begin() {
        await this.DeviceProtocol.SendKeySignature();
        await this.DeviceProtocol.InitSession();
    }
    async TxRxKmm(commandKmmBody) {
        let commandKmmFrame = new KmmFrame(commandKmmBody);
        console.warn("MRA.TxRxKmm commandKmmFrame", commandKmmFrame);
        let toRadio = this.WithPreamble ? commandKmmFrame.ToBytesWithPreamble(this.Mfid) : commandKmmFrame.ToBytes();
        console.warn(commandKmmFrame);
        console.warn("MRA.TxRxKmm toRadio", BCTS(toRadio).join("-"));
        let fromRadio = await this.DeviceProtocol.PerformKmmTransfer(toRadio);
        console.warn("MRA.TxRxKmm fromRadio", BCTS(fromRadio).join("-"));
        let responseKmmFrame = new KmmFrame(this.WithPreamble, fromRadio);
        console.warn("MRA.TxRxKmm responseKmmFrame", responseKmmFrame);
        //return responseKmmFrame.KmmBody;
        return responseKmmFrame;
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

            if (rspKmmBody1.KmmBody instanceof InventoryResponseListActiveKsetIds) {
                //let kmm = (InventoryResponseListActiveKsetIds)(rspKmmBody1);
                let kmm = rspKmmBody1.KmmBody;
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
            else if (rspKmmBody1.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = rspKmmBody1.KmmBody;

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

            if (rspKmmBody1.KmmBody instanceof InventoryResponseListActiveKsetIds) {
                let kmm = rspKmmBody1.KmmBody;

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
            else if (rspKmmBody1.KmmBody instanceof NegativeAcknowledgment) {
                //let kmm = (NegativeAcknowledgment)(rspKmmBody1);
                let kmm = rspKmmBody1.KmmBody;
                
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

    async Keyload_individual(keyItems) {
        //let keyGroups = KeyPartitioner.PartitionKeys(keyItems);
        let keyStatuses = [];
        await this.Begin();

        try {
            let cmdKmmBody1 = new InventoryCommandListActiveKsetIds();
            let rspKmmBody1 = await this.TxRxKmm(cmdKmmBody1);
            let activeKeysetId = 0;
            if (rspKmmBody1.KmmBody instanceof InventoryResponseListActiveKsetIds) {
                let kmm = rspKmmBody1.KmmBody;
                if (kmm.KsetIds.length > 0) activeKeysetId = kmm.KsetIds[0];
                else activeKeysetId = 1;
            }
            else if (rspKmmBody1.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = rspKmmBody1.KmmBody;
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else throw "unexpected kmm";
            
            for (var i=0;i<keyItems.length;i++) {
                let modifyKeyCommand = new ModifyKeyCommand();
                if (keyItems[i].UseActiveKeyset && !keyItems[i].IsKek) {
                    modifyKeyCommand.KeysetId = activeKeysetId;
                }
                else if (keyItems[i].UseActiveKeyset && keyItems[i].IsKek) {
                    modifyKeyCommand.KeysetId = 0xFF; // to match KFL3000+ R3.53.03 behavior
                }
                else {
                    modifyKeyCommand.KeysetId = keyItems[i].KeysetId;
                }

                modifyKeyCommand.AlgorithmId = keyItems[i].AlgorithmId;
                let keyItem = new KeyItem();
                keyItem.SLN = keyItems[i].Sln;
                keyItem.KeyId = keyItems[i].KeyId;
                keyItem.Key = keyItems[i].Key;
                keyItem.KEK = keyItems[i].IsKek;
                keyItem.Erase = false;
                modifyKeyCommand.KeyItems.push(keyItem);
                console.log(modifyKeyCommand);

                let rspKmmBody2 = await this.TxRxKmm(modifyKeyCommand);
                if (rspKmmBody2.KmmBody instanceof RekeyAcknowledgment) {
                    let kmm = rspKmmBody2.KmmBody;
                    for (var k=0; k<kmm.Keys.length; k++) {
                        let status = kmm.Keys[k];
                        keyStatuses.push(status);
                        //UpdateKeyloadStatus(status);

                        console.log("* key status index " + k + " *");
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
                else if (rspKmmBody2.KmmBody instanceof NegativeAcknowledgment) {
                    let kmm = rspKmmBody2.KmmBody;

                    let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                    let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                    throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
                }
                else {
                    throw "received uxexpected kmm";
                }
                console.log(i);
            }
        }
        catch {
            await this.End();
            throw "";
        }
        await this.End();
        return keyStatuses;
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
            if (rspKmmBody1.KmmBody instanceof InventoryResponseListActiveKsetIds) {
                let kmm = rspKmmBody1.KmmBody;

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
            else if (rspKmmBody1.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = rspKmmBody1.KmmBody;
                
                let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
            }
            else {
                throw "unexpected kmm";
            }
            
            for (var i=0;i<keyGroups.length;i++) {
                console.log(i);
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
                    console.log(j);
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
                if (rspKmmBody2.KmmBody instanceof RekeyAcknowledgment) {
                    let kmm = rspKmmBody2.KmmBody;

                    console.log("number of key status: " + kmm.Keys.length);

                    for (var k=0; k<kmm.Keys.length; k++) {
                        let status = kmm.Keys[k];
                        keyStatuses.push(status);

                        console.log("* key status index " + k + " *");
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
                else if (rspKmmBody2.KmmBody instanceof NegativeAcknowledgment) {
                    let kmm = rspKmmBody2.KmmBody;

                    let statusDescr = OperationStatusExtensions.ToStatusString(kmm.Status);
                    let statusReason = OperationStatusExtensions.ToReasonString(kmm.Status);
                    throw "received negative acknowledgment status: " + statusDescr + ", " + statusReason;
                }
                else {
                    throw "received uxexpected kmm";
                }
                console.log(i);
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
                if (rspKmmBody1.KmmBody instanceof InventoryResponseListActiveKsetIds) {
                    let kmm = rspKmmBody1.KmmBody;
    
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
                else if (rspKmmBody1.KmmBody instanceof NegativeAcknowledgment) {
                    //let kmm = (NegativeAcknowledgment)(rspKmmBody1);
                    let kmm = rspKmmBody1.KmmBody;
                    
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
            if (rspKmmBody2.KmmBody instanceof RekeyAcknowledgment) {
                let kmm = rspKmmBody2.KmmBody;

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
            else if (rspKmmBody2.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = rspKmmBody2.KmmBody;

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
                if (rspKmmBody2.KmmBody instanceof RekeyAcknowledgment) {
                    let kmm = rspKmmBody2.KmmBody;
                    result = kmm;
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
                else if (rspKmmBody2.KmmBody instanceof NegativeAcknowledgment) {
                    let kmm = rspKmmBody2.KmmBody;
    
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
            if (responseKmmBody.KmmBody instanceof ZeroizeResponse) {
                result = "zeroized";
                console.log("zeroized");
            }
            else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody.KmmBody;
    
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
                if (responseKmmBody.KmmBody instanceof InventoryResponseListActiveKeys) {
                    let kmm = responseKmmBody.KmmBody;
                    console.log(kmm);
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
                else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                    let kmm = responseKmmBody.KmmBody;
        
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
            if (responseKmmBody.KmmBody instanceof InventoryResponseListKmfRsi) {
                let kmm = responseKmmBody.KmmBody;

                result = kmm.KmfRsi;
            }
            else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody.KmmBody;
    
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
            if (responseKmmBody.KmmBody instanceof InventoryResponseListMnp) {
                let kmm = responseKmmBody.KmmBody;

                result = kmm.MessageNumberPeriod;
            }
            else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody.KmmBody;
    
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
            if (responseKmmBody.KmmBody instanceof LoadConfigResponse) {
                let kmm = responseKmmBody.KmmBody;
                result.RSI = kmfRsi;
                result.MN = mnp;
                result.Status = kmm.Status;
            }
            else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody.KmmBody;
    
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
        await this.Begin();

        try {
            let cmdKmmBody = new ChangeRsiCommand();
            cmdKmmBody.RsiOld = rsiOld;
            cmdKmmBody.RsiNew = rsiNew;
            cmdKmmBody.MessageNumber = mnp;
            
            let responseKmmBody = await this.TxRxKmm(cmdKmmBody);
            if (responseKmmBody.KmmBody instanceof ChangeRsiResponse) {
                let kmm = responseKmmBody.KmmBody;
                result.RSI = rsiNew;
                result.MN = mnp;
                result.Status = kmm.Status;
            }
            else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody.KmmBody;
    
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
                if (responseKmmBody.KmmBody instanceof InventoryResponseListRsiItems) {
                    let kmm = responseKmmBody.KmmBody;

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
                else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                    let kmm = responseKmmBody.KmmBody;
        
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
            if (responseKmmBody.KmmBody instanceof InventoryResponseListKeysetTaggingInfo) {
                let kmm = responseKmmBody.KmmBody;
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
            else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody.KmmBody;

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
            console.log(responseKmmBody.KmmBody);
            if (responseKmmBody.KmmBody instanceof ChangeoverResponse) {
                let kmm = responseKmmBody.KmmBody;

                result.KeysetIdSuperseded = kmm.KeysetIdSuperseded;
                result.KeysetIdActivated = kmm.KeysetIdActivated;
            }
            else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody.KmmBody;

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
    async SetDateTime(activeDatetime) {
        //throw "NotImplementedException";
        let result = "";
        await this.Begin();

        try {
            let commandKmmBody = new SetDateTimeCommand();
            cmdKmmBody.KeysetActiveDateTimeISO = activeDatetime;
            await this.TxRxKmm(commandKmmBody);
        }
        catch {
            await this.End();
            throw "";
        }
        await this.End();
        return result;
    }
    async ModifyKeysetAttributes(keysets) {
        throw "NotImplementedException";
        for (var i=0;i<keysets.length;i++) {
            let keyset = new KeysetItem();
            keyset.KeysetId = keysets[i].ID;
            if (keysets[i]) {
                keyset.KeysetType = keysets[i].KeysetType;
                keyset.ActivationDateTime = keysets[i].ActivationDateTime;
            }
            console.log(keyItem);
            modifyKeyCommand.KeyItems.push(keyItem);
        }
    }
    async GetCapabilities() {
        let result = {};
        await this.Begin();

        try {
            let commandKmmBody = new CapabilitiesCommand();

            let responseKmmBody = await this.TxRxKmm(commandKmmBody);
            console.log(responseKmmBody.KmmBody);
            if (responseKmmBody.KmmBody instanceof CapabilitiesResponse) {
                result.Algorithms = responseKmmBody.KmmBody.Algorithms;
                result.OptionalServices = responseKmmBody.KmmBody.OptionalServices;
                result.MessageIds = responseKmmBody.KmmBody.MessageIds;
            }
            else if (responseKmmBody.KmmBody instanceof NegativeAcknowledgment) {
                let kmm = responseKmmBody.KmmBody;
    
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
}