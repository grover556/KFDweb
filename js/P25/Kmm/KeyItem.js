//KeyItem

class KeyItem {
    #_sln;
    #_keyId;
    #_key;
    get SLN() {
        return this.#_sln;
    }
    set SLN(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_sln = value;
    }
    get KeyId() {
        return this.#_keyId;
    }
    set KeyId(value) {
        if (value < 0 || value > 0xFFFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keyId = value;
    }
    get Key() {
        return this.#_key;
    }
    set Key(value) {
        if (value == null) {
            throw "ArgumentNullException";
        }
        this.#_key = value;
    }
    KEK;
    Erase;
    constructor() {
        this.KEK = false;
        this.Erase = false;
    }
    ToBytes() {
        //let contents = new Uint8Array(5 + this.Key.length);
        let contents = [5];

        /* key format */
        //BitArray keyFormat = new BitArray(8, false);
        //keyFormat.Set(7, KEK);
        //keyFormat.Set(5, Erase);
        //keyFormat.CopyTo(contents, 0);
        
        //let keyFormat = "00000" + (this.Erase ? "1":"0") + "0" + (this.KEK ? "1":"0");
        //let keyFormat = "00000" + Number(this.Erase) + "0" + Number(this.KEK);
        //console.log(keyFormat);

        let temp = [0,0,0,0,0,0,0,0];
        temp[7] = Number(this.KEK);
        temp[5] = Number(this.Erase);
        let keyFormat = parseInt(temp.reverse().join(""), 2);

        contents[0] = keyFormat;

        /* sln */
        contents[1] = this.SLN >>> 8;
        contents[2] = this.SLN & 0xFF;

        /* key id */
        contents[3] = this.KeyId >>> 8;
        contents[4] = this.KeyId & 0xFF;

        contents = contents.concat(this.Key);

        return contents;

        /*
        // Having problems with bit shifting
        let temp1 = this.SLN.toString(16).padStart(4, "0");
        contents[1] = parseInt(temp1.substr(0, 2), 16);
        contents[2] = parseInt(temp1.substr(2, 2), 16);

        let temp2 = this.KeyId.toString(16).padStart(4, "0");
        contents[3] = parseInt(temp2.substr(0, 2), 16);
        contents[4] = parseInt(temp2.substr(2, 2), 16);
        */

        /* key */ 
        //Array.Copy(Key, 0, contents, 5, Key.length);
        //contents = contents.concat(this.Key);
/*
        this.Key.forEach(c => {
            contents.push(parseInt(c, 16));
        });
*/
/*
        for (var i=0; i<this.Key.length; i++) {
            contents.push(parseInt(this.Key[i], 16));
        }
*/
/*
        this.Key.forEach((val) => {
            //contents.push(parseInt(val, 16));
            contents.push(val);
        });
*/
        //return contents;
    }
    Parse(contents, keyLength) {
        if (contents.length < 5) {
            throw "ArgumentOutOfRangeException";
        }

        let expectedContentsLength = 5 + keyLength;

        if (contents.length != expectedContentsLength) {
            throw "ArgumentOutOfRangeException";
        }

        /* key format */
        this.KEK = (contents[0] & 0x80) == 1;
        this.Erase = (contents[0] & 0x20) == 1;

        /* sln */
        this.SLN |= contents[1] << 8;
        this.SLN |= contents[2];

        /* key id */
        this.KeyId |= contents[3] << 8;
        this.KeyId |= contents[4];

        /* key */
        this.Key = contents.slice(5);
    }
}