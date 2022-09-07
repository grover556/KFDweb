//InventoryResponseListInactiveKeyIds

class InventoryResponseListInactiveKeyIds extends KmmBody {
    NumberOfItems;
    Keys = [];
    get MessageId() {
        return MessageId.InventoryResponse;
    }
    get InventoryType() {
        return InventoryType.ListInactiveKeyIds;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    ToBytes() {
        throw "NotImplementedException";
    }
    Parse(contents) {
        if (contents.length < 6) {
            throw "ArgumentOutOfRangeException";
        }

        /* inventory type */
        if (contents[0] != this.InventoryType) {
            throw "InventoryTypeMismatch";
        }

        /* number of items */
        this.NumberOfItems |= contents[1] << 8;
        this.NumberOfItems |= contents[2];

        if ((this.NumberOfItems == 0) && (contents.length == 3)) {
            return;
        }
        else if (((this.NumberOfItems * 6) % (contents.length - 6)) == 0) {
            for (var i=0; i<this.NumberOfItems; i++) {
                let info = [6];
                info[0] = contents[6 + (i * 6) + 0];
                info[1] = contents[6 + (i * 6) + 1];
                info[2] = contents[6 + (i * 6) + 2];
                info[3] = contents[6 + (i * 6) + 3];
                info[4] = contents[6 + (i * 6) + 4];
                info[5] = contents[6 + (i * 6) + 5];
                let info2 = new KeyInfo();
                info2.Parse(info);
                this.Keys.push(info2);
            }
        }
        else {
            throw "number of items field and length mismatch";
        }
    }
}