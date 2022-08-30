// RspChangeoverInfo

class RspChangeoverInfo {
    #_keysetIdSuperseded;
    #_keysetIdActivated;
    get KeysetIdSuperseded () {
        return this.#_keysetIdSuperseded;
    }
    set KeysetIdSuperseded (value) {
        if (value < 0x00 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetIdSuperseded = value;
    }
    get KeysetIdActivated () {
        return this.#_keysetIdActivated;
    }
    set KeysetIdActivated (value) {
        if (value < 0x00 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetIdActivated = value;
    }
}