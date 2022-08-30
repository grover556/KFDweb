//CmdKeyItem

class CmdKeyItem {
    #_keysetId;
    #_sln;
    #_algorithmId;
    #_keyId;
    #_key = [];
    UseActiveKeyset;
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
    IsKek;
    get KeyId() {
        return this.#_keyId;
    }
    set KeyId(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keyId = value;
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
    get Key() {
        return this.#_key;
    }
    set Key(value) {
        if (value == null) {
            throw "ArgumentNullException";
        }
        this.#_key = value;
    }
    constructor(useActiveKeyset, keysetId, sln, isKek, keyId, algorithmId, key) {
        if (useActiveKeyset === undefined) {
            this.Key = [];
        }
        else {
            this.UseActiveKeyset = useActiveKeyset;
            this.KeysetId = keysetId;
            this.Sln = sln;
            this.IsKek = isKek;
            this.KeyId = keyId;
            this.AlgorithmId = algorithmId;
            this.Key = key;
        }
    }
    ToString() {
        return "UseActiveKeyset: " +  this.UseActiveKeyset + ", KeysetId: " + this.KeysetId + ", Sln: " + this.Sln + ", IsKek: " + this.IsKek + ", KeyId: " + this.KeyId + ", AlgorithmId: " + this.AlgorithmId + ", Key: " + BCTS(this.Key).join("-");
    }
}