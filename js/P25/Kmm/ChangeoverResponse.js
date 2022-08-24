//ChangeoverResponse

class ChangeoverResponse extends KmmBody {
    KeysetIdSuperseded;
    KeysetIdActivated;
    get MessageId() {
        return MessageId.ChangeoverResponse;
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
        if (contents.length < 1) {
            throw "ArgumentOutOfRangeException";
        }
        
        /* changeover responses */
        var responses = contents[0];
        
        for (var i=0; i<responses; i++) {
            /* superseded keyset */
            this.KeysetIdSuperseded = contents[1 + i * 2];
            
            /* activated keyset */
            this.KeysetIdActivated = contents[2 + i * 2];
        }
    }
}