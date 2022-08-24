//ZeroizeCommand

class ZeroizeCommand extends KmmBody {
    get MessageId() {
        return MessageId.ZeroizeCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        let contents = [0];

        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}