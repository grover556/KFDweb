//LoadConfigResponse

class LoadConfigResponse extends KmmBody {
    RSI;
    MN;
    Status;
    get MessageId() {
        return MessageId.LoadConfigResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    LoadConfigResponse() {

    }
    get ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length != 6) {
            throw "ArgumentOutOfRangeException";
        }
        /* kmf rsi */
        this.RSI |= contents[0] << 16;
        this.RSI |= contents[1] << 8;
        this.RSI |= contents[2];

        /* message number */
        this.MN |= contents[3] << 8;
        this.MN |= contents[4];

        /* status */
        this.Status |= contents[5];
    }
}