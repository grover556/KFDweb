//InventoryResponseListRsiItems

class InventoryResponseListRsiItems extends KmmBody {
    RsiItems = [];
    get MessageId() {
        return MessageId.InventoryResponse;
    }
    get InventoryType() {
        return InventoryType.ListRsiItems;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        //let contents = new Uint8Array();
        let contents = [];

        /* inventory type */
        contents.push(this.InventoryType);

        /* number of items */
        contents.push((this.RsiItems.length >>> 8) & 0xFF);
        contents.push(this.RsiItems.length & 0xFF);

        /* items */
        this.RsiItems.forEach((item) => {
            contents = contents.concat(item.ToBytes());
        });

        return contents;
    }
    Parse(contents) {
        if (contents.length < 2) {
            throw "ArgumentOutOfRangeException";
        }

        /* inventory type */
        if (contents[0] != this.InventoryType) {
            throw "inventory type mismatch";
        }

        /* number of items */
        let NumberOfItems = 0;
        NumberOfItems |= contents[1] << 8;
        NumberOfItems |= contents[2];

        /* items */
        if ((NumberOfItems == 0) && (contents.length == 3)) {
            return;
        }
        else if (((NumberOfItems * 5) % (contents.length - 3)) == 0) {
            for (var i=0; i<NumberOfItems; i++) {
                /*
                //let info = new Uint8Array(5);
                let start = 3 + (i * 5);
                let end = 3 + (i * 5) + 5;
                //Array.Copy(contents, 3 + (i * 5), info, 0, 5);
                let info = contents.slice(start, end);
                */
                let info = [5];
                info[0] = contents[3 + (i * 5) + 0];
                info[1] = contents[3 + (i * 5) + 1];
                info[2] = contents[3 + (i * 5) + 2];
                info[3] = contents[3 + (i * 5) + 3];
                info[4] = contents[3 + (i * 5) + 4];
                console.log("info", BCTS(info).join("-"));
                let info2 = new RsiItem();
                console.log("info2", info2);
                info2.Parse(info);
                this.RsiItems.push(info2);
            }
        }
        else {
            throw "number of items field and length mismatch";
        }
    }
}