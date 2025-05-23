//LoadConfigCommand

class LoadConfigCommand extends KmmBody {
    #_kmfRsi;
    #_mnp;
    get KmfRsi() {
        return this.#_kmfRsi;
    }
    set KmfRsi(value) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_kmfRsi = value;
    }
    get MessageNumberPeriod() {
        return this.#_mnp;
    }
    set MessageNumberPeriod(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_mnp = value;
    }
    get MessageId() {
        return MessageId.LoadConfigCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        let contents = [5];

        /* kmf rsi */
        contents[0] = (this.KmfRsi >>> 16);
        contents[1] = (this.KmfRsi >>> 8) & 0xFF;
        contents[2] = (this.KmfRsi & 0xFF);

        /* message number period */
        contents[3] = (this.MessageNumberPeriod >>> 8);
        contents[4] = (this.MessageNumberPeriod & 0xFF);
console.log(contents);
        return contents;
    }
    Parse(contents) {
        if (contents.length != 5) {
            throw "ArgumentOutOfRangeException";
        }
        
        /* kmf rsi */
        this.KmfRsi |= contents[0] << 16;
        this.KmfRsi |= contents[1] << 8;
        this.KmfRsi |= contents[2];

        /* message number period */
        this.MessageNumberPeriod |= contents[3] << 8;
        this.MessageNumberPeriod |= contents[4];
    }
}