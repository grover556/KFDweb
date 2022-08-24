//ChangeRsiResponse

class ChangeRsiResponse extends KmmBody {
    ChangeSequence;
    RsiOld;
    RsiNew;
    Status;
    get MessageId() {
        return MessageId.ChangeRsiResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    constructor() {
        
    }
    ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length != 8) {
            throw "ArgumentOutOfRangeException";
        }
        
        // Change sequence/instruction
        this.ChangeSequence = contents[0];
        
        // Old RSI
        this.RsiOld |= contents[1] << 16;
        this.RsiOld |= contents[2] << 8;
        this.RsiOld |= contents[3];
        
        // New RSI
        this.RsiNew |= contents[4] << 16;
        this.RsiNew |= contents[5] << 8;
        this.RsiNew |= contents[6];
        
        // Status
        this.Status |= contents[7];
    }
}