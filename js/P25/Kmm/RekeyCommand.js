// RekeyCommand

class RekeyCommand extends KmmBody {
    get MessageId() {
        return MessageId.RekeyCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}