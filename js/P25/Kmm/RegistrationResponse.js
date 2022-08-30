// RegistrationResponse

class RegistrationResponse extends KmmBody {
    get MessageId() {
        return MessageId.RegistrationResponse;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}