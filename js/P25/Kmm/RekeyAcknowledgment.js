//RekeyAcknowledgment

class RekeyAcknowledgment extends KmmBody {
    MessageIdAcknowleged;
    NumberOfItems;
    Keys = [];
    get MessageId() {
        return MessageId.RekeyAcknowledgment;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        let contents = [];

        /* message id */
        contents.push(this.MessageIdAcknowleged);

        /* number of items */
        contents.push(this.NumberOfItems);

        /* items */
        this.Keys.forEach((status) => {
            contents = contents.concat(status.ToBytes());
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
        else if (((this.NumberOfItems * 4) % (contents.length - 2)) == 0) {
            for (var i=0; i<this.NumberOfItems; i++) {
                let status = [4];
                //Array.Copy(contents, 2 + (i * 4), status, 0, 4);
                //status = contents.splice(2 + (i * 4), 2 + (i * 4) + 4);
                status[0] = contents[2 + (i * 4) + 0];
                status[1] = contents[2 + (i * 4) + 1];
                status[2] = contents[2 + (i * 4) + 2];
                status[3] = contents[2 + (i * 4) + 3];
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