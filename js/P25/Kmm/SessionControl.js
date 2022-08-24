//SessionControl

class SessionControl extends KmmBody {
    SessionControlOpcode;
    SourceDeviceType;
    ScOpcode = {
        ReadyRequest: 0x01,
        ReadyGeneralMode: 0x02,
        TransferDone: 0x03,
        EndSession: 0x04,
        EndSessionAck: 0x05,
        Disconnect: 0x06,
        DisconnectAck: 0x07
    }
    ScSourceDeviceType = {
        Kfd: 0x01,
        Mr: 0x02
    }
    get MessageId() {
        return MessageId.ChangeRsiCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        var contents = [3];
        contents[0] = 0x00; //version
        contents[1] = this.SessionControlOpcode;
        contents[2] = this.SourceDeviceType;
        return contents;
    }
    Parse(contents) {
        if (contents[0] != 0x00) {
            throw "Unsupported version";
        }
        if (contents.length != 3) {
            throw "ArgumentOutOfRangeException";
        }
        this.SessionControlOpcode = Object.keys(this.ScOpcode).find(key => this.ScOpcode[key] === contents[1]);
        this.SourceDeviceType = Object.keys(this.ScSourceDeviceType).find(key => this.ScSourceDeviceType[key] === contents[2]);

        //this.SessionControlOpcode = ScOpcode.contents[1];
        //this.SourceDeviceType = ScSourceDeviceType.contents[2];
    }
}