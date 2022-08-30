// WarmStartCommand

class WarmStartCommand extends KmmBody {
    get MessageId() {
        return MessageId.WarmStartCommand;
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