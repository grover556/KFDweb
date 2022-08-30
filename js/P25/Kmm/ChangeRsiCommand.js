//ChangeRsiCommand

class ChangeRsiCommand extends KmmBody {
    #_changeSequence;
    #_rsiOld;
    #_rsiNew;
    #_messageNumber;
    get RsiOld() {
        return this.#_rsiOld;
    }
    set RsiOld(value) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_rsiOld = value;
    }
    get RsiNew() {
        return this.#_rsiNew;
    }
    set RsiNew(value) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_rsiNew = value;
    }
    get MessageNumber() {
        return this.#_messageNumber;
    }
    set MessageNumber(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_messageNumber = value;
    }
    get ChangeSequence() {
        return this.#_changeSequence;
    }
    set ChangeSequence(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_changeSequence = value;
    }
    get MessageId() {
        return MessageId.ChangeRsiCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        var contents = new Uint8Array(9);
        
        // Change sequence/instruction
        contents[0] = 0x01;
        
        // Old RSI
        contents[1] = this.RsiOld >>> 16;
        contents[2] = this.RsiOld >>> 8;
        contents[3] = this.RsiOld & 0xFF;
        
        // New RSI
        contents[4] = this.RsiNew >>> 16;
        contents[5] = this.RsiNew >>> 8;
        contents[6] = this.RsiNew & 0xFF;
        
        // Message number
        contents[7] = this.MessageNumber >>> 8;
        contents[8] = this.MessageNumber & 0xFF;
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}