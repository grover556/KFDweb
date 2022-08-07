//KeyInfo

class KeyInfo {
    #_keySetId;
    #_sln;
    #_algorithmId;
    #_keyId;
    get KeySetId() {
        return this.#_keySetId;
    }
    set KeySetId(val) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keySetId = val;
    }
    get SLN() {
        return this.#_sln;
    }
    set SLN(val) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_sln = val;
    }
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
    get ToBytes() {
        let contents = new Uint8Array(6);

        /* keyset id */
        contents[0] = this.KeySetId;

        /* sln */
        contents[1] = this.SLN >> 8;
        contents[2] = this.SLN;

        /* algorithm id */
        contents[3] = this.AlgorithmId;

        /* key id */
        contents[4] = this.KeyId >> 8;
        contents[5] = this.KeyId;

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