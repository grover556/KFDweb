// KeyAssignmentResponse

class KeyAssignmentResponse extends KmmBody {
    KeyAssignmentId;
    SLN;
    get MessageId() {
        return MessageId.KeyAssignmentResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        //page 121 on TIA
    }
    Parse(contents) {

    }
}