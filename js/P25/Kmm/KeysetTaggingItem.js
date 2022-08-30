//KeysetTaggingItem

class KeysetTaggingItem {
    #_keysetId;
    KeysetName;
    ActivationDateTime;
    get KeysetId() {
        return this.#_keysetId;
    }
    set KeysetId(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetId = value;
    }
    ToBytes() {
        
    }
    Parse(contents) {
        
    }
}