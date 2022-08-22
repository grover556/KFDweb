//CmdKeyItem

class CmdKeyItem {
    #_keysetId;
    #_sln;
    #_algorithmId;
    #_keyId;
    #_key;
    UseActiveKeyset;
    get KeysetId() {
        return this.#_keysetId;
    }
    set KeysetId(val) {
        if (val < 0 || val > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetId = val;
    }
    get Sln() {
        return this.#_sln;
    }
    set Sln(val) {
        if (val < 0 || val > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_sln = val;
    }
    IsKek;
    get KeyId() {
        return this.#_keyId;
    }
    set KeyId(val) {
        if (val < 0 || val > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keyId = val;
    }
    get AlgorithmId() {
        return this.#_algorithmId;
    }
    set AlgorithmId(val) {
        if (val < 0 || val > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_algorithmId = val;
    }
    get Key() {
        return this.#_key;
    }
    set Key(val) {
        if (val == null) {
            throw "ArgumentNullException";
        }
        this.#_key = val;
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