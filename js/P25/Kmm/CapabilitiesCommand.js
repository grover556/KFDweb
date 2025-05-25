//CapabilitiesCommand

class CapabilitiesCommand extends KmmBody {
    get MessageId() {
        return MessageId.CapabilitiesCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        return [];
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}