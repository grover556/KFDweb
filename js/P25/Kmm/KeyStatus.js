//KeyStatus

class KeyStatus {
    #_algorithmId;
    #_keyId;
    #_status;
    get AlgorithmId() {
        return this.#_algorithmId;
    }
    set AlgorithmId(val) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_algorithmId = val;
    }
    get KeyId() {
        return this.#_keyId;
    }
    set KeyId(val) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keyId = val;
    }
    get Status() {
        return this.#_status;
    }
    set Status(val) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_status = val;
    }
    ToBytes() {
        //let contents = new Uint8Array(4);
        let contents = [4];

        /* algorithm id */
        contents[0] = this.AlgorithmId;

        /* key id */
        contents[1] = this.KeyId >>> 8;
        contents[2] = this.KeyId & 0xFF;

        /* status */
        contents[3] = this.Status;

        return contents;
    }
    Parse(contents) {
        if (contents.length != 4) {
            throw "ArgumentOutOfRangeException";
        }

        /* algorithm id */
        this.AlgorithmId = contents[0];

        /* key id */
        this.KeyId |= contents[1] << 8;
        this.KeyId |= contents[2];

        /* status */
        this.Status = contents[3];
    }
}