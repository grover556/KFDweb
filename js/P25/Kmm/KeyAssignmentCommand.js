// KeyAssignmentCommand

class KeyAssignmentCommand extends KmmBody {
    #_keyAssignmentType;
    KeyAssignments = [];
    get KeyAssignmentType() {
        return this.#_keyAssignmentType;
    }
    set KeyAssignmentType(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keyAssignmentId = value;
    }
    get MessageId() {
        return MessageId.KeyAssignmentCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        //page 121 on TIA
    }
    Parse(contents) {

    }
}