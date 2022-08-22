//Mfid90SessionControlVer1

class Mfid90SessionControlVer1 extends KmmBody {
    ScOpcode = {
        Connect: 0x01,
        ConnectAck: 0x02,
        TransferDone: 0x03,
        EndSession: 0x04,
        EndSessionAck: 0x05,
        Disconnect: 0x06,
        DisconnectAck: 0x07,
        BeginSession: 0x08,
        BeginSessionAck: 0x09
    };
    ScSourceDeviceType = {
        Kfd: 0x01,
        Mr: 0x02,
        Kmf: 0x03,
        Af: 0x04
    };
    ScSessionType = {
        KeyFill: 0x01,
        BulkTransfer: 0x02,
        StoreAndForward: 0x03
    };
    get MessageId() {
        return MessageId.SessionControl;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    SessionControlOpcode;
    SourceDeviceType;
    IsSessionTypeIncluded;
    SessionType;
    get ToBytes() {
        let contents = [];

        contents.push(0x01); // version

        contents.push(this.SessionControlOpcode);

        contents.push(this.SourceDeviceType);

        contents.push(this.IsSessionTypeIncluded ? 1 : 0);

        if (this.IsSessionTypeIncluded) {
            contents.push(SessionType);
        }
        
        return contents;
    }
    Parse(contents) {
        if (contents[0] != 0x01) {
            throw "unsupported version";
        }

        if (contents.length < 4) {
            throw "length mismatch - expected at least 4, got " + contents.length.toString();
        }

        this.SessionControlOpcode = contents[1];

        this.SourceDeviceType = contents[2];

        if (contents[3] == 0x00) {
            this.IsSessionTypeIncluded = false;
        }
        else if (contents[3] == 0x01) {
            this.IsSessionTypeIncluded = true;

            if (contents.length < 5) {
                throw "length mismatch for session type - expected at least 5, got " + contents.length.toString();
            }

            this.SessionType = contents[4];
        }
        else {
            throw "invalid is session type included";
        }
    }
}