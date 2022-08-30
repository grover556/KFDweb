// KeysetStatus

class KeysetStatus {
    #_keysetId;
    #_status;
    get KeysetId() {
        return this.#_keysetId;
    }
    set KeysetId(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetId = value;
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
    ToBytes() {

    }
    Parse(contents) {
        this.KeysetId = contents[0];
        this.Status = contents[1];
    }
}