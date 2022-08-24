//ChangeoverCommand

class ChangeoverCommand extends KmmBody {
    // Only supports a single changeover at this time, however response handles multiple keysets
    #_keysetIdSuperseded;
    #_keysetIdActivated;
    get KeysetIdSuperseded() {
        return this.#_keysetIdSuperseded;
    }
    set KeysetIdSuperseded(val) {
        if (value < 1 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        _keysetIdSuperseded = val;
    }
    get KeysetIdActivated() {
        return this.#_keysetIdActivated;
    }
    set KeysetIdActivated(val) {
        if (value < 1 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        _keysetIdActivated = val;
    }
    get MessageId() {
        return MessageId.ChangeoverCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        var contents = new Uint8Array(3);
        
        /* number of instructions */
        contents[0] = 0x01;
        
        /* superseded keyset */
        contents[1] = this.KeysetIdSuperseded;
        
        /* activated keyset */
        contents[2] = this.KeysetIdActivated;
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}