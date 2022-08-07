//InventoryResponseListActiveKsetIds

class InventoryResponseListActiveKsetIds {
    NumberOfItems;
    KsetIds;
    get MessageId() {
        return this.MessageId.InventoryResponse;
    }
    get InventoryType() {
        return this.InventoryType.ListActiveKsetIds;
    }
    get ResponseKind() {
        return ResponseKind.None;
    }
    get ToBytes() {
        var contents = new Uint8Array(4);

        /* inventory type */
        contents[0] = (InventoryType);

        /* number of items */
        contents[1] = ((this.KsetIds.length >> 8) & 0xFF);
        contents[2] = (this.KsetIds.length & 0xFF);

        /* items */
        contents.AddRange(this.KsetIds);

        return contents;
    }
    Parse(contents) {
        if (contents.length < 3) {
            throw "length mismatch - expected at least 3, got " + contents.length;
        }

        /* inventory type */
        if (contents[0] != InventoryType) {
            throw "inventory type mismatch";
        }

        /* number of items */
        this.NumberOfItems |= contents[1] << 8;
        this.NumberOfItems |= contents[2];

        /* items */
        if ((this.NumberOfItems == 0) && (contents.length == 3)) {
            return;
        }
        else if (this.NumberOfItems == (contents.length - 3)) {
            for (var i=0; i<this.NumberOfItems; i++) {
                this.KsetIds.push(contents[3 + i]);
            }
        }
        else {
            throw "number of items field and length mismatch";
        }
    }
}