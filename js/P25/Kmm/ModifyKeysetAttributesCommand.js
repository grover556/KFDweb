// ModifyKeysetAttributesCommand

const { ENGINE_METHOD_PKEY_ASN1_METHS } = require("constants");

class ModifyKeysetAttributesCommand extends KmmBody {
    KeysetType;
    DateTime;
    #_name;
    #_keysetId;
    get Name() {
        return this.#_name;
    }
    set Name(value) {
        if (value.length > 31) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_name = value;
    }
    get KeysetId() {
        return this.#_keysetId;
    }
    set KeysetId(value) {
        if (value < 0 || value > 0xFF) {
            throw "ArgumentOutOfRangeException";
        }
        this.#_keysetId = value;
    }
    get MessageId() {
        return MessageId.ModifyKeysetAttributesCommand;
    }
    get ResponseKind() {
        return ResponseKind.Immediate;
    }
    ToBytes() {
        /*
            number of keysets
            keyset format, T R DT N N N N N (5), 0=TEK 1=KEK, 0, 0/1 for datetime present, keyset name 0 to 31
            keyset id, "Keyset ID" primative
            reserved, "00000000"
            reserved optional, present if bit 6 of Keyset Format is set to 1
            reserved optional
            reserved optional
            date
            date
            time
            time
            time
            keyset name [i = 0...31 octets]
        */

        let contents = [];

        contents[0] = 1;
        
        let format = new Array(8).fill(0);
        if (this.KeysetType == "KEK") {
            format[0] = 1;
        }
        if (this.DateTime !== undefined) {
            format[2] = 1;
        }
        if (this.Name !== undefined) {
            let nameOctets = Array.from(this.Name.length.toString(2).padStart(5, "0"));
            format.splice(3, 5, ...nameOctets);
        }
        contents[1] = parseInt(format.join("").padStart(8, "0"), 2);
        contents[2] = this.KeysetId;
        contents[3] = 0x00;

        if (this.DateTime !== undefined) {
            let dayStr = this.DateTime.getDate().toString(2).padStart(4, "0");
            let monStr = (this.DateTime.getMonth() + 1).toString(2).padStart(5, "0");
            let yearStr = this.DateTime.getFullYear().substring(2, 4).toString(2).padStart(7, "0");
            let dateString = monStr + dayStr + yearStr;

            let hourStr = this.DateTime.getHours().toString(2).padStart(5, "0");
            let minStr = this.DateTime.getMinutes().toString(2).padStart(5, "0");
            let secStr = this.DateTime.getSeconds().toString(2).padStart(6, "0");
            let timeString = hourStr + minStr + secStr + "0000000";

            let dateTimeString = dateString + timeString;
            let dateTimeArray = Array.from(dateTimeString);

            for (var i=0; i<contents.length; i++) {
                contents.push(parseInt(dateTimeArray.splice(0, 8).join(""), 2));
            }
        }
/*
        let keysetNameArray = [this.Name.length];
        for (var i=0; i< this.Name.length; i++) {
            keysetNameArray[i] = this.Name.charCodeAt(i);
        }
*/
        if (this.Name !== undefined) {
            for (var i=0; i< this.Name.length; i++) {
                contents.push(this.Name.charCodeAt(i))
            }
        }

        return contents;
    }
    Parse(contents) {
        
    }
}