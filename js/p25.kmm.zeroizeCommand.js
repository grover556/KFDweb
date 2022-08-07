//ZeroizeCommand

class ZeroizeCommand {
    get MessageId() {
        return MessageId.ZeroizeCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ZeroizeCommand() {

    }
    get ToBytes() {
        let contents = [0];

        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}