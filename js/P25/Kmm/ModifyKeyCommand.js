//ModifyKeyCommand

class ModifyKeyCommand {
    #_keysetId;
    #_algorithmId;
    get KeysetId() {
        return this.#_keysetId;
    }
    set KeysetId(val) {
        if (val < 0 || val > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetId = val;
    }
    get AlgorithmId() {
        return this.#_algorithmId;
    }
    set AlgorithmId(val) {
        if (val < 0 || val > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_algorithmId = val;
    }
    KeyItems;
    get MessageId() {
        return MessageId.ModifyKeyCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ModifyKeyCommand() {
        this.KeyItems = [];
    }
    get ToBytes() {
        let keys = [];

        this.KeyItems.forEach(key => {
            //keys.AddRange(key.ToBytes());
            keys = keys.concat(key.ToBytes());
        });

        let contents = [];

        /* decryption instruction format */
        contents.push(0x00);

        /* extended decryption instruction format */
        contents.push(0x00);

        /* algorithm id */
        contents.push(0x80);

        /* key id */
        contents.push(0x00);
        contents.push(0x00);

        /* keyset id */
        contents.push(this.KeysetId);

        /* algorithm id */
        contents.push(this.AlgorithmId);

        /* key length */
        contents.push(this.KeyItems[0].Key.length);

        /* number of keys */
        contents.push(this.KeyItems.length);

        /* keys */
        contents = contents.concat(keys);

        return contents;
    }
    Parse(contents) {
        if (contents.length < 9) {
            throw "length mismatch - expected at least 9, got " + contents.length.toString();
        }

        /* keyset id */
        this.KeysetId = contents[5];

        /* algorithm id */
        this.AlgorithmId = contents[6];

        /* key length */
        let keyCount = contents[8];

        /* keys */
        if ((keyCount == 0) && (contents.length == 9)) {
            return;
        }
        else if (((keyCount * (5 + keyLength)) % (contents.length - 9)) == 0) {
            for (var i=0; i<keyCount; i++) {
                let item = [5 + keyLength];
                //Array.Copy(contents, 9 + (i * (5 + keyLength)), item, 0, 5 + keyLength);
                item = contents.slice(9 + (i * (5 + keyLength)), 5 + keyLength + 9 + (i * (5 + keyLength)));
                let item2 = new KeyItem();
                item2.Parse(item, keyLength);
                this.KeyItems.push(item2);
            }
        }
        else {
            throw "number of keys field and length mismatch";
        }
    }
}