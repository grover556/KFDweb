//InventoryResponseListActiveKeys

class InventoryResponseListActiveKeys {
    InventoryMarker;
    NumberOfItems;
    Keys;
    get MessageId() {
        return MessageId.InventoryResponse;
    }
    get InventoryType() {
        return InventoryType.ListActiveKeys;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    get ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length < 6) {
            throw "ArgumentOutOfRangeException";
        }

        /* inventory type */
        if (contents[0] != InventoryType) {
            throw "InventoryTypeMismatch";
        }

        /* inventory marker */
        this.InventoryMarker |= contents[1] << 16;
        this.InventoryMarker |= contents[2] << 8;
        this.InventoryMarker |= contents[3];

        /* number of items */
        this.NumberOfItems |= contents[4] << 8;
        this.NumberOfItems |= contents[5];

        if ((this.NumberOfItems == 0) && (contents.length == 6)) {
            return;
        }
        else if (((this.NumberOfItems * 6) % (contents.Length - 6)) == 0) {
            for (var i=0; i<this.NumberOfItems; i++) {
                var info = new Uint8Array(6);
                info[0] = contents[6 + (i * 6) + 0];
                info[1] = contents[6 + (i * 6) + 1];
                info[2] = contents[6 + (i * 6) + 2];
                info[3] = contents[6 + (i * 6) + 3];
                info[4] = contents[6 + (i * 6) + 4];
                info[5] = contents[6 + (i * 6) + 5];
                var info2 = new KeyInfo();
                info2.Parse(info);
                this.Keys.push(info2);
            }
        }
        else {
            throw "number of items field and length mismatch";
        }
    }
}