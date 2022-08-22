//ZeroizeResponse

class ZeroizeResponse extends KmmBody {
    get MessageId() {
        return MessageId.ZeroizeResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ZeroizeResponse() {

    }
    get ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length != 0) {
            throw "ArgumentOutOfRangeException";
        }
    }
}