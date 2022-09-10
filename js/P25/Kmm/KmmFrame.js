//KmmFrame

class KmmFrame {
    KmmBody;
    RsiDestination;
    RsiSource;
    Version;
    Mfid;
    AlgorithmId;
    KeyId;
    Mi;
    constructor(kmmBody, contents) {
        this.RsiDestination = 0xFFFFFF;
        this.RsiSource = 0xFFFFFF;
        this.Version = 0x00;
        this.Mfid = 0x00;
        this.AlgorithmId = 0x80;
        this.KeyId = 0x0000;
        this.Mi = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00];

        // Had to get creative becuase JS does not support construtor overloads
        if (kmmBody instanceof KmmBody) {
            this.KmmBody = kmmBody;
        }
        else if (typeof kmmBody == "boolean") {
            if (kmmBody) {
                this.ParseWithPreamble(contents);
            }
            else {
                this.Parse(0x00, contents);
            }
        }
    }
    ToBytes() {
        // for whatever reason, "get ToBytes()" breaks async/await functionality
        let body = Array.from(this.KmmBody.ToBytes());
        //let body = this.KmmBody.ToBytes();
        //console.log("body", BCTS(body).join("-"));
        let length = 10 + body.length;

        //let frame = new Uint8Array(length);
        let frame = [length];

        /* message id */
        frame[0] = this.KmmBody.MessageId;

        /* message length */
        let messageLength = 7 + body.length;
        frame[1] = (messageLength >>> 8) & 0xFF;
        frame[2] = messageLength & 0xFF;

        /* message format */
        //BitArray messageFormat = new BitArray(8, false);
        let bitSeven = (this.KmmBody.ResponseKind & 0x02) >> 1;
        let bitSix = this.KmmBody.ResponseKind & 0x01;
        
        //let messageFormat = Number(bitSeven) + Number(bitSix) + "000000";
        let temp = [0,0,0,0,0,0,0,0];
        temp[7] = Number(bitSeven);
        temp[6] = Number(bitSix);
        let messageFormat = parseInt(temp.reverse().join(""), 2);
        frame[3] = messageFormat;

        /* destination rsi */
        frame[4] = this.RsiDestination >>> 16;
        frame[5] = this.RsiDestination >>> 8;
        frame[6] = this.RsiDestination & 0xFF;

        /* source rsi */
        frame[7] = this.RsiSource >>> 16;
        frame[8] = this.RsiSource >>> 8;
        frame[9] = this.RsiSource & 0xFF;

        /* message body */
        //Array.Copy(body, 0, frame, 10, body.length);
        frame = frame.concat(body);
        //console.log("frame", BCTS(frame).join("-"));
        return frame;
    }
    ToBytesWithPreamble(mfid) {
        // TODO add encryption, currently hardcoded to clear

        let data = [];

        data.push(this.Version); // version
        
        data.push(mfid); // mfid
        
        data.push(this.AlgorithmId); // algid

        data.push(this.KeyId >>> 8); // key id
        data.push(this.KeyId & 0xFF); // key id

        data.push(this.Mi[0]); // mi
        data.push(this.Mi[1]); // mi
        data.push(this.Mi[2]); // mi
        data.push(this.Mi[3]); // mi
        data.push(this.Mi[4]); // mi
        data.push(this.Mi[5]); // mi
        data.push(this.Mi[6]); // mi
        data.push(this.Mi[7]); // mi
        data.push(this.Mi[8]); // mi

        data = data.concat(this.ToBytes());

        return data;
    }
    Parse(mfid, contents) {
        if (contents.length < 10) {
            throw "ArgumentOutOfRangeException";
        }
        //console.log("contents", BCTS(contents).join("-"));
        let messageId = contents[0];

        let messageLength = 0;
        messageLength |= contents[1] << 8;
        messageLength |= contents[2];

        // Destination RSI
        this.RsiDestination |= contents[4] << 16;
        this.RsiDestination |= contents[5] << 8;
        this.RsiDestination |= contents[6];

        // Source RSI
        this.RsiSource |= contents[7] << 16;
        this.RsiSource |= contents[8] << 8;
        this.RsiSource |= contents[9];

        let messageBodyLength = messageLength - 7;
        let messageBody = [messageBodyLength];
        messageBody = contents.slice(10, 10 + messageBodyLength);
        //console.log("messageBody", BCTS(messageBody).join("-"));
        if (messageId == MessageId.InventoryCommand) {
            console.log("MessageId = InventoryCommand");
            if (messageBody.length > 0) {
                let inventoryType = messageBody[0];

                if (inventoryType == InventoryType.ListActiveKsetIds) {
                    console.log("InventoryType = ListActiveKsetIds");
                    let kmmBody = new InventoryCommandListActiveKsetIds();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListRsiItems) {
                    console.log("InventoryType = ListRsiItems");
                    let kmmBody = new InventoryCommandListRsiItems();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListActiveKeys) {
                    console.log("InventoryType = ListActiveKeys");
                    let kmmBody = new InventoryCommandListActiveKeys();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                // OTAR COMMANDS
                else if (inventoryType == InventoryType.ListInactiveKeyIds) {
                    console.log("InventoryType = ListInactiveKeyIds");
                    let kmmBody = new InventoryCommandListInactiveKeyIds();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else {
                    console.error("unknown inventory command type");
                    throw "unknown inventory command type";
                }
            }
            else {
                console.error("inventory command length zero");
                throw "inventory command length zero";
            }
        }
        else if (messageId == MessageId.InventoryResponse) {
            console.log("MessageId = InventoryResponse");
            if (messageBody.length > 0) {
                let inventoryType = messageBody[0];
                if (inventoryType == InventoryType.ListActiveKsetIds) {
                    console.log("InventoryType = ListActiveKsetIds");
                    let kmmBody = new InventoryResponseListActiveKsetIds();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListActiveKeys) {
                    console.log("InventoryType = ListActiveKeys");
                    let kmmBody = new InventoryResponseListActiveKeys();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListRsiItems) {
                    console.log("InventoryType = ListRsiItems");
                    let kmmBody = new InventoryResponseListRsiItems();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListMnp) {
                    console.log("InventoryType = ListMnp");
                    let kmmBody = new InventoryResponseListMnp();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListKmfRsi) {
                    console.log("InventoryType = ListKmfRsi");
                    let kmmBody = new InventoryResponseListKmfRsi();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListKeysetTaggingInfo) {
                    console.log("InventoryType = ListKeysetTaggingInfo");
                    let kmmBody = new InventoryResponseListKeysetTaggingInfo();
                    console.log(kmmBody);
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                // OTAR COMMANDS
                else if (inventoryType == InventoryType.ListInactiveKeyIds) {
                    console.log("InventoryType = ListInactiveKeyIds");
                    let kmmBody = new InventoryResponseLListInactiveKeyIds();
                    console.log(kmmBody);
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else {
                    console.error("unknown inventory response type");
                    throw "unknown inventory response type";
                }
            }
            else {
                console.error("inventory response length zero");
                throw "inventory response length zero";
            }
        }
        else if (messageId == MessageId.ModifyKeyCommand) {
            console.log("MessageId = ModifyKeyCommand");
            let kmmBody = new ModifyKeyCommand();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.NegativeAcknowledgment) {
            console.log("MessageId = NegativeAcknowledgment");
            let kmmBody = new NegativeAcknowledgment();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.RekeyAcknowledgment) {
            console.log("MessageId = RekeyAcknowledgment");
            let kmmBody = new RekeyAcknowledgment();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.ZeroizeResponse) {
            console.log("MessageId = ZeroizeResponse");
            let kmmBody = new ZeroizeResponse();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.LoadConfigResponse) {
            console.log("MessageId = LoadConfigResponse");
            let kmmBody = new LoadConfigResponse();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.ChangeRsiResponse) {
            console.log("MessageId = ChangeRsiResponse");
            let kmmBody = new ChangeRsiResponse();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.ChangeoverResponse) {
            console.log("MessageId = ChangeoverResponse");
            let kmmBody = new ChangeoverResponse();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.CapabilitiesResponse) {
            console.log("MessageId = CapabilitiesResponse");
            let kmmBody = new CapabilitiesResponse();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.DeleteKeyResponse) {
            console.log("MessageId = DeleteKeyResponse");
            let kmmBody = new DeleteKeyResponse();
            kmmBody.Parse(messageBody);
            this.KmmBody = kmmBody;
        }
        else if (messageId == MessageId.SessionControl) {
            console.log("MessageId = SessionControl");
            if (messageBody.length > 0) {
                let version = messageBody[0];

                if (mfid == 0x00 && version == 0x00) {
                    let kmmBody = new Mfid90SessionControlVer1();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (mfid == 0x90 && version == 0x01) {
                    let kmmBody = new Mfid90SessionControlVer1();
                    kmmBody.Parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else {
                    console.error("unknown session control");
                    throw "unknown session control";
                }
            }
            else {
                console.error("session control body length zero");
                throw "session control body length zero";
            }
        }
        else {
            console.error("unknown kmm - message id: " + messageId.toString());
            throw "unknown kmm - message id: " + messageId.toString();
        }
        //console.log("kmmBody", this.KmmBody);
    }
    ParseWithPreamble(contents) {
        // TODO bounds check

        this.Version = contents[0];

        if (this.Version == 0x00) {
            // Version 0 preamble
            this.Mfid = contents[1];
            this.AlgorithmId = contents[2];

            this.KeyId |= contents[3] << 8;
            this.KeyId |= contents[4];

            for (var i=0; i<9; i++) {
                this.Mi[i] = contents[5 + i];
            }

            let frame = contents.slice(14);

            if ((this.AlgorithmId == 0x80) && (this.KeyId == 0x0000)) {
                this.Parse(this.Mfid, frame);
            }
            else {
                // Decrypt the frame




                this.Parse(this.Mfid, frame);
            }
        }
        else if (this.Version != 0x00) {
            throw "unknown preamble version";
        }
    }
}