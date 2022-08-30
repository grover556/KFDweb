//RspKeysetInfo

class RspKeysetInfo {
    #_keysetId;
    KeysetName;
    KeysetType;
    ActivationDateTime;
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
    get ReservedField() {
        return this.#_reservedField;
    }
    set ReservedField(value) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_reservedField = value;
    }
}