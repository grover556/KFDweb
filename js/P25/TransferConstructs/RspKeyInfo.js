//RspKeyInfo

class RspKeyInfo {
    #_keysetId;
    #_sln;
    #_algorithmId;
    #_keyId;
    #_reservedField;
    get KeysetId() {
        return this.#_keysetId;
    }
    set KeysetId(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetId = value;
    }
    get Sln() {
        return this.#_sln;
    }
    set Sln(value) {
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
}