//KmmFrame

class KmmFrame {
    KmmBody;
    // TODO src rsi
    // TODO dest rsi
    constructor(kmmBody, contents) {
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
        frame[4] = 0xFF;
        frame[5] = 0xFF;
        frame[6] = 0xFF;

        /* source rsi */
        frame[7] = 0xFF;
        frame[8] = 0xFF;
        frame[9] = 0xFF;

        /* message body */
        //Array.Copy(body, 0, frame, 10, body.length);
        frame = frame.concat(body);
        //console.log("frame", BCTS(frame).join("-"));
        return frame;
    }
    ToBytesWithPreamble(mfid) {
        // TODO add encryption, currently hardcoded to clear

        let data = [];

        data.push(0x00); // version
        
        data.push(mfid); // mfid
        
        data.push(0x80); // algid

        data.push(0x00); // key id
        data.push(0x00); // key id

        data.push(0x00); // mi
        data.push(0x00); // mi
        data.push(0x00); // mi
        data.push(0x00); // mi
        data.push(0x00); // mi
        data.push(0x00); // mi
        data.push(0x00); // mi
        data.push(0x00); // mi
        data.push(0x00); // mi

        data = data.concat(this.ToBytes());

        return data;
    }
    Parse(mfid, contents) {
        if (contents.length < 10) {
            throw "ArgumentOutOfRangeException";
        }
        console.log("contents", BCTS(contents).join("-"));
        let messageId = contents[0];

        let messageLength = 0;
        messageLength |= contents[1] << 8;
        messageLength |= contents[2];

        let messageBodyLength = messageLength - 7;
        let messageBody = [messageBodyLength];
        messageBody = contents.slice(10, 10 + messageBodyLength);
        console.log("messageBody", BCTS(messageBody).join("-"));
        if (messageId == MessageId.InventoryCommand) {
            console.log("MessageId = InventoryCommand");
            if (messageBody.length > 0) {
                let inventoryType = messageBody[0];

                if (inventoryType == InventoryType.ListActiveKsetIds) {
                    console.log("InventoryType = ListActiveKsetIds");
                    let kmmBody = new InventoryCommandListActiveKsetIds();
                    kmmBody.parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListRsiItems) {
                    console.log("InventoryType = ListRsiItems");
                    let kmmBody = new InventoryCommandListRsiItems();
                    kmmBody.parse(messageBody);
                    this.KmmBody = kmmBody;
                }
                else if (inventoryType == InventoryType.ListActiveKeys) {
                    console.log("InventoryType = ListActiveKeys");
                    let kmmBody = new InventoryCommandListActiveKeys();
                    kmmBody.parse(messageBody);
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
        console.log("kmmBody", this.KmmBody);
    }
    ParseWithPreamble(contents) {
        // TODO bounds check

        let version = contents[0];
        
        if (version != 0x00) {
            throw "unknown preamble version";
        }
        
        let mfid = contents[1];

        // TODO algid

        // TODO keyid

        // TODO mi

        let frame = contents.slice(14);

        this.Parse(mfid, frame);
    }
}