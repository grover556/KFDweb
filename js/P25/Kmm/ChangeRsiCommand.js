//ChangeRsiCommand

class ChangeRsiCommand {
    #_changeSequence;
    #_rsiOld;
    #_rsiNew;
    #_messageNumber;
    constructor(changeSequence, rsiOld, rsiNew, messageNumber) {
        this.#_changeSequence = changeSequence;
        this.#_rsiOld = rsiOld;
        this.#_rsiNew = rsiNew;
        this.#_messageNumber = messageNumber;
    }
    get RsiOld() {
        return this.#_rsiOld;
    }
    set RsiOld(val) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        _rsiOld = val;
    }
    get RsiNew() {
        return this.#_rsiNew;
    }
    set RsiNew(val) {
        if (value < 0 || value > 0xFFFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        _rsiNew = val;
    }
    get MessageNumber() {
        return this.#_messageNumber;
    }
    set MessageNumber(val) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        _messageNumber = val;
    }
    get ChangeSequence() {
        return this.#_changeSequence;
    }
    set ChangeSequence(val) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_changeSequence = val;
    }
    get MessageId() {
        return MessageId.ChangeRsiCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    get ToBytes() {
        var contents = new Uint8Array(9);
        
        // Change sequence/instruction
        contents[0] = 0x01;
        
        // Old RSI
        contents[1] = RsiOld >> 16;
        contents[2] = RsiOld >> 8;
        contents[3] = RsiOld;
        
        // New RSI
        contents[4] = RsiNew >> 16;
        contents[5] = RsiNew >> 8;
        contents[6] = RsiNew;
        
        // Message number
        contents[7] = MessageNumber >> 8;
        contents[8] = MessageNumber;
        
        return contents;
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}