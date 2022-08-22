//SessionControl

class SessionControl {
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
    get ToBytes() {
        var contents = new Uint8Array(3);
        contents[0] = 0x00; //version
        contents[1] = SessionControlOpcode;
        contents[2] = SourceDeviceType;
        return contents;
    }
    Parse(contents) {
        if (contents[0] != 0x00) {
            throw "Unsupported version";
        }
        if (contents.length != 3) {
            throw "ArgumentOutOfRangeException";
        }
        SessionControlOpcode = ScOpcode.contents[1];
        SourceDeviceType = ScSourceDeviceType.contents[2];
    }
}