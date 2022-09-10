//RspRsiInfo

class RspRsiInfo {
    #_rsi;
    #_mn;
    #_status;
    Mr = false;
    get RSI() {
        return this.#_rsi;
    }
    set RSI(value) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_rsi = value;
    }
    get MN() {
        return this.#_mn;
    }
    set MN(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_mn = value;
    }
    get Status() {
        return this.#_status;
    }
    set Status(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_status = value;
    }
}