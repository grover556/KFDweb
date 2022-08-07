//RekeyAcknowledgment

class RekeyAcknowledgment {
    MessageIdAcknowleged;
    NumberOfItems;
    Keys;
    get MessageId() {
        return MessageId.RekeyAcknowledgment;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    RekeyAcknowledgment() {
        this.Keys = [];
    }
    get ToBytes() {
        let contents = [];

        /* message id */
        contents.push(this.MessageIdAcknowleged);

        /* number of items */
        contents.push(this.NumberOfItems);

        /* items */
        this.Keys.foreach(status => {
            contents.push(status.ToBytes());
        });

        return contents();
    }
    Parse(contents) {
        if (contents.length < 2) {
            throw "ArgumentOutOfRangeException";
        }

        /* message id */
        this.MessageIdAcknowleged = contents[0];

        /* number of items */
        this.NumberOfItems |= contents[1];

        /* items */
        if ((this.NumberOfItems == 0) && (contents.length == 2)) {
            return;
        }
        else if (((this.NumberOfItems * 4) % (contents.Length - 2)) == 0) {
            for (var i=0; i<this.NumberOfItems; i++) {
                let status = [];
                //Array.Copy(contents, 2 + (i * 4), status, 0, 4);
                status = contents.splice(2 + (i * 4), 2 + (i * 4) + 4);
                let status2 = new KeyStatus();
                status2.Parse(status);
                this.Keys.push(status2);
            }
        }
        else {
            throw "number of items field and length mismatch";
        }
    }
}