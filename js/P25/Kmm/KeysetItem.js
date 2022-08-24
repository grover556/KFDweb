//KeysetItem

class KeysetItem {
    #_keysetId;
    KeysetName;
    KeysetType;
    ActivationDateTime;
    #_reservedField;
    get KeysetId() {
        return this.#_keysetId;
    }
    set KeysetId(val) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetId = val;
    }
    get ReservedField() {
        return this.#_reservedField;
    }
    set ReservedField(val) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_reservedField = val;
    }
    ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}