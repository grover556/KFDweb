//CapabilitiesResponse

class CapabilitiesResponse extends KmmBody {
    Algorithms = [];
    OptionalServices = [];
    MessageIds = [];
    get MessageId() {
        return MessageId.CapabilitiesResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length < 3) {
            throw "ArgumentOutOfRangeException";
        }
        
        /* number of algorithms */
        let NumberOfAlgorithms = 0;
        NumberOfAlgorithms = contents[0];
        for (var i=0; i<NumberOfAlgorithms; i++) {
            this.Algorithms.push(contents[1 + i]);
        }

        /* number of optional services */
        let NumberOfOptionalServices = 0;
        NumberOfOptionalServices = contents[1 + NumberOfAlgorithms];
        for (var i=0; i<NumberOfOptionalServices; i++) {
            this.OptionalServices.push(contents[2 + NumberOfAlgorithms + i]);
        }

        /* number of message ids */
        let NumberOfMessageIds = 0;
        NumberOfMessageIds = contents[2 + NumberOfAlgorithms + NumberOfOptionalServices];
        for (var i=0; i<NumberOfMessageIds; i++) {
            this.MessageIds.push(contents[3 + NumberOfAlgorithms + NumberOfOptionalServices + i]);
        }
    }
}