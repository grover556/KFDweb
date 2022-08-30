// CapabilitiesResponse

class CapabilitiesResponse extends KmmBody {
    AlgorithmIds = [];
    OptionalServices = [];
    MessageIds = [];
    get MessageId() {
        return MessageId.CapabilitiesResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {

    }
    Parse(contents) {
        let numAlgos = contents[0];
        for (var i=0; i<numAlgos; i++) {
            this.AlgorithmIds.push(contents[i + 1]);
        }

        let numOs = contents[numAlgos + 1];
        for (var j=0; j<numOs; j++) {
            this.OptionalServices.push(contents[numAlgos + 1 + j]);
        }

        let numMids = contents[numAlgos + numOs + 2];
        for (var k=0; k<numMids; k++) {
            this.MessageIds.push(contents[numAlgos + numOs + 3 + k]);
        }
    }
}