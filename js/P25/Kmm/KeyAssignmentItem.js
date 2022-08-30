// KeyAssignmentItem

class KeyAssignmentItem {
    #_keyAssignmentId;
    #_sln;
    get KeyAssignmentId() {
        return this.#_keyAssignmentId;
    }
    set KeyAssignmentId(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keyAssignmentId = value;
    }
    get Sln() {
        return this.#_sln;
    }
    set Sln(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_sln = value;
    }
    ToBytes() {
        //page 119 on TIA
    }
    Parse(contents) {

    }
}