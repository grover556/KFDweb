// DeleteKeysetCommand

class DeleteKeysetCommand extends KmmBody {
    #_keysetIds = [];
    get KeysetIds() {
        return this.#_keysetIds;
    }
    set KeysetIds(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetIds.push(value);
    }
    get MessageId() {
        return MessageId.DeleteKeysetCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        let contents = [];

        contents.push(this.KeysetIds.length);

        this.KeysetIds.forEach((ksid) => {
            contents.push(ksid);
        });

        return contents;
    }
    Parse(contents) {

    }
}