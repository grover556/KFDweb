//KeyInfo

class KeyInfo {
    #_keySetId;
    #_sln;
    #_algorithmId;
    #_keyId;
    get KeySetId() {
        return this.#_keySetId;
    }
    set KeySetId(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keySetId = value;
    }
    get SLN() {
        return this.#_sln;
    }
    set SLN(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_sln = value;
    }
    get AlgorithmId() {
        return this.#_algorithmId;
    }
    set AlgorithmId(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_algorithmId = value;
    }
    get KeyId() {
        return this.#_keyId;
    }
    set KeyId(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keyId = value;
    }
    ToBytes() {
        let contents = [6];

        /* keyset id */
        contents[0] = this.KeySetId;

        /* sln */
        contents[1] = this.SLN >>> 8;
        contents[2] = this.SLN & 0xFF;

        /* algorithm id */
        contents[3] = this.AlgorithmId;

        /* key id */
        contents[4] = this.KeyId >>> 8;
        contents[5] = this.KeyId & 0xFF;

        return contents;
    }
    Parse(contents) {
        if (contents.length != 6) {
            throw "ArgumentOutOfRangeException";
        }

        /* keyset id */
        this.KeySetId = contents[0];

        /* sln */
        this.SLN |= contents[1] << 8;
        this.SLN |= contents[2];

        /* algorithm id */
        this.AlgorithmId = contents[3];

        /* key id */
        this.KeyId |= contents[4] << 8;
        this.KeyId |= contents[5];
    }
}