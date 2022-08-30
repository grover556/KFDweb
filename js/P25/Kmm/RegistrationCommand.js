// RegistrationCommand

class RegistrationCommand extends KmmBody {
    get MessageId() {
        return MessageId.RegistrationCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        throw "NotImplementedException";
    }
}