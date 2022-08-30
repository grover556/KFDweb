// DeleteKeyCommand

class DeleteKeyCommand extends KmmBody {
/*
    #_keyId = [];
    get KeyId() {
        return this.#_keyId;
    }
    set KeyId(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keyId.push(value);
    }
*/
    KeyItems = [];
    get MessageId() {
        return MessageId.DeleteKeyCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        let contents = [];
/*
        contents[0] = this.KeyId.length;

        for (var i=0; i< this.KeyItems.length; i++) {
            contents[(i * 3) + 1] = this.AlgorithmId;
            contents[(i * 3) + 2] = this.KeyId[i] >>> 8;
            contents[(i * 3) + 3] = this.KeyId[i] & 0xFF;
        }
*/
        contents[0] = this.KeyItems.length;

        for (var i=0; i< this.KeyItems.length; i++) {
            contents[(i * 3) + 1] = this.KeyItems[i].AlgorithmId;
            contents[(i * 3) + 2] = this.KeyItems[i].KeyId >>> 8;
            contents[(i * 3) + 3] = this.KeyItems[i].KeyId & 0xFF;
        }

        return contents;
    }
    Parse(contents) {

    }
}