//RsiItem

class RsiItem {
    #_rsi;
    #_messageNumber;
    get RSI() {
        return this.#_rsi;
    }
    set RSI(value) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_rsi= value;
    }
    get MessageNumber() {
        return this.#_messageNumber;
    }
    set MessageNumber(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_messageNumber= value;
    }
    ToBytes() {
        let contents = [5];

        /* rsi */
        contents[0] = this.MessageNumber >>> 16;
        contents[1] = this.MessageNumber >>> 8;
        contents[2] = this.MessageNumber & 0xFF;

        /* message number */
        contents[3] = this.MessageNumber >>> 8;
        contents[4] = this.MessageNumber & 0xFF;

        return contents;
    }
    Parse(contents) {
        if (contents.length != 5) {
            throw "ArgumentOutOfRangeException";
        }

        /* rsi */
        this.RSI |= contents[0] << 16;
        this.RSI |= contents[1] << 8;
        this.RSI |= contents[2];

        /* message number */
        this.MessageNumber |= contents[3] << 8;
        this.MessageNumber |= contents[4];

    }
}